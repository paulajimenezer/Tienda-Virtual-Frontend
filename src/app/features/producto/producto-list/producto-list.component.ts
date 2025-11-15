import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Categoria } from '../../../shared/models/categoria.model';
import { Producto, ProductoCreate, ProductoUpdate } from '../../../shared/models/producto.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.scss']
})
export class ProductoListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = environment.apiUrl;
  private readonly authService = inject(AuthService);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);

  productos: Producto[] = [];
  private allProductos: Producto[] = [];
  private filteredProductos: Producto[] = [];
  categorias: Categoria[] = [];
  private categoriaNombreMap = new Map<string, string>();
  private serverFilterSnapshot = { nombre: '', categoria: '' };

  loading = false;
  saving = false;
  editingId: string | null = null;
  errorMessage = '';
  modalOpen = false;
  modalTitle = 'Nuevo producto';

  isAdmin = false;
  private currentUserId: string | null = null;

  filters = {
    nombre: '',
    categoria: '',
    activo: '',
    precioMin: '',
    precioMax: ''
  };

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoria_id: ['', Validators.required],
    usuario_id: ['', Validators.required],
    activo: [true]
  });

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id ?? null;
    this.isAdmin = this.authService.isAdmin();
    if (!this.isAdmin) {
      this.form.patchValue({ usuario_id: this.currentUserId ?? '' });
    }
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    const productos$ = this.buildProductosRequest();
    const categorias$ = this.categoriaService.list().pipe(
      catchError(err => {
        console.warn('No fue posible cargar las categorías para el filtro de productos.', err);
        return of(this.categorias);
      })
    );

    forkJoin({ productos: productos$, categorias: categorias$ }).subscribe({
      next: ({ productos, categorias }) => {
        this.categorias = categorias ?? [];
        this.categoriaNombreMap = new Map(
          this.categorias.map(categoria => [categoria.id, categoria.nombre])
        );
        const scopedProductos = this.enforceUserScope(productos ?? []);
        this.allProductos = scopedProductos;
        this.currentPage = 1;
        if ((this.filters.nombre.trim() || this.filters.categoria.trim()) && scopedProductos.length === 0) {
          this.errorMessage = 'No se encontraron productos con los filtros aplicados.';
        }
        this.applyFilters();
        this.loading = false;
        this.updateServerFilterSnapshot();
      },
      error: err => {
        this.errorMessage = 'No fue posible cargar los productos.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  private applyFilters(): void {
    const termNombre = this.filters.nombre.trim().toLowerCase();
    const categoriaFiltro = this.filters.categoria;
    const activoFiltro = this.filters.activo;
    const precioMin = parseFloat(this.filters.precioMin);
    const precioMax = parseFloat(this.filters.precioMax);

    this.filteredProductos = this.allProductos.filter(producto => {
      const matchesNombre = !termNombre || (producto.nombre ?? '').toLowerCase().includes(termNombre);
      const categoriaId = this.resolveCategoriaId(producto);
      const matchesCategoria = !categoriaFiltro || categoriaId === categoriaFiltro;
      const matchesActivo =
        activoFiltro === '' ||
        (activoFiltro === 'true' && producto.activo !== false) ||
        (activoFiltro === 'false' && producto.activo === false);
      const precio = Number(producto.precio ?? 0);
      const matchesPrecioMin = Number.isNaN(precioMin) || precio >= precioMin;
      const matchesPrecioMax = Number.isNaN(precioMax) || precio <= precioMax;
      return matchesNombre && matchesCategoria && matchesActivo && matchesPrecioMin && matchesPrecioMax;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredProductos.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.productos = this.filteredProductos.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    if (this.shouldRefetchFromServer()) {
      this.loadData();
    } else {
      this.applyFilters();
    }
  }

  clearFilters(): void {
    this.filters = { nombre: '', categoria: '', activo: '', precioMin: '', precioMax: '' };
    this.loadData();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  resetForm(): void {
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria_id: this.categorias[0]?.id ?? '',
      usuario_id: this.isAdmin ? '' : this.currentUserId ?? '',
      activo: true
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  openCreateModal(): void {
    this.editingId = null;
    this.modalTitle = 'Nuevo producto';
    this.resetForm();
    this.modalOpen = true;
  }

  edit(producto: Producto): void {
    this.editingId = producto.id;
    this.modalTitle = 'Editar producto';
    this.form.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      categoria_id: this.resolveCategoriaId(producto),
      usuario_id: (producto as unknown as { usuario_id?: string; id_usuario?: string }).usuario_id
        ?? (producto as unknown as { usuario_id?: string; id_usuario?: string }).id_usuario
        ?? this.currentUserId
        ?? '',
      activo: producto.activo ?? true
    });
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.resetForm();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

  const { nombre, descripcion, precio, stock, categoria_id, usuario_id, activo } = this.form.value;
  const nombreValor = (nombre ?? '').toString().trim();
  const descripcionValor = (descripcion ?? '').toString().trim();
  const categoriaId = (categoria_id ?? '').toString().trim();
  const usuarioIdFromForm = (usuario_id ?? '').toString().trim();
  const usuarioId = usuarioIdFromForm || (this.currentUserId ?? '');
    const precioValor = precio == null ? NaN : Number(precio);
    const stockValor = stock == null ? NaN : Number(stock);

    if (!nombreValor || Number.isNaN(precioValor) || Number.isNaN(stockValor) || !categoriaId || !usuarioId) {
      this.form.markAllAsTouched();
      this.saving = false;
      return;
    }

    const basePayload = {
      nombre: nombreValor,
      descripcion: descripcionValor,
      precio: precioValor,
      stock: stockValor,
      categoria_id: categoriaId
    };

    if (this.editingId) {
      const payload: ProductoUpdate = {
        ...basePayload,
        usuario_id: this.isAdmin ? usuarioId : undefined,
        activo: typeof activo === 'boolean' ? activo : undefined,
        id_usuario_edita: this.currentUserId ?? undefined
      };
      this.http.put<Producto>(`${this.apiUrl}/productos/${this.editingId}/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al actualizar el producto.';
          console.error(err);
          this.saving = false;
        }
      });
    } else {
      const payload: ProductoCreate = {
        ...basePayload,
        usuario_id: usuarioId
      };
      this.http.post<Producto>(`${this.apiUrl}/productos/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al crear el producto.';
          console.error(err);
          this.saving = false;
        }
      });
    }
  }

  remove(producto: Producto): void {
    if (!confirm(`¿Eliminar el producto ${producto.nombre}?`)) {
      return;
    }
    this.saving = true;
    const payload = {
      activo: false,
      id_usuario_edita: this.currentUserId ?? undefined
    };
    this.http.put(`${this.apiUrl}/productos/${producto.id}/`, payload).subscribe({
      next: () => {
        this.loadData();
        if (this.editingId === producto.id) {
          this.closeModal();
        }
        this.saving = false;
      },
      error: err => {
        this.errorMessage = 'Error al eliminar el producto.';
        console.error(err);
        this.saving = false;
      }
    });
  }

  private buildProductosRequest(): Observable<Producto[]> {
    const nombre = this.filters.nombre.trim();
    const categoriaId = this.filters.categoria.trim();
    if (nombre && categoriaId) {
      return forkJoin({
        porNombre: this.productoService.searchByNombre(nombre),
        porCategoria: this.productoService.getByCategoria(categoriaId)
      }).pipe(
        map(({ porNombre, porCategoria }) => {
          const categoriaIds = new Set((porCategoria ?? []).map(prod => prod.id));
          return (porNombre ?? []).filter(prod => categoriaIds.has(prod.id));
        })
      );
    }
    if (nombre) {
      return this.productoService.searchByNombre(nombre);
    }
    if (categoriaId) {
      return this.productoService.getByCategoria(categoriaId);
    }
    if (!this.isAdmin && this.currentUserId) {
      return this.productoService.listByUsuario(this.currentUserId);
    }
    return this.productoService.list();
  }

  private enforceUserScope(productos: Producto[]): Producto[] {
    if (this.isAdmin || !this.currentUserId) {
      return productos ?? [];
    }
    return (productos ?? []).filter(producto => {
      const ownerId = (producto.usuario_id as string) ?? (producto as any).id_usuario ?? null;
      return ownerId === this.currentUserId;
    });
  }

  private shouldRefetchFromServer(): boolean {
    return (
      this.filters.nombre.trim() !== this.serverFilterSnapshot.nombre ||
      this.filters.categoria.trim() !== this.serverFilterSnapshot.categoria
    );
  }

  private updateServerFilterSnapshot(): void {
    this.serverFilterSnapshot = {
      nombre: this.filters.nombre.trim(),
      categoria: this.filters.categoria.trim()
    };
  }

  getCategoriaNombre(producto: Producto): string {
    const categoriaId = this.resolveCategoriaId(producto);
    if (!categoriaId) {
      return 'Sin categoría';
    }
    return this.categoriaNombreMap.get(categoriaId) ?? categoriaId;
  }

  private resolveCategoriaId(producto: Producto): string {
    return (producto.categoria_id as string) || (producto as unknown as { id_categoria?: string }).id_categoria || '';
  }
}
