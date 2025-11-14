import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Factura, FacturaCreate, FacturaUpdate } from '../../../shared/models/factura.model';
import { Pedido } from '../../../shared/models/pedido.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-factura-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './factura-list.component.html',
  styleUrls: ['./factura-list.component.scss']
})
export class FacturaListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = environment.apiUrl;
  private readonly authService = inject(AuthService);

  facturas: Factura[] = [];
  private allFacturas: Factura[] = [];
  private filteredFacturas: Factura[] = [];
  // Lista de pedidos utilizada por el modal de creación/edición
  pedidos: Pedido[] = [];
  // Backend ahora devuelve 'pedido' y 'usuario' embebidos en cada factura

  loading = false;
  saving = false;
  editingId: string | null = null;
  errorMessage = '';
  modalOpen = false;
  modalTitle = 'Nueva factura';

  isAdmin = false;
  private currentUserId: string | null = null;

  filters = {
    numero: '',
    pedido: '',
    fecha: ''
  };

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Expansion state for factura items view
  expandedFacturas = new Set<string>();

  readonly form = this.fb.group({
    id_pedido: ['', Validators.required],
    numero_factura: ['', Validators.required],
    subtotal: [0, [Validators.required, Validators.min(0)]],
    impuesto: [0, [Validators.required, Validators.min(0)]],
    total: [0, [Validators.required, Validators.min(0)]],
    fecha_emision: ['']
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
    this.http.get<Factura[]>(`${this.apiUrl}/facturas/`).subscribe({
      next: facturas => {
        const list = facturas ?? [];
        if (this.isAdmin || !this.currentUserId) {
          this.allFacturas = list;
        } else {
          // Filtrar sólo facturas cuyo pedido pertenece al usuario actual
          this.allFacturas = list.filter(f => (f.pedido?.id_usuario ?? f.usuario?.id) === this.currentUserId);
        }
        this.currentPage = 1;
        this.applyFilters();
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'No fue posible cargar las facturas.';
        console.error(err);
        this.loading = false;
      }
    });

  }

  private loadPedidos(): void {
    const endpoint = this.isAdmin || !this.currentUserId
      ? `${this.apiUrl}/pedidos/`
      : `${this.apiUrl}/pedidos/usuario/${this.currentUserId}/`;

    this.http.get<Pedido[]>(endpoint).subscribe({
      next: data => {
        this.pedidos = data ?? [];
      },
      error: err => {
        console.warn('No fue posible cargar los pedidos para el modal de facturas.', err);
        this.pedidos = [];
      }
    });
  }

  /** Retorna el nombre del usuario propietario de la factura (vía el pedido). */
  getFacturaUsuarioNombre(factura: Factura): string {
    const usuario = factura.usuario ?? factura.pedido?.usuario;
    if (!usuario) return '—';
    return `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim() || '—';
  }

  private applyFilters(): void {
    const numeroTerm = this.filters.numero.trim().toLowerCase();
    const pedidoTerm = this.filters.pedido.trim().toLowerCase();
    const fechaFiltro = this.filters.fecha;

    this.filteredFacturas = this.allFacturas.filter(factura => {
      const matchesNumero = !numeroTerm || (factura.numero_factura ?? '').toLowerCase().includes(numeroTerm);
      const matchesPedido = !pedidoTerm || (factura.id_pedido ?? '').toLowerCase().includes(pedidoTerm);
      const matchesFecha = !fechaFiltro || (factura.fecha_emision ?? '').startsWith(fechaFiltro);
      return matchesNumero && matchesPedido && matchesFecha;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredFacturas.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.facturas = this.filteredFacturas.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = { numero: '', pedido: '', fecha: '' };
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
      id_pedido: '',
      numero_factura: '',
      subtotal: 0,
      impuesto: 0,
      total: 0,
      fecha_emision: new Date().toISOString().substring(0, 10)
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  openCreateModal(): void {
    this.editingId = null;
    this.modalTitle = 'Nueva factura';
    this.resetForm();
    this.loadPedidos();
    this.modalOpen = true;
  }

  edit(factura: Factura): void {
    this.editingId = factura.id;
    this.modalTitle = 'Editar factura';
    this.form.patchValue({
      id_pedido: factura.id_pedido,
      numero_factura: factura.numero_factura,
      subtotal: factura.subtotal,
      impuesto: factura.impuesto,
      total: factura.total,
      fecha_emision: factura.fecha_emision ? factura.fecha_emision.substring(0, 10) : ''
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

    const { id_pedido, numero_factura, subtotal, impuesto, total, fecha_emision } = this.form.value;
    const pedidoId = (id_pedido ?? '').toString().trim();
    const numero = (numero_factura ?? '').toString().trim().toUpperCase();
    const subtotalValor = subtotal == null ? NaN : Number(subtotal);
    const impuestoValor = impuesto == null ? NaN : Number(impuesto);
    const totalValor = total == null ? NaN : Number(total);
    const fechaValor = (fecha_emision ?? '').toString().trim();

    if (!pedidoId || !numero || Number.isNaN(subtotalValor) || Number.isNaN(impuestoValor) || Number.isNaN(totalValor)) {
      this.form.markAllAsTouched();
      this.saving = false;
      return;
    }

    const basePayload = {
      id_pedido: pedidoId,
      numero_factura: numero,
      subtotal: subtotalValor,
      impuesto: impuestoValor,
      total: totalValor,
      fecha_emision: fechaValor || undefined
    };

    if (this.editingId) {
      const payload: FacturaUpdate = basePayload;
      payload.id_usuario_edita = this.currentUserId ?? undefined;
      this.http.put<Factura>(`${this.apiUrl}/facturas/${this.editingId}/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al actualizar la factura.';
          console.error(err);
          this.saving = false;
        }
      });
    } else {
      const payload: FacturaCreate = basePayload;
      payload.id_usuario_crea = this.currentUserId ?? undefined;
      this.http.post<Factura>(`${this.apiUrl}/facturas/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al crear la factura.';
          console.error(err);
          this.saving = false;
        }
      });
    }
  }

  remove(factura: Factura): void {
    if (!confirm(`¿Eliminar la factura ${factura.numero_factura}?`)) {
      return;
    }
    this.saving = true;
    this.http.delete(`${this.apiUrl}/facturas/${factura.id}/`).subscribe({
      next: () => {
        this.loadData();
        if (this.editingId === factura.id) {
          this.closeModal();
        }
        this.saving = false;
      },
      error: err => {
        this.errorMessage = 'Error al eliminar la factura.';
        console.error(err);
        this.saving = false;
      }
    });
  }

  getPedidoTotal(factura: Factura): number | null {
    const pedidoTotal = factura.pedido?.total;
    if (typeof pedidoTotal === 'number') return pedidoTotal;
    return null;
  }

  toggleFacturaItems(facturaId: string): void {
    const isExpanded = this.expandedFacturas.has(facturaId);
    if (isExpanded) {
      this.expandedFacturas.delete(facturaId);
      return;
    }

    // expand: ensure pedido.items is loaded; if not, fetch the pedido by id
    const factura = this.facturas.find(f => f.id === facturaId);
    this.expandedFacturas.add(facturaId);
    if (!factura) return;

    const pedidoId = factura.id_pedido;
    // If pedido is present and already has items, nothing to do
    if (factura.pedido && factura.pedido.items && factura.pedido.items.length) return;

    if (!pedidoId) return;

    // Fetch the pedido details to obtain items (lazy load)
    this.http.get<Pedido>(`${this.apiUrl}/pedidos/${pedidoId}/`).subscribe({
      next: pedidoData => {
        // copy or attach the pedido with items into the factura so template can render
        factura.pedido = pedidoData as any;
        // If items exist but product details are missing, try to fetch product info for each item
        const items = (factura.pedido?.items || []) as any[];
        items.forEach(item => {
          const prodRef = item?.producto ?? item?.id_producto ?? item?.idProducto ?? null;
          const needFetch = (prodRef && (typeof prodRef === 'string' || typeof prodRef === 'number')) || (!item?.producto || !item.producto?.nombre && !item.nombre);
          if (!needFetch) return;

          const prodId = (typeof prodRef === 'object') ? (prodRef.id ?? prodRef) : prodRef;
          if (!prodId) return;

          this.http.get<any>(`${this.apiUrl}/productos/${prodId}/`).subscribe({
            next: prodData => {
              // attach product object and set fallback price/name on the item for template helpers
              item.producto = prodData;
              if (item.precio_unitario == null) item.precio_unitario = prodData?.precio ?? prodData?.price ?? prodData?.unit_price ?? null;
              if (!item.nombre && (prodData?.nombre || prodData?.title || prodData?.name)) item.nombre = prodData.nombre ?? prodData.title ?? prodData.name;
            },
            error: () => {
              // ignore product fetch errors silently
            }
          });
        });
      },
      error: err => {
        console.warn('No fue posible cargar los items del pedido para la factura', facturaId, err);
      }
    });
  }

  isFacturaExpanded(facturaId: string): boolean {
    return this.expandedFacturas.has(facturaId);
  }

  // Item helpers (pedido.items can have different shapes)
  getFacturaItemName(item: any): string {
    const prod = item?.producto ?? item?.product ?? null;
    if (prod) return (prod.nombre || prod.nombre_producto || prod.title || prod.name || prod.label || prod.descripcion || prod.id) as string;
    return item?.nombre || item?.nombre_producto || item?.id_producto || item?.id || '—';
  }

  getFacturaItemQuantity(item: any): number {
    return Number(item?.cantidad ?? item?.quantity ?? item?.qty ?? 0);
  }

  getFacturaItemUnitPrice(item: any): number | null {
    const v = item?.precio_unitario ?? item?.precio ?? item?.unit_price ?? item?.price;
    return v == null ? null : Number(v);
  }

  getFacturaItemSubtotal(item: any): number | null {
    const qty = this.getFacturaItemQuantity(item);
    const price = this.getFacturaItemUnitPrice(item);
    if (Number.isNaN(qty) || price == null) return null;
    return qty * price;
  }
}
