import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { PaginationParams } from '../../../core/models/api-response.model';
// import { ItemCarritoService } from '../../../core/services/itemCarrito.service';
// import { ItemCarrito, ItemCarritoFilters } from '../../../shared/models/itemCarrito.model';

@Component({
  selector: 'app-itemcarrito-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './itemCarrito-list.component.html',
  styleUrls: ['./itemCarrito-list.component.scss']
})
export class ItemCarritoListComponent implements OnInit {
  // Tipos comentados para evitar errores de compilación en ausencia de modelos reales
  itemsCarrito : any[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  
  // filters: ItemCarritoFilters = {};
  filters: any = {};
  
  // Modal properties
  showModal = false;
  // editingItemCarrito: ItemCarrito | null = null;
  editingItemCarrito: any | null = null;
  itemCarritoForm = {
    carrito: '',
    producto: '',
    cantidad: '',
    precio_unitario: '',
    activo: false
  };
  // constructor(private itemCarritoService: ItemCarritoService) { }
  constructor() {}

  ngOnInit(): void {
    this.loadItemsCarrito();
    // Agregar un único item de ejemplo si está vacío (visual únicamente)
    if (!this.loading && this.itemsCarrito.length === 0) {
      this.itemsCarrito = [
        {
          id: '1',
          carrito: 'Carrito #1',
          producto: 'Producto demo',
          cantidad: 2,
          precio_unitario: 19.99,
          activo: true,
          fecha_creacion: new Date().toISOString()
        }
      ];
      this.totalPages = 1;
    }
  }

  loadItemsCarrito(): void {
    this.loading = true;
    /*const pagination: PaginationParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    this.itemCarritoService.getItemsCarrito(pagination, this.filters).subscribe({
      next: (itemsCarrito) => {
        this.itemsCarrito = itemsCarrito;
        // Since backend doesn't provide pagination info, we'll set a default
        this.totalPages = Math.ceil(itemsCarrito.length / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar itemsCarrito:', error);
        // Si el backend no está disponible, usar datos mock
        this.loading = false;
      }
    });*/
    // Simulación visual sin backend
    setTimeout(() => {
      this.loading = false;
    }, 300);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadItemsCarrito();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadItemsCarrito();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadItemsCarrito();
    }
  }

  openCreateModal(): void {
    this.editingItemCarrito = null;
    this.itemCarritoForm = {
      carrito: '',
      producto: '',
      cantidad: '',
      precio_unitario: '',
      activo: false
    };
    this.showModal = true;
  }

  editItemCarrito(itemCarrito: any): void {
    this.editingItemCarrito = itemCarrito;
    this.itemCarritoForm = {
      carrito: itemCarrito.carrito || '',
      producto: itemCarrito.producto || '',
      cantidad: String(itemCarrito.cantidad ?? ''),
      precio_unitario: String(itemCarrito.precio_unitario ?? ''),
      activo: !!itemCarrito.activo
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingItemCarrito = null;
    this.itemCarritoForm = {
      carrito: '',
      producto: '',
      cantidad: '',
      precio_unitario: '',
      activo: false
    };
  }

  saveItemCarrito (): void {
    if (!this.itemCarritoForm.producto.trim()) {
      alert('El producto es requerido');
      return;
    }

    if (this.editingItemCarrito) {
      // Actualizar itemCarrito existente
      const updateData = {
        carrito: this.itemCarritoForm.carrito,
        producto: this.itemCarritoForm.producto,
        cantidad: this.itemCarritoForm.cantidad,
        precio_unitario: this.itemCarritoForm.precio_unitario,
        activo: this.itemCarritoForm.activo
      };
      
      /*this.itemCarritoService.updateItemCarrito(this.editingItemCarrito.id, updateData).subscribe({
        next: () => {
          this.loadItemsCarrito();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar itemCarrito:', error);
          alert('Error al actualizar itemCarrito');
        }
      });*/
    } else {
      // Crear nuevo itemCarrito
      const newItemCarrito = {
        id: String(this.itemsCarrito.length + 1),
        carrito: this.itemCarritoForm.carrito,
        producto: this.itemCarritoForm.producto,
        cantidad: this.itemCarritoForm.cantidad,
        precio_unitario: this.itemCarritoForm.precio_unitario,
        activo: this.itemCarritoForm.activo,
        fecha_creacion: new Date().toISOString()
      };
      
      /*this.itemCarritoService.createItemCarrito(newItemCarrito).subscribe({
        next: () => {
          this.loadItemsCarrito();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear itemCarrito:', error);
          alert('Error al crear itemCarrito');
        }
      });*/
    }
  }

  deleteItemCarrito(itemCarrito: any): void {
    /*if (confirm(`¿Está seguro de eliminar el itemCarrito "${itemCarrito.nombre}"?`)) {
      this.itemCarritoService.deleteItemCarrito(itemCarrito.id).subscribe({
        next: () => {
          this.loadItemsCarrito();
        },
        error: (error) => {
          console.error('Error al eliminar itemCarrito:', error);
        }
      });
    }*/
  }
}
