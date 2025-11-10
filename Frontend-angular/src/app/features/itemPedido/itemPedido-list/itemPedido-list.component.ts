import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { PaginationParams } from '../../../core/models/api-response.model';
// import { ItemPedidoService } from '../../../core/services/itemPedido.service';
// import { ItemPedido, ItemPedidoFilters } from '../../../shared/models/itemPedido.model';

@Component({
  selector: 'app-itempedido-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './itemPedido-list.component.html',
  styleUrls: ['./itemPedido-list.component.scss']
})
  export class ItemPedidoListComponent implements OnInit {
  // Tipos comentados para evitar errores de compilación en ausencia de modelos reales
  itemsPedido : any[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  
  // filters: ItemPedidoFilters = {};
  filters: any = {};
  
  // Modal properties
  showModal = false;
  // editingItemPedido: ItemPedido | null = null;
  editingItemPedido: any | null = null;
  itemPedidoForm = {
    pedido: '',
    producto: '',
    cantidad: '',
    precio_unitario: '',
    descuento: '',
    fecha_fin: ''
  };
  // constructor(private itemPedidoService: ItemPedidoService) { }
  constructor() {}

  ngOnInit(): void {
    this.loadItemsPedido();
  }

  loadItemsPedido(): void {
    this.loading = true;
    // Simulación sin backend
    this.loading = false;
    if (this.itemsPedido.length === 0) {
      this.itemsPedido = [{
        id: '1',
        pedido: 'P-001',
        producto: 'Producto demo',
        cantidad: 3,
        precio_unitario: 25500,
        descuento: '10%',
        fecha_fin: '2025-12-31',
        fecha_creacion: new Date().toISOString(),
        fecha_edicion: new Date().toISOString()
      }];
      this.totalPages = 1;
    } else {
      this.totalPages = Math.max(1, Math.ceil(this.itemsPedido.length / this.pageSize));
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadItemsPedido();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadItemsPedido();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadItemsPedido();
    }
  }

  openCreateModal(): void {
    this.editingItemPedido = null;
    this.itemPedidoForm = {
      pedido: '',
      producto: '',
      cantidad: '',
      precio_unitario: '',
      descuento: '',
      fecha_fin: ''
    };
    this.showModal = true;
  }

  editItemPedido(item: any): void {
    this.editingItemPedido = item;
    this.itemPedidoForm = {
      pedido: item.pedido || '',
      producto: item.producto || '',
      cantidad: String(item.cantidad ?? ''),
      precio_unitario: String(item.precio_unitario ?? ''),
      descuento: String(item.descuento ?? ''),
      fecha_fin: item.fecha_fin || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingItemPedido = null;
    this.itemPedidoForm = {
      pedido: '',
      producto: '',
      cantidad: '',
      precio_unitario: '',
      descuento: '',
      fecha_fin: ''
    };
  }

  saveItemPedido (): void {
    if (!this.itemPedidoForm.producto.trim()) {
      alert('El producto es requerido');
      return;
    }

    if (this.editingItemPedido) {
      // Actualizar itemPedido existente (visual)
      const updateData = {
        pedido: this.itemPedidoForm.pedido,
        producto: this.itemPedidoForm.producto,
        cantidad: this.itemPedidoForm.cantidad,
        precio_unitario: this.itemPedidoForm.precio_unitario,
        descuento: this.itemPedidoForm.descuento,
        fecha_fin: this.itemPedidoForm.fecha_fin
      };
      
      /*this.itemPedidoService.updateItemPedido(this.editingItemPedido.id, updateData).subscribe({
        next: () => {
          this.loadItemsPedido();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar itemPedido:', error);
          alert('Error al actualizar itemPedido');
        }
      });*/
    } else {
      // Crear nuevo itemPedido (visual)
      const newItem = {
        id: String(this.itemsPedido.length + 1),
        pedido: this.itemPedidoForm.pedido,
        producto: this.itemPedidoForm.producto,
        cantidad: this.itemPedidoForm.cantidad,
        precio_unitario: this.itemPedidoForm.precio_unitario,
        descuento: this.itemPedidoForm.descuento,
        fecha_fin: this.itemPedidoForm.fecha_fin,
        fecha_creacion: new Date().toISOString(),
        fecha_edicion: new Date().toISOString()
      };
      
      /*this.itemPedidoService.createItemPedido(newItem).subscribe({
        next: () => {
          this.loadItemsPedido();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear itemPedido:', error);
          alert('Error al crear itemPedido');
        }
      });*/
    }
  }

  deleteItemPedido(item: any): void {
    /*if (confirm(`¿Está seguro de eliminar el itemPedido "${item.id}"?`)) {
      this.itemPedidoService.deleteItemPedido(item.id).subscribe({
        next: () => {
          this.loadItemsPedido();
        },
        error: (error) => {
          console.error('Error al eliminar itemPedido:', error);
        }
      });
    }*/
  }
}
