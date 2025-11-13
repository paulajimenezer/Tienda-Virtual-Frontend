import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Pedido, PedidoCreate, PedidoEstado, PedidoUpdate } from '../../../shared/models/pedido.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pedido-list.component.html',
  styleUrls: ['./pedido-list.component.scss']
})
export class PedidoListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = environment.apiUrl;
  private readonly authService = inject(AuthService);

  pedidos: Pedido[] = [];
  private allPedidos: Pedido[] = [];
  private filteredPedidos: Pedido[] = [];

  loading = false;
  saving = false;
  editingId: string | null = null;
  errorMessage = '';
  modalOpen = false;
  modalTitle = 'Nuevo pedido';

  isAdmin = false;
  private currentUserId: string | null = null;

  readonly estados: PedidoEstado[] = ['Creado', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'];

  filters: { usuario: string; estado: string; fecha: string } = {
    usuario: '',
    estado: '',
    fecha: ''
  };

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  readonly form = this.fb.group({
    id_usuario: ['', Validators.required],
    id_direccion: ['', Validators.required],
    total: [0, [Validators.required, Validators.min(0)]],
    estado: ['Creado' as PedidoEstado, Validators.required],
    id_descuento: [''],
    fecha_pedido: ['']
  });

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id ?? null;
    this.isAdmin = this.authService.isAdmin();
    if (!this.isAdmin) {
      this.form.patchValue({ id_usuario: this.currentUserId ?? '' });
    }
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    const endpoint = this.isAdmin || !this.currentUserId
      ? `${this.apiUrl}/pedidos/`
      : `${this.apiUrl}/pedidos/usuario/${this.currentUserId}/`;

    this.http.get<Pedido[]>(endpoint).subscribe({
      next: data => {
        this.allPedidos = data ?? [];
        this.currentPage = 1;
        this.applyFilters();
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'No fue posible cargar los pedidos.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  private applyFilters(): void {
    const usuarioTerm = this.filters.usuario.trim().toLowerCase();
    const estadoFiltro = this.filters.estado;
    const fechaFiltro = this.filters.fecha;

    this.filteredPedidos = this.allPedidos.filter(pedido => {
      const usuarioNombre = (pedido.usuario ? `${pedido.usuario.nombre ?? ''} ${pedido.usuario.apellido ?? ''}`.trim() : '') || (pedido.id_usuario ?? '');
      const matchesUsuario = !usuarioTerm || usuarioNombre.toLowerCase().includes(usuarioTerm);
      const matchesEstado = !estadoFiltro || pedido.estado === estadoFiltro;
      const matchesFecha = !fechaFiltro || (pedido.fecha_pedido ?? '').startsWith(fechaFiltro);
      return matchesUsuario && matchesEstado && matchesFecha;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredPedidos.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.pedidos = this.filteredPedidos.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = { usuario: '', estado: '', fecha: '' };
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
      id_usuario: this.isAdmin ? '' : this.currentUserId ?? '',
      id_direccion: '',
      total: 0,
      estado: 'Creado',
      id_descuento: '',
      fecha_pedido: new Date().toISOString().substring(0, 10)
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  openCreateModal(): void {
    this.editingId = null;
    this.modalTitle = 'Nuevo pedido';
    this.resetForm();
    this.modalOpen = true;
  }

  edit(pedido: Pedido): void {
    this.editingId = pedido.id;
    this.modalTitle = 'Editar pedido';
    this.form.patchValue({
      id_usuario: pedido.id_usuario,
      id_direccion: pedido.id_direccion,
      total: pedido.total,
      estado: pedido.estado,
      id_descuento: pedido.id_descuento ?? '',
      fecha_pedido: pedido.fecha_pedido ? pedido.fecha_pedido.substring(0, 10) : ''
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

  const { id_usuario, id_direccion, total, estado, id_descuento, fecha_pedido } = this.form.value;
  const usuarioIdFromForm = (id_usuario ?? '').toString().trim();
  const usuarioId = usuarioIdFromForm || (this.currentUserId ?? '');
    const direccionId = (id_direccion ?? '').toString().trim();
    const totalValor = total == null ? NaN : Number(total);
    const estadoValor = estado as PedidoEstado | null;
    const fechaValor = (fecha_pedido ?? '').toString().trim();

    if (!usuarioId || !direccionId || Number.isNaN(totalValor) || !estadoValor) {
      this.form.markAllAsTouched();
      this.saving = false;
      return;
    }

    if (this.editingId) {
      const payload: PedidoUpdate = {
        id_direccion: direccionId,
        total: totalValor,
        estado: estadoValor,
        id_descuento: id_descuento ? String(id_descuento).trim() : null,
        fecha_pedido: fechaValor || undefined,
        id_usuario_edita: this.currentUserId ?? null
      };
      this.http.put<Pedido>(`${this.apiUrl}/pedidos/${this.editingId}/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al actualizar el pedido.';
          console.error(err);
          this.saving = false;
        }
      });
    } else {
      const payload: PedidoCreate = {
        id_usuario: usuarioId,
        id_direccion: direccionId,
        total: totalValor,
        estado: estadoValor ?? 'Creado',
        id_descuento: id_descuento ? String(id_descuento).trim() : null,
        fecha_pedido: fechaValor || undefined,
        id_usuario_crea: this.currentUserId ?? null
      };
      this.http.post<Pedido>(`${this.apiUrl}/pedidos/`, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.saving = false;
        },
        error: err => {
          this.errorMessage = 'Error al crear el pedido.';
          console.error(err);
          this.saving = false;
        }
      });
    }
  }

  remove(pedido: Pedido): void {
    if (!confirm(`¿Eliminar el pedido ${pedido.id}?`)) {
      return;
    }
    this.saving = true;
    this.http.delete(`${this.apiUrl}/pedidos/${pedido.id}/`).subscribe({
      next: () => {
        this.loadData();
        if (this.editingId === pedido.id) {
          this.closeModal();
        }
        this.saving = false;
      },
      error: err => {
        this.errorMessage = 'Error al eliminar el pedido.';
        console.error(err);
        this.saving = false;
      }
    });
  }

  getEstadoClase(estado: PedidoEstado): string {
    const mapping: Record<PedidoEstado, string> = {
      Creado: 'badge',
      Pagado: 'badge badge--success',
      Enviado: 'badge',
      Entregado: 'badge badge--success',
      Cancelado: 'badge badge--danger'
    };
    return mapping[estado] ?? 'badge';
  }
}
