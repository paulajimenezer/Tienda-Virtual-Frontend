import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Carrito, CarritoCreate, CarritoUpdate } from '../../../shared/models/carrito.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-carrito-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './carrito-list.component.html',
  styleUrls: ['./carrito-list.component.scss']
})
export class CarritoListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = environment.apiUrl;
  private readonly authService = inject(AuthService);

  isAdmin = false;
  private currentUserId: string | null = null;
  carritos: Carrito[] = [];
  // Track which carritos are expanded to show items
  expandedCarritos = new Set<string>();
  private allCarritos: Carrito[] = [];
  private filteredCarritos: Carrito[] = [];
  loading = false;
  saving = false;
  editingId: string | null = null;
  errorMessage = '';

  filters = {
    usuario: '',
    estado: '',
    activo: ''
  };

  estadoOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  readonly form = this.fb.group({
    id_usuario: ['', Validators.required],
    estado: [''],
    activo: [true]
  });

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id ?? null;
    this.isAdmin = this.authService.isAdmin();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    const endpoint = this.isAdmin || !this.currentUserId
      ? `${this.apiUrl}/carritos/`
      : `${this.apiUrl}/carritos/usuario/${this.currentUserId}/`;

    this.http.get<Carrito[]>(endpoint).subscribe({
      next: data => {
        this.allCarritos = data ?? [];
        this.estadoOptions = Array.from(
          new Set(this.allCarritos.map(carrito => (carrito.estado ?? '').trim()).filter(Boolean))
        );
        this.currentPage = 1;
        this.applyFilters();
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'No fue posible cargar los carritos.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  private applyFilters(): void {
    const termUsuario = this.filters.usuario.trim().toLowerCase();
    const estadoFiltro = this.filters.estado.trim().toLowerCase();
    const activoFiltro = this.filters.activo;

    this.filteredCarritos = this.allCarritos.filter(carrito => {
      const usuarioNombre = (carrito.usuario ? `${carrito.usuario.nombre ?? ''} ${carrito.usuario.apellido ?? ''}`.trim() : '') || (carrito.id_usuario ?? '');
      const matchesUsuario = !termUsuario || usuarioNombre.toLowerCase().includes(termUsuario);
      const matchesEstado = !estadoFiltro || (carrito.estado ?? '').toLowerCase() === estadoFiltro;
      const matchesActivo =
        activoFiltro === '' ||
        (activoFiltro === 'true' && carrito.activo !== false) ||
        (activoFiltro === 'false' && carrito.activo === false);
      return matchesUsuario && matchesEstado && matchesActivo;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredCarritos.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.carritos = this.filteredCarritos.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      usuario: '',
      estado: '',
      activo: ''
    };
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
      id_usuario: '',
      estado: '',
      activo: true
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  openCreateModal(): void {
    this.editingId = null;
    this.modalTitle = 'Nuevo carrito';
    this.resetForm();
    this.modalOpen = true;
  }

  edit(carrito: Carrito): void {
    this.editingId = carrito.id;
    this.modalTitle = 'Editar carrito';
    this.form.patchValue({
      id_usuario: carrito.id_usuario,
      estado: carrito.estado ?? '',
      activo: carrito.activo ?? true
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

    const { id_usuario, estado, activo } = this.form.value;
    const usuarioId = (id_usuario ?? '').toString().trim();
    if (!usuarioId) {
      this.form.markAllAsTouched();
      this.saving = false;
      return;
    }

    if (this.editingId) {
      const payload: CarritoUpdate = {
        estado: estado ? String(estado).trim() : undefined,
        activo: typeof activo === 'boolean' ? activo : undefined,
        id_usuario_edita: this.currentUserId ?? null
      };
      this.http.put<Carrito>(`${this.apiUrl}/carritos/${this.editingId}/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al actualizar el carrito.';
          console.error(err);
          this.saving = false;
        }
      });
    } else {
      const payload: CarritoCreate = {
        id_usuario: usuarioId,
        id_usuario_crea: this.currentUserId
      };
      this.http.post<Carrito>(`${this.apiUrl}/carritos/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al crear el carrito.';
          console.error(err);
          this.saving = false;
        }
      });
    }
  }

  remove(carrito: Carrito): void {
    if (!confirm(`¿Eliminar el carrito ${carrito.id}?`)) {
      return;
    }
    this.saving = true;
    const payload = {
      activo: false,
      id_usuario_edita: this.currentUserId ?? null
    };
    this.http.put(`${this.apiUrl}/carritos/${carrito.id}/`, payload).subscribe({
      next: () => {
        this.loadData();
        if (this.editingId === carrito.id) {
          this.closeModal();
        }
        this.saving = false;
      },
      error: err => {
        this.errorMessage = 'Error al eliminar el carrito.';
        console.error(err);
        this.saving = false;
      }
    });
  }

  modalOpen = false;
  modalTitle = 'Nuevo carrito';

  // Helpers to present item information defensively (backend may return different shapes)
  toggleCarritoItems(carritoId: string): void {
    const isExpanded = this.expandedCarritos.has(carritoId);
    if (isExpanded) {
      this.expandedCarritos.delete(carritoId);
      return;
    }

    // expand and ensure product info for items is available
    this.expandedCarritos.add(carritoId);
    const carrito = this.carritos.find(c => c.id === carritoId) ?? this.allCarritos.find(c => c.id === carritoId);
    if (!carrito) return;

    const items = carrito.items || [];
    items.forEach(item => {
      const prodRef = item?.producto ?? item?.id_producto ?? item?.idProducto ?? null;
      const missingProductObj = !item?.producto && !item?.nombre;
      const prodIsId = prodRef && (typeof prodRef === 'string' || typeof prodRef === 'number');
      if (!missingProductObj && !prodIsId) return;

      const prodId = prodIsId ? prodRef : (typeof prodRef === 'object' ? (prodRef.id ?? null) : null);
      if (!prodId) return;

      this.http.get<any>(`${this.apiUrl}/productos/${prodId}/`).subscribe({
        next: prodData => {
          item.producto = prodData;
          if (item.precio_unitario == null) item.precio_unitario = prodData?.precio ?? prodData?.price ?? prodData?.unit_price ?? null;
          if (!item.nombre && (prodData?.nombre || prodData?.title || prodData?.name)) item.nombre = prodData.nombre ?? prodData.title ?? prodData.name;
        },
        error: () => {
          // ignore product fetch failure
        }
      });
    });
  }

  isCarritoExpanded(carritoId: string): boolean {
    return this.expandedCarritos.has(carritoId);
  }

  getItemProductName(item: any): string {
    // try common shapes: item.producto.nombre, item.producto?.nombre_producto, item.nombre
    const prod = item?.producto ?? item?.product ?? null;
    if (prod) return (prod.nombre || prod.nombre_producto || prod.title || prod.name || prod.label || prod.descripcion || prod.id) as string;
    return item?.nombre || item?.nombre_producto || item?.id_producto || item?.id || '—';
  }

  getItemQuantity(item: any): number {
    return Number(item?.cantidad ?? item?.quantity ?? item?.qty ?? 0);
  }

  getItemUnitPrice(item: any): number | null {
    const v = item?.precio_unitario ?? item?.precio ?? item?.unit_price ?? item?.price;
    return v == null ? null : Number(v);
  }

  getItemSubtotal(item: any): number | null {
    const qty = this.getItemQuantity(item);
    const price = this.getItemUnitPrice(item);
    if (Number.isNaN(qty) || price == null) return null;
    return qty * price;
  }
}
