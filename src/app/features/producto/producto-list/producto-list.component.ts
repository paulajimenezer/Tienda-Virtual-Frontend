import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
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

  productos: Producto[] = [];
  private allProductos: Producto[] = [];
  private filteredProductos: Producto[] = [];
  categorias: Categoria[] = [];
  private categoriaNombreMap = new Map<string, string>();

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
    const productosEndpoint = this.isAdmin || !this.currentUserId
      ? `${this.apiUrl}/productos/`
      : `${this.apiUrl}/productos/usuario/${this.currentUserId}/`;

    forkJoin({
      productos: this.http.get<Producto[]>(productosEndpoint),
      categorias: this.http.get<Categoria[]>(`${this.apiUrl}/categorias/`)
    }).subscribe({
      next: ({ productos, categorias }) => {
        this.categorias = categorias ?? [];
        this.categoriaNombreMap = new Map(
          this.categorias.map(categoria => [categoria.id, categoria.nombre])
        );
        this.allProductos = productos ?? [];
        this.currentPage = 1;
        this.applyFilters();
        this.loading = false;
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
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = { nombre: '', categoria: '', activo: '', precioMin: '', precioMax: '' };
    this.onFilterChange();
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
