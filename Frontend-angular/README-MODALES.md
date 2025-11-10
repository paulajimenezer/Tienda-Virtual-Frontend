# Guía de Implementación de Modales y Grids

Esta guía explica paso a paso cómo implementar modales de crear/editar y grids de datos en Angular.

## Tabla de Contenidos

1. [¿Qué es un Modal?](#qué-es-un-modal)
2. [Cómo Funcionan los Modales en Angular](#cómo-funcionan-los-modales-en-angular)
3. [Estructura del Componente](#estructura-del-componente)
4. [Implementación del Grid](#implementación-del-grid)
5. [Implementación del Modal](#implementación-del-modal)
6. [Datos Dummy para Pruebas](#datos-dummy-para-pruebas)
7. [Estilos CSS](#estilos-css)
8. [Funcionalidades Completas](#funcionalidades-completas)

## ¿Qué es un Modal?

Un modal es un componente de interfaz de usuario que se muestra como una ventana flotante sobre el contenido principal de la página. Los modales son útiles para:

- **Formularios de creación/edición**: Permiten al usuario crear o modificar datos sin navegar a otra página
- **Confirmaciones**: Mostrar diálogos de confirmación para acciones importantes
- **Información detallada**: Mostrar contenido adicional sin perder el contexto
- **Interacciones rápidas**: Realizar tareas específicas sin salir de la vista actual

### Características principales de un modal:
- **Overlay**: Fondo semi-transparente que cubre toda la pantalla
- **Centrado**: Se posiciona en el centro de la ventana
- **No bloquea la navegación**: Permite cerrar con ESC o haciendo clic fuera
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Accesible**: Cumple con estándares de accesibilidad

## Cómo Funcionan los Modales en Angular

### 1. Control de Estado
Los modales en Angular se controlan mediante variables booleanas que determinan cuándo mostrar u ocultar el modal:

```typescript
showModal = false; // Variable que controla la visibilidad
```

### 2. Binding de Propiedades
Angular utiliza property binding para mostrar/ocultar el modal:

```html
<div class="modal" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'">
```

### 3. Event Binding
Los eventos del usuario (clicks, teclas) se manejan con event binding:

```html
<button (click)="openModal()">Abrir Modal</button>
<button (click)="closeModal()">Cerrar Modal</button>
```

### 4. Two-Way Data Binding
Para formularios dentro del modal, se usa ngModel para sincronizar datos:

```html
<input [(ngModel)]="formData.nombre" name="nombre">
```

### 5. Ciclo de Vida del Modal
1. **Inicialización**: `showModal = false`
2. **Apertura**: Usuario hace clic en botón → `showModal = true`
3. **Interacción**: Usuario llena formulario
4. **Cierre**: Usuario guarda o cancela → `showModal = false`

### 6. Gestión de Datos
- **Crear**: Formulario vacío, al guardar se crea nuevo registro
- **Editar**: Formulario pre-poblado, al guardar se actualiza registro existente

## Estructura del Componente

### Archivos necesarios:
```
src/app/features/[entidad]/[entidad]-list/
├── [entidad]-list.component.ts
├── [entidad]-list.component.html
└── [entidad]-list.component.scss
```

## Implementación del Grid

### 1. HTML del Grid (component.html)

```html
<div class="entidad-list">
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Gestión de [Entidades]</h2>
      <button class="btn btn-success" (click)="openCreateModal()">
        Nueva [Entidad]
      </button>
    </div>
    
    <div class="card-body">
      <!-- Filtros -->
      <div class="filters mb-3">
        <div class="row">
          <div class="col-md-4">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Buscar por nombre..."
              [(ngModel)]="filters.nombre"
              (input)="onFilterChange()"
            >
          </div>
          <div class="col-md-3">
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

      <!-- Tabla de datos -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading">
              <td colspan="6" class="text-center">Cargando...</td>
            </tr>
            <tr *ngIf="!loading && entidades.length === 0">
              <td colspan="6" class="text-center">No hay datos disponibles</td>
            </tr>
            <tr *ngFor="let entidad of entidades">
              <td>{{ entidad.id }}</td>
              <td>{{ entidad.nombre }}</td>
              <td>{{ entidad.descripcion || '-' }}</td>
              <td>
                <span class="badge" [class.badge-success]="entidad.activo" [class.badge-danger]="!entidad.activo">
                  {{ entidad.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ entidad.fecha_creacion | date:'short' }}</td>
              <td>
                <button class="btn btn-sm btn-primary" (click)="editEntidad(entidad)">
                  Editar
                </button>
                <button class="btn btn-sm btn-danger" (click)="deleteEntidad(entidad)">
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
```

## Implementación del Modal

### 2. HTML del Modal (agregar al final del component.html)

```html
<!-- Modal para crear/editar entidad -->
<div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ editingEntidad ? 'Editar [Entidad]' : 'Nueva [Entidad]' }}</h5>
        <button type="button" class="close" (click)="closeModal()">
          <span>&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form (ngSubmit)="saveEntidad()">
          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input 
              type="text" 
              class="form-control" 
              id="nombre" 
              [(ngModel)]="entidadForm.nombre" 
              name="nombre"
              required
              placeholder="Ingrese el nombre"
            >
          </div>
          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea 
              class="form-control" 
              id="descripcion" 
              [(ngModel)]="entidadForm.descripcion" 
              name="descripcion"
              rows="3"
              placeholder="Ingrese una descripción (opcional)"
            ></textarea>
          </div>
          <div class="form-group">
            <div class="form-check">
              <input 
                type="checkbox" 
                class="form-check-input" 
                id="activo" 
                [(ngModel)]="entidadForm.activo" 
                name="activo"
              >
              <label class="form-check-label" for="activo">
                [Entidad] activa
              </label>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" (click)="saveEntidad()">
          {{ editingEntidad ? 'Actualizar' : 'Crear' }}
        </button>
      </div>
    </div>
  </div>
</div>
```

## Implementación del TypeScript

### 3. Componente TypeScript (component.ts)

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationParams } from '../../../core/models/api-response.model';
import { EntidadService } from '../../../core/services/entidad.service';
import { Entidad, EntidadFilters } from '../../../shared/models/entidad.model';

@Component({
  selector: 'app-entidad-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entidad-list.component.html',
  styleUrl: './entidad-list.component.scss'
})
export class EntidadListComponent implements OnInit {
  entidades: Entidad[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  
  filters: EntidadFilters = {};
  
  // Modal properties
  showModal = false;
  editingEntidad: Entidad | null = null;
  entidadForm = {
    nombre: '',
    descripcion: '',
    activo: true
  };

  constructor(private entidadService: EntidadService) { }

  ngOnInit(): void {
    // Agregar un dato dummy para pruebas
    this.entidades = [{
      id: 1,
      nombre: 'Ejemplo',
      descripcion: 'Descripción de ejemplo',
      activo: true,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    }];
    this.totalPages = 1;
    // this.loadEntidades();
  }

  loadEntidades(): void {
    this.loading = true;
    const pagination: PaginationParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    this.entidadService.getEntidades(pagination, this.filters).subscribe({
      next: (response) => {
        this.entidades = response.data;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar entidades:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadEntidades();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadEntidades();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEntidades();
    }
  }

  // Modal methods
  openCreateModal(): void {
    this.editingEntidad = null;
    this.entidadForm = {
      nombre: '',
      descripcion: '',
      activo: true
    };
    this.showModal = true;
  }

  editEntidad(entidad: Entidad): void {
    this.editingEntidad = entidad;
    this.entidadForm = {
      nombre: entidad.nombre,
      descripcion: entidad.descripcion || '',
      activo: entidad.activo
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingEntidad = null;
    this.entidadForm = {
      nombre: '',
      descripcion: '',
      activo: true
    };
  }

  saveEntidad(): void {
    if (!this.entidadForm.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    if (this.editingEntidad) {
      // Actualizar entidad existente
      const updateData = {
        nombre: this.entidadForm.nombre,
        descripcion: this.entidadForm.descripcion,
        activo: this.entidadForm.activo
      };
      
      this.entidadService.updateEntidad(this.editingEntidad.id, updateData).subscribe({
        next: () => {
          this.loadEntidades();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar entidad:', error);
          alert('Error al actualizar la entidad');
        }
      });
    } else {
      // Crear nueva entidad
      const newEntidad = {
        nombre: this.entidadForm.nombre,
        descripcion: this.entidadForm.descripcion,
        activo: this.entidadForm.activo
      };
      
      this.entidadService.createEntidad(newEntidad).subscribe({
        next: () => {
          this.loadEntidades();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear entidad:', error);
          alert('Error al crear la entidad');
        }
      });
    }
  }

  deleteEntidad(entidad: Entidad): void {
    if (confirm(`¿Está seguro de eliminar la entidad "${entidad.nombre}"?`)) {
      this.entidadService.deleteEntidad(entidad.id).subscribe({
        next: () => {
          this.loadEntidades();
        },
        error: (error) => {
          console.error('Error al eliminar entidad:', error);
        }
      });
    }
  }
}
```

## Estilos CSS

### 4. Estilos del Componente (component.scss)

```scss
// Estilos básicos del grid
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

// Estilos del modal
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  display: none;
}

.modal.show {
  display: block !important;
}

.modal-dialog {
  position: relative;
  max-width: 500px;
  margin: 1.75rem auto;
  transform: translateY(-50%);
  top: 50%;
}

.modal-content {
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  background-color: white;
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  opacity: 0.5;
  cursor: pointer;
}

.close:hover {
  opacity: 0.75;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-check {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.form-check-input {
  margin-right: 0.5rem;
}

.form-check-label {
  margin-bottom: 0;
  font-weight: normal;
}
```

## Datos Dummy para Pruebas

### 5. Implementación de datos de prueba

```typescript
ngOnInit(): void {
  // Agregar un dato dummy para pruebas
  this.entidades = [{
    id: 1,
    nombre: 'Ejemplo',
    descripcion: 'Descripción de ejemplo',
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  }];
  this.totalPages = 1;
  // this.loadEntidades(); // Comentado para usar datos dummy
}
```

## Funcionalidades Completas

### 6. Lista de funcionalidades implementadas

- **Grid con datos**: Tabla responsive con paginación
- **Filtros**: Búsqueda por nombre y estado
- **Modal de crear**: Formulario para nueva entidad
- **Modal de editar**: Formulario pre-poblado para editar
- **Validaciones**: Campos requeridos y validaciones
- **Estados de carga**: Indicadores de loading
- **Mensajes de error**: Alertas para errores
- **Confirmaciones**: Diálogos de confirmación para eliminar
- **Responsive**: Diseño adaptable a diferentes pantallas
- **Estilos consistentes**: Diseño uniforme en todos los componentes

## Pasos para Implementar

1. **Crear la estructura de archivos** según el patrón mostrado
2. **Implementar el HTML** del grid y modal
3. **Implementar el TypeScript** con todas las funcionalidades
4. **Agregar los estilos CSS** para el modal y grid
5. **Agregar datos dummy** para pruebas
6. **Probar todas las funcionalidades** (crear, editar, eliminar, filtrar)

## Notas Importantes

- Reemplazar `[Entidad]` con el nombre real de tu entidad
- Ajustar los campos del formulario según tus necesidades
- Modificar los filtros según los campos de tu entidad
- Personalizar los estilos según tu diseño
- Integrar con el backend cuando esté disponible

## Personalización por Entidad

### Para Categorías:
- Campos: nombre, descripción, activo
- Filtros: nombre, estado

### Para Usuarios:
- Campos: email, nombre, apellido, password, activo
- Filtros: email, nombre, estado

### Para Productos:
- Campos: nombre, descripción, precio, stock, categoría, activo
- Filtros: nombre, precio, estado
- Modal más grande (modal-lg)

---

**Listo!** Con esta guía puedes implementar modales y grids completos para cualquier entidad en tu aplicación Angular.
