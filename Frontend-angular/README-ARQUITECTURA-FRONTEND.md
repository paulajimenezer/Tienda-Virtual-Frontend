# Guía de Arquitectura Frontend Angular - Implementación de API

## Índice
1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Capas](#estructura-de-capas)
3. [Implementación de API - Paso a Paso](#implementación-de-api---paso-a-paso)
4. [Patrones de Diseño Utilizados](#patrones-de-diseño-utilizados)
5. [Guía para Crear Nuevos Endpoints](#guía-para-crear-nuevos-endpoints)
6. [Mejores Prácticas](#mejores-prácticas)

---

## Arquitectura General

### Principios de Diseño
- **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica
- **Inversión de Dependencias**: Los componentes dependen de abstracciones, no de implementaciones
- **Reutilización**: Servicios y modelos reutilizables
- **Mantenibilidad**: Código organizado y fácil de mantener
- **Escalabilidad**: Fácil agregar nuevas funcionalidades

### Diagrama de Arquitectura
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Components    │  │   Templates     │  │   Guards     │ │
│  │   (Features)    │  │   (HTML/SCSS)   │  │   (Routes)   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LAYER                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │    Services     │  │   Interceptors  │  │   Models     │ │
│  │   (Core/API)    │  │   (HTTP/Auth)   │  │   (Types)    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   HTTP Client   │  │   Local Storage │  │   Backend    │ │
│  │   (Angular)     │  │   (Auth/Data)   │  │   (FastAPI)  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Capas

### 1. **Presentation Layer** (Capa de Presentación)
```
src/app/features/
├── auth/                    # Módulo de autenticación
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── categoria/               # Módulo de categorías
│   └── categoria-list/
├── producto/                # Módulo de productos
│   └── producto-list/
└── usuario/                 # Módulo de usuarios
    └── usuario-list/
```

### 2. **Business Layer** (Capa de Negocio)
```
src/app/core/
├── services/                # Servicios de negocio
│   ├── api.service.ts      # Servicio base para HTTP
│   ├── auth.service.ts     # Servicio de autenticación
│   ├── categoria.service.ts # Servicio de categorías
│   ├── producto.service.ts  # Servicio de productos
│   └── usuario.service.ts   # Servicio de usuarios
├── interceptors/            # Interceptores HTTP
│   ├── auth.interceptor.ts  # Interceptor de autenticación
│   └── error.interceptor.ts # Interceptor de errores
├── guards/                 # Guards de rutas
│   ├── auth.guard.ts       # Guard de autenticación
│   └── login.guard.ts      # Guard de login
└── models/                 # Modelos base
    └── api-response.model.ts
```

### 3. **Data Layer** (Capa de Datos)
```
src/app/shared/
├── models/                 # Modelos de dominio
│   ├── categoria.model.ts
│   ├── producto.model.ts
│   └── usuario.model.ts
└── components/             # Componentes compartidos
    └── sidebar/
```

---

## Implementación de API - Paso a Paso

### Paso 1: Definir el Modelo de Datos
```typescript
// src/app/shared/models/entidad.model.ts
export interface Entidad {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_edicion?: string;
}

export interface CreateEntidadRequest {
  nombre: string;
  descripcion?: string;
}

export interface UpdateEntidadRequest {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface EntidadFilters {
  nombre?: string;
  activo?: boolean;
}
```

### Paso 2: Crear el Servicio de API
```typescript
// src/app/core/services/entidad.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Entidad, CreateEntidadRequest, UpdateEntidadRequest, EntidadFilters } from '../../shared/models/entidad.model';
import { PaginationParams } from '../models/api-response.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class EntidadService {
  private readonly endpoint = '/entidades';

  constructor(private apiService: ApiService) { }

  // CRUD Operations
  getEntidades(pagination: PaginationParams, filters?: EntidadFilters): Observable<Entidad[]> {
    return this.apiService.getPaginated<Entidad>(this.endpoint, pagination, filters);
  }

  getEntidadById(id: string): Observable<Entidad> {
    return this.apiService.get<Entidad>(`${this.endpoint}/${id}`);
  }

  createEntidad(entidad: CreateEntidadRequest): Observable<Entidad> {
    return this.apiService.post<Entidad>(this.endpoint, entidad);
  }

  updateEntidad(id: string, entidad: UpdateEntidadRequest): Observable<Entidad> {
    return this.apiService.put<Entidad>(`${this.endpoint}/${id}`, entidad);
  }

  deleteEntidad(id: string): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`);
  }
}
```

### Paso 3: Crear el Componente de Lista
```typescript
// src/app/features/entidad/entidad-list/entidad-list.component.ts
import { Component, OnInit } from '@angular/core';
import { EntidadService } from '../../../core/services/entidad.service';
import { Entidad, EntidadFilters } from '../../../shared/models/entidad.model';
import { PaginationParams } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-entidad-list',
  templateUrl: './entidad-list.component.html',
  styleUrls: ['./entidad-list.component.scss']
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
    this.loadEntidades();
  }

  loadEntidades(): void {
    this.loading = true;
    const pagination: PaginationParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    this.entidadService.getEntidades(pagination, this.filters).subscribe({
      next: (entidades) => {
        this.entidades = entidades;
        this.totalPages = Math.ceil(entidades.length / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar entidades:', error);
        this.loading = false;
      }
    });
  }

  // CRUD Operations
  openCreateModal(): void {
    this.editingEntidad = null;
    this.entidadForm = { nombre: '', descripcion: '', activo: true };
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

  saveEntidad(): void {
    if (!this.entidadForm.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    if (this.editingEntidad) {
      // Update
      this.entidadService.updateEntidad(this.editingEntidad.id, this.entidadForm).subscribe({
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
      // Create
      this.entidadService.createEntidad(this.entidadForm).subscribe({
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
    if (confirm(`¿Está seguro de eliminar "${entidad.nombre}"?`)) {
      this.entidadService.deleteEntidad(entidad.id).subscribe({
        next: () => this.loadEntidades(),
        error: (error) => console.error('Error al eliminar entidad:', error)
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingEntidad = null;
    this.entidadForm = { nombre: '', descripcion: '', activo: true };
  }
}
```

### Paso 4: Configurar Rutas
```typescript
// src/app/features/entidad/entidad.routes.ts
import { Routes } from '@angular/router';
import { EntidadListComponent } from './entidad-list/entidad-list.component';

export const entidadRoutes: Routes = [
  {
    path: '',
    component: EntidadListComponent
  }
];
```

### Paso 5: Integrar en la Aplicación Principal
```typescript
// src/app/app.routes.ts
import { entidadRoutes } from './features/entidad/entidad.routes';

export const routes: Routes = [
  // ... otras rutas
  {
    path: 'entidades',
    loadChildren: () => import('./features/entidad/entidad.routes').then(m => entidadRoutes)
  }
];
```

---

## Patrones de Diseño Utilizados

### 1. **Service Layer Pattern**
- **Propósito**: Centralizar la lógica de negocio y comunicación con la API
- **Implementación**: Servicios inyectables con métodos específicos
- **Beneficios**: Reutilización, testabilidad, separación de responsabilidades

### 2. **Repository Pattern**
- **Propósito**: Abstraer el acceso a datos
- **Implementación**: `ApiService` como repositorio base
- **Beneficios**: Independencia de la fuente de datos, facilita testing

### 3. **Observer Pattern**
- **Propósito**: Manejar flujos de datos asíncronos
- **Implementación**: RxJS Observables
- **Beneficios**: Reactividad, manejo de estados, composición de operaciones

### 4. **Dependency Injection**
- **Propósito**: Inversión de control y gestión de dependencias
- **Implementación**: Angular DI system
- **Beneficios**: Testabilidad, flexibilidad, mantenibilidad

### 5. **Interceptor Pattern**
- **Propósito**: Interceptar y modificar peticiones HTTP
- **Implementación**: HTTP Interceptors
- **Beneficios**: Cross-cutting concerns, autenticación automática

---

## Guía para Crear Nuevos Endpoints

### Checklist para Nuevo Endpoint

#### 1. **Definir el Modelo**
- [ ] Crear interface para la entidad
- [ ] Definir interfaces para requests (Create, Update)
- [ ] Definir interface para filtros
- [ ] Agregar validaciones necesarias

#### 2. **Crear el Servicio**
- [ ] Extender `ApiService` base
- [ ] Implementar métodos CRUD
- [ ] Agregar métodos específicos del negocio
- [ ] Manejar errores apropiadamente

#### 3. **Crear el Componente**
- [ ] Implementar lista con paginación
- [ ] Agregar formularios de creación/edición
- [ ] Implementar filtros
- [ ] Manejar estados de carga

#### 4. **Configurar Rutas**
- [ ] Crear archivo de rutas del módulo
- [ ] Integrar en rutas principales
- [ ] Agregar guards si es necesario

#### 5. **Integrar en la UI**
- [ ] Agregar al sidebar/navegación
- [ ] Implementar permisos de acceso
- [ ] Agregar estilos consistentes

### Ejemplo Completo: Endpoint de "Pedidos"

#### 1. Modelo
```typescript
// src/app/shared/models/pedido.model.ts
export interface Pedido {
  id: string;
  usuario_id: string;
  producto_id: string;
  cantidad: number;
  precio_total: number;
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  fecha_pedido: string;
  fecha_entrega?: string;
}

export interface CreatePedidoRequest {
  usuario_id: string;
  producto_id: string;
  cantidad: number;
}

export interface UpdatePedidoRequest {
  cantidad?: number;
  estado?: string;
}

export interface PedidoFilters {
  usuario_id?: string;
  producto_id?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}
```

#### 2. Servicio
```typescript
// src/app/core/services/pedido.service.ts
@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly endpoint = '/pedidos';

  constructor(private apiService: ApiService) { }

  getPedidos(pagination: PaginationParams, filters?: PedidoFilters): Observable<Pedido[]> {
    return this.apiService.getPaginated<Pedido>(this.endpoint, pagination, filters);
  }

  getPedidoById(id: string): Observable<Pedido> {
    return this.apiService.get<Pedido>(`${this.endpoint}/${id}`);
  }

  createPedido(pedido: CreatePedidoRequest): Observable<Pedido> {
    return this.apiService.post<Pedido>(this.endpoint, pedido);
  }

  updatePedido(id: string, pedido: UpdatePedidoRequest): Observable<Pedido> {
    return this.apiService.put<Pedido>(`${this.endpoint}/${id}`, pedido);
  }

  cancelarPedido(id: string): Observable<Pedido> {
    return this.apiService.patch<Pedido>(`${this.endpoint}/${id}/cancelar`, {});
  }

  getPedidosByUsuario(usuarioId: string): Observable<Pedido[]> {
    return this.apiService.get<Pedido[]>(`${this.endpoint}/usuario/${usuarioId}`);
  }
}
```

---

## Mejores Prácticas

### 1. **Naming Conventions**
- **Servicios**: `[Entidad]Service` (ej: `ProductoService`)
- **Modelos**: `[Entidad]`, `Create[Entidad]Request`, `Update[Entidad]Request`
- **Componentes**: `[Entidad]ListComponent`, `[Entidad]FormComponent`
- **Rutas**: `[entidad].routes.ts`

### 2. **Error Handling**
```typescript
// Patrón estándar para manejo de errores
this.entidadService.getEntidades(pagination, filters).subscribe({
  next: (data) => {
    // Manejo exitoso
    this.entidades = data;
    this.loading = false;
  },
  error: (error) => {
    // Manejo de errores
    console.error('Error:', error);
    this.loading = false;
    this.showErrorMessage(error);
  }
});
```

### 3. **Loading States**
```typescript
// Siempre manejar estados de carga
loading = false;

loadData(): void {
  this.loading = true;
  this.service.getData().subscribe({
    next: (data) => {
      this.data = data;
      this.loading = false;
    },
    error: (error) => {
      this.loading = false;
      // manejar error
    }
  });
}
```

### 4. **Type Safety**
```typescript
// Usar tipos específicos en lugar de 'any'
getEntidadById(id: string): Observable<Entidad> {
  return this.apiService.get<Entidad>(`${this.endpoint}/${id}`);
}
```

### 5. **Reactive Forms**
```typescript
// Para formularios complejos, usar Reactive Forms
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class EntidadFormComponent {
  entidadForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.entidadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      activo: [true]
    });
  }
}
```

### 6. **Environment Configuration**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  appName: 'Frontend Angular - Arquitectura Limpia',
  version: '1.0.0'
};
```

---

## Herramientas y Utilidades

### 1. **HTTP Interceptors**
- **Auth Interceptor**: Agrega automáticamente el token de autenticación
- **Error Interceptor**: Maneja errores globales de la aplicación

### 2. **Guards**
- **Auth Guard**: Protege rutas que requieren autenticación
- **Role Guard**: Protege rutas basadas en roles de usuario

### 3. **Models Base**
- **ApiResponse**: Modelo base para respuestas de la API
- **PaginationParams**: Parámetros estándar para paginación

---

## Ventajas de esta Arquitectura

### 1. **Mantenibilidad**
- Código organizado por capas
- Responsabilidades claras
- Fácil localización de funcionalidades

### 2. **Escalabilidad**
- Fácil agregar nuevos módulos
- Patrones consistentes
- Reutilización de componentes

### 3. **Testabilidad**
- Servicios inyectables
- Separación de responsabilidades
- Mocks fáciles de implementar

### 4. **Performance**
- Lazy loading de módulos
- OnPush change detection
- Optimización de bundles

### 5. **Developer Experience**
- TypeScript para type safety
- IntelliSense completo
- Refactoring seguro

---

## Conclusión

Esta arquitectura proporciona una base sólida para el desarrollo de aplicaciones Angular escalables y mantenibles. Siguiendo estos patrones y mejores prácticas, cualquier desarrollador puede:

1. **Entender rápidamente** la estructura del proyecto
2. **Agregar nuevas funcionalidades** de manera consistente
3. **Mantener el código** con facilidad
4. **Escalar la aplicación** sin problemas
5. **Colaborar efectivamente** en equipo

La clave está en seguir los patrones establecidos y mantener la consistencia en toda la aplicación.
