import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationParams } from '../../../core/models/api-response.model';
/*import { CarritoService } from '../../../core/services/carrito.service';
import { Carrito, CarritoFilters } from '../../../shared/models/Carrito.model';*/

@Component({
  selector: 'app-carrito-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito-list.component.html',
  styleUrls: ['./carrito-list.component.scss']
})
export class CarritoListComponent implements OnInit {
  // Tipos comentados para evitar errores de compilación en ausencia de modelos reales
  carritos : any[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  
  // filters: CarritoFilters = {};
  filters: any = {};
  
  // Modal properties
  showModal = false;
  // editingCarrito: Carrito | null = null;
  editingCarrito: any | null = null;
  carritoForm = {
    id: '',
    usuario: '',
    fecha_creacion: '',
    fecha_edicion: '',
    activa: true,
  };
  // constructor(private carritoService: CarritoService) { }
  constructor() {}

  ngOnInit(): void {
    this.loadCarritos();
    // Si no hay backend y la lista está vacía, agregar un carrito de ejemplo
    if (!this.loading && this.carritos.length === 0) {
      this.carritos = [
        {
          id: '1',
          usuario: 'usuario.demo',
          activo: true,
          fecha_creacion: new Date().toISOString(),
          fecha_edicion: new Date().toISOString()
        }
      ];
      this.totalPages = 1;
    }
  }

  loadCarritos(): void {
    this.loading = true;
    const pagination: PaginationParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    /*this.carritoService.getCarritos(pagination, this.filters).subscribe({
      next: (carritos) => {
        this.carritos = carritos;
        // Since backend doesn't provide pagination info, we'll set a default
        this.totalPages = Math.ceil(carritos.length / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar carritos:', error);
        // Si el backend no está disponible, usar datos mock
        this.loading = false;
      }
    });*/
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadCarritos();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadCarritos();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCarritos();
    }
  }

  openCreateModal(): void {
    this.editingCarrito = null;
    this.carritoForm = {
      id: '',
      usuario: '',
      fecha_creacion: '',
      fecha_edicion: '',
      activa: true,
    };
    this.showModal = true;
  }

  editCarrito(carrito: any): void {
    this.editingCarrito = carrito;
    this.carritoForm = {
      id: carrito.id,
      usuario: carrito.usuario,
      fecha_creacion: carrito.fecha_creacion || '',
      fecha_edicion: carrito.fecha_edicion || '',
      activa: carrito.activo,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCarrito = null;
    this.carritoForm = {
      id: '',
      usuario: '',
      fecha_creacion: '',
      fecha_edicion: '',
      activa: true,
    };
  }

  saveCarrito (): void {
    if (!this.carritoForm.id.trim()) {
      alert('El id es requerido');
      return;
    }

    if (this.editingCarrito) {
      // Actualizar carrito existente
      const updateData = {
        id: this.carritoForm.id,
        usuario: this.carritoForm.usuario,
        fecha_creacion: this.carritoForm.fecha_creacion,
        fecha_edicion: this.carritoForm.fecha_edicion,
        activo: this.carritoForm.activa
      };
      
      /*this.carritoService.updateCarrito(this.editingCarrito.id, updateData).subscribe({
        next: () => {
          this.loadCarritos();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar carrito:', error);
          alert('Error al actualizar carrito');
        }
      });*/
    } else {
      // Crear nuevo carrito
      const newCarrito = {
        id: this.carritoForm.id,
        usuario: this.carritoForm.usuario,
        fecha_creacion: this.carritoForm.fecha_creacion,
        fecha_edicion: this.carritoForm.fecha_edicion,
        activo: this.carritoForm.activa
      };
      
      /*this.carritoService.createCarrito(newCarrito).subscribe({
        next: () => {
          this.loadCarritos();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear carrito:', error);
          alert('Error al crear carrito');
        }
      });*/
    }
  }

  deleteCarrito(carrito: any): void {
    /*if (confirm(`¿Está seguro de eliminar el carrito "${carrito.nombre}"?`)) {
      this.carritoService.deleteCarrito(carrito.id).subscribe({
        next: () => {
          this.loadCarritos();
        },
        error: (error) => {
          console.error('Error al eliminar carrito:', error);
        }
      });
    }*/
  }
}
