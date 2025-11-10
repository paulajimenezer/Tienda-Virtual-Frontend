import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { PaginationParams } from '../../../core/models/api-response.model';
// import { DescuentoService } from '../../../core/services/Descuento.service';
// import { Descuento, DescuentoFilters } from '../../../shared/models/Descuento.model';

@Component({
  selector: 'app-descuento-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './descuento-list.component.html',
  styleUrls: ['./descuento-list.component.scss']
})
  export class DescuentoListComponent implements OnInit {
  // Tipos comentados para evitar errores de compilación en ausencia de modelos reales
  descuentos : any[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  
  // filters: DescuentoFilters = {};
  filters: any = {};
  
  // Modal properties
  showModal = false;
  // editingDescuento: Descuento | null = null;
  editingDescuento: any | null = null;
   descuentoForm = {
    codigo: '',
    porcentaje: '',
    pedido: '',
    estado: '',
    fecha_inicio: '',
    fecha_fin: '',
    activa: '',
  };
  // constructor(private descuentoService: DescuentoService) { }
  constructor() {}

  ngOnInit(): void {
    this.loadDescuentos();
    // Cargar un único descuento de ejemplo como en categoría cuando no hay backend
    if (!this.loading && this.descuentos.length === 0) {
      this.descuentos = [{
        id: '1',
        nombre: 'Descuento Bienvenida',
        descripcion: '10% en primera compra',
        activo: true,
        fecha_creacion: new Date().toISOString(),
        fecha_edicion: new Date().toISOString()
      }];
      this.totalPages = 1;
    }
  }

  loadDescuentos(): void {
    this.loading = true;
    /*const pagination: PaginationParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    this.descuentoService.getDescuentos(pagination, this.filters).subscribe({
      next: (descuentos) => {
        this.descuentos = descuentos;
        // Since backend doesn't provide pagination info, we'll set a default
        this.totalPages = Math.ceil(descuentos.length / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar descuentos:', error);
        // Si el backend no está disponible, usar datos mock
        this.loading = false;
      }
    });*/
    // Fallback visual (sin backend) similar a Categoría
    if (this.descuentos.length === 0) {
      this.descuentos = [{
        id: '1',
        nombre: 'Descuento Bienvenida',
        descripcion: '10% en primera compra',
        activo: true,
        fecha_creacion: new Date().toISOString(),
        fecha_edicion: new Date().toISOString()
      }];
      this.totalPages = 1;
    } else {
      this.totalPages = Math.max(1, Math.ceil(this.descuentos.length / this.pageSize));
    }
    this.loading = false;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadDescuentos();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadDescuentos();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDescuentos();
    }
  }

  openCreateModal(): void {
    this.editingDescuento = null;
    this.descuentoForm = {
      codigo: '',
    porcentaje: '',
    pedido: '',
    estado: '',
    fecha_inicio: '',
    fecha_fin: '',
    activa: ''
    };
    this.showModal = true;
  }

  editDescuento(descuento: any): void {
    this.editingDescuento = descuento;
    this.descuentoForm = {
    codigo: descuento.codigo,
    porcentaje: descuento.porcentaje,
    pedido: descuento.pedido,
    estado: descuento.estado,
    fecha_inicio: descuento.fecha_inicio || '',
    fecha_fin: descuento.fecha_fin || '',
    activa: descuento.activa,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingDescuento = null;
    this.descuentoForm = {
    codigo: '',
    porcentaje: '',
    pedido: '',
    estado: '',
    fecha_inicio: '',
    fecha_fin: '',
    activa: '',
    };
  }

  saveDescuento (): void {
    if (!this.descuentoForm.codigo.trim()) {
      alert('El codigo es requerido');
      return;
    }

    if (this.editingDescuento) {
      // Actualizar descuento existente
      const updateData = {
        codigo: this.descuentoForm.  codigo,
        porcentaje: this.descuentoForm.porcentaje,
        fecha_inicio: this.descuentoForm.fecha_inicio,
        fecha_fin: this.descuentoForm.fecha_fin,
        activa: this.descuentoForm.activa
      };
      
      /*this.descuentoService.updateDescuento(this.editingDescuento.id, updateData).subscribe({
        next: () => {
          this.loadDescuentos();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar descuento:', error);
          alert('Error al actualizar descuento');
        }
      });*/
    } else {
      // Crear nuevo descuento
      const newDescuento = {
        codigo: this.descuentoForm.  codigo,
        porcentaje: this.descuentoForm.porcentaje,
        fecha_inicio: this.descuentoForm.fecha_inicio,
        fecha_fin: this.descuentoForm.fecha_fin,
        activa: this.descuentoForm.activa
      };
      
      /*this.descuentoService.createDescuento(newDescuento).subscribe({
        next: () => {
          this.loadDescuentos();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear descuento:', error);
          alert('Error al crear descuento');
        }
      });*/
    }
  }

  deleteDescuento(descuento: any): void {
    /*if (confirm(`¿Está seguro de eliminar el descuento "${descuento.nombre}"?`)) {
      this.descuentoService.deleteDescuento(descuento.id).subscribe({
        next: () => {
          this.loadDescuentos();
        },
        error: (error) => {
          console.error('Error al eliminar descuento:', error);
        }
      });
    }*/
  }
}
