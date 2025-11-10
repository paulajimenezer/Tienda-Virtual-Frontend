import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type PedidoEstado = 'pendiente' | 'pagado' | 'cancelado';

interface Pedido {
  id: string;
  usuario: string;
  total: number;
  estado: PedidoEstado;
  fecha_creacion: string;
  fecha_edicion: string;
}

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-list.component.html',
  styleUrl: './pedido-list.component.scss'
})
export class PedidoListComponent implements OnInit {
  // Fuente de datos base (mock)
  private allPedidos: Pedido[] = [];

  // Datos para la tabla (paginados)
  pedidos: Pedido[] = [];

  // Estado de UI
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;

  // Filtros visuales
  filters: { usuario?: string; estado?: '' | PedidoEstado } = {
    usuario: '',
    estado: ''
  };

  // Modal
  showModal = false;
  editingPedido: Pedido | null = null;
  pedidoForm: { usuario: string; total: number; estado: PedidoEstado } = {
    usuario: '',
    total: 0,
    estado: 'pendiente'
  };

  ngOnInit(): void {
    this.initializeMock();
    this.applyFilters();
  }

  // Mock de ejemplo único
  private initializeMock(): void {
    this.allPedidos = [
      {
        id: '1',
        usuario: 'Juan Pérez',
        total: 125000,
        estado: 'pendiente',
        fecha_creacion: new Date().toISOString(),
        fecha_edicion: new Date().toISOString()
      }
    ];
  }

  // Filtrado + paginación en memoria
  private applyFilters(): void {
    this.loading = true;
    const term = (this.filters.usuario || '').toLowerCase();
    const estado = this.filters.estado || '';

    let filtered = this.allPedidos.filter(p => {
      const byUsuario = term ? p.usuario.toLowerCase().includes(term) : true;
      const byEstado = estado ? p.estado === estado : true;
      return byUsuario && byEstado;
    });

    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pedidos = filtered.slice(start, end);

    this.loading = false;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = { usuario: '', estado: '' };
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  openCreateModal(): void {
    this.editingPedido = null;
    this.pedidoForm = { usuario: '', total: 0, estado: 'pendiente' };
    this.showModal = true;
  }

  editPedido(pedido: Pedido): void {
    this.editingPedido = pedido;
    this.pedidoForm = {
      usuario: pedido.usuario,
      total: pedido.total,
      estado: pedido.estado
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingPedido = null;
    this.pedidoForm = { usuario: '', total: 0, estado: 'pendiente' };
  }

  savePedido(): void {
    if (!this.pedidoForm.usuario.trim() || this.pedidoForm.total <= 0) {
      alert('Usuario y total son requeridos');
      return;
    }

    if (this.editingPedido) {
      // Actualizar existente
      const idx = this.allPedidos.findIndex(p => p.id === this.editingPedido!.id);
      if (idx >= 0) {
        this.allPedidos[idx] = {
          ...this.allPedidos[idx],
          usuario: this.pedidoForm.usuario,
          total: this.pedidoForm.total,
          estado: this.pedidoForm.estado,
          fecha_edicion: new Date().toISOString()
        };
      }
    } else {
      // Crear nuevo
      const nuevo: Pedido = {
        id: Date.now().toString(),
        usuario: this.pedidoForm.usuario,
        total: this.pedidoForm.total,
        estado: this.pedidoForm.estado,
        fecha_creacion: new Date().toISOString(),
        fecha_edicion: new Date().toISOString()
      };
      this.allPedidos = [nuevo, ...this.allPedidos];
    }

    this.closeModal();
    this.applyFilters();
  }

  deletePedido(pedido: Pedido): void {
    if (confirm(`¿Está seguro de eliminar el pedido "${pedido.id}"?`)) {
      this.allPedidos = this.allPedidos.filter(p => p.id !== pedido.id);
      this.applyFilters();
    }
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}
