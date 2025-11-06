import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationParams } from '../../../core/models/api-response.model';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto, ProductoFilters } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="producto-list">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Gestión de Productos</h2>
          <button class="btn btn-success" (click)="openCreateModal()">
            Nuevo Producto
          </button>
        </div>
        
        <div class="card-body">
          <!-- Filtros -->
          <div class="filters mb-3">
            <div class="row">
              <div class="col-md-3">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Buscar por nombre..."
                  [(ngModel)]="filters.nombre"
                  (input)="onFilterChange()"
                >
              </div>
              <div class="col-md-2">
                <input 
                  type="number" 
                  class="form-control" 
                  placeholder="Precio min"
                  [(ngModel)]="filters.precio_min"
                  (input)="onFilterChange()"
                >
              </div>
              <div class="col-md-2">
                <input 
                  type="number" 
                  class="form-control" 
                  placeholder="Precio max"
                  [(ngModel)]="filters.precio_max"
                  (input)="onFilterChange()"
                >
              </div>
              <div class="col-md-2">
                <select 
                  class="form-control" 
                  [(ngModel)]="filters.activo"
                  (change)="onFilterChange()"
                >
                  <option value="">Todos los estados</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
              <div class="col-md-2">
                <button class="btn btn-secondary" (click)="clearFilters()">
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          <!-- Tabla de productos -->
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="loading">
                  <td colspan="7" class="text-center">Cargando...</td>
                </tr>
                <tr *ngIf="!loading && productos.length === 0">
                  <td colspan="7" class="text-center">No hay productos disponibles</td>
                </tr>
                <tr *ngFor="let producto of productos">
                  <td>{{ producto.id }}</td>
                  <td>{{ producto.nombre }}</td>
                  <td>${{ producto.precio | number:'1.2-2' }}</td>
                  <td>{{ producto.stock }}</td>
                  <td>{{ producto.categoria?.nombre || '-' }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="producto.activo" [class.badge-danger]="!producto.activo">
                      {{ producto.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-primary" (click)="editProducto(producto)">
                      Editar
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="deleteProducto(producto)">
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div class="pagination mt-3" *ngIf="totalPages > 1">
            <button 
              class="btn btn-secondary" 
              [disabled]="currentPage === 1"
              (click)="goToPage(currentPage - 1)"
            >
              Anterior
            </button>
            <span class="mx-3">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            <button 
              class="btn btn-secondary" 
              [disabled]="currentPage === totalPages"
              (click)="goToPage(currentPage + 1)"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
    }
    
    .badge-success {
      background-color: #28a745;
      color: white;
    }
    
    .badge-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .table-responsive {
      overflow-x: auto;
    }
    
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class ProductoListComponent implements OnInit {
  productos: Producto[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  
  filters: ProductoFilters = {};

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.loading = true;
    const pagination: PaginationParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    this.productoService.getProductos(pagination, this.filters).subscribe({
      next: (response) => {
        this.productos = response.data;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProductos();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadProductos();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProductos();
    }
  }

  openCreateModal(): void {
    // TODO: Implementar modal para crear producto
    console.log('Abrir modal de creación');
  }

  editProducto(producto: Producto): void {
    // TODO: Implementar modal para editar producto
    console.log('Editar producto:', producto);
  }

  deleteProducto(producto: Producto): void {
    if (confirm(`¿Está seguro de eliminar el producto "${producto.nombre}"?`)) {
      this.productoService.deleteProducto(producto.id).subscribe({
        next: () => {
          this.loadProductos();
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
        }
      });
    }
  }
}
