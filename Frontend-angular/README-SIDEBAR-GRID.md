# Guía Completa: Sidebar y Grid en Angular

## Descripción General

Esta guía te enseñará paso a paso cómo crear un **sidebar responsivo** y un **sistema de grid** completo en Angular, incluyendo cómo agregar nuevas secciones y funcionalidades sin necesidad de backend.

## Estructura de Archivos

```
04-Frontend-angular/
├── src/
│   ├── app/
│   │   ├── shared/
│   │   │   └── components/
│   │   │       └── sidebar/
│   │   │           ├── sidebar.component.ts
│   │   │           ├── sidebar.component.html
│   │   │           └── sidebar.component.scss
│   │   ├── features/
│   │   │   └── producto/
│   │   │       └── producto-list/
│   │   │           ├── producto-list.component.ts
│   │   │           ├── producto-list.component.html
│   │   │           └── producto-list.component.scss
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   └── styles.scss
```

## Paso 1: Crear el Sidebar

### 1.1 Crear la Estructura de Carpetas

```bash
# Navegar al proyecto
cd 04-Frontend-angular

# Crear carpetas del sidebar
mkdir -p src/app/shared/components/sidebar
```

### 1.2 Crear el Componente TypeScript

**Archivo**: `src/app/shared/components/sidebar/sidebar.component.ts`

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

// Interface para definir las rutas del menú
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

// Array con todas las rutas del sidebar
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '' },
    { path: '/categorias', title: 'Categorías',  icon:'shopping_basket', class: '' },
    { path: '/usuarios', title: 'Usuarios',  icon:'users_single-02', class: '' },
    { path: '/productos', title: 'Productos',  icon:'shopping_box', class: '' },
    { path: '/notifications', title: 'Notificaciones',  icon:'ui-1_bell-53', class: '' },
    { path: '/upgrade', title: 'Configuración',  icon:'objects_spaceship', class: 'active active-pro' }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  // Array que contendrá los elementos del menú
  menuItems: any[] = [];

  constructor() { }

  ngOnInit() {
    // Cargar las rutas en el array del menú
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  
  // Método para detectar si es móvil
  isMobileMenu() {
      if ( window.innerWidth > 991) {
          return false;
      }
      return true;
  };
}
```

### 1.3 Crear el Template HTML

**Archivo**: `src/app/shared/components/sidebar/sidebar.component.html`

```html
<!-- Logo del sistema -->
<div class="logo">
    <a href="#" class="simple-text logo-mini">
      <div class="logo-img">
          <div class="logo-text">ITM</div>
      </div>
    </a>
    <a href="#" class="simple-text logo-normal">
        Sistema ITM
    </a>
</div>

<!-- Navegación del sidebar -->
<div class="sidebar-wrapper">
    <ul class="nav">
        <!-- Iterar sobre cada elemento del menú -->
        <li routerLinkActive="active" *ngFor="let menuItem of menuItems" class="{{menuItem.class}} nav-item">
            <a [routerLink]="[menuItem.path]">
                <i class="now-ui-icons {{menuItem.icon}}"></i>
                <p>{{menuItem.title}}</p>
            </a>
        </li>
    </ul>
</div>
```

### 1.4 Crear los Estilos SCSS

**Archivo**: `src/app/shared/components/sidebar/sidebar.component.scss`

```scss
// Estilos del sidebar
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  width: 260px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

// Logo del sidebar
.logo {
  padding: 15px 0;
  margin: 0;
  display: block;
  position: relative;
  z-index: 4;
}

.logo-img {
  width: 30px;
  height: 30px;
  display: inline-block;
  margin-left: 10px;
  margin-right: 15px;
  border-radius: 30px;
  text-align: center;
  overflow: hidden;
  vertical-align: middle;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  color: white;
  font-weight: bold;
  font-size: 12px;
  text-align: center;
}

.simple-text {
  padding: 5px 0px;
  display: block;
  white-space: nowrap;
  font-size: 14px;
  color: #fff;
  text-decoration: none;
  font-weight: 400;
  line-height: 30px;
  overflow: hidden;
}

// Navegación del sidebar
.nav {
  margin-top: 20px;
  display: block;
}

.nav li {
  position: relative;
  display: block;
}

.nav li > a {
  color: #fff;
  display: block;
  text-decoration: none;
  position: relative;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 12px;
  padding: 10px 8px;
  line-height: 30px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.nav li > a:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
  color: #fff;
}

.nav li > a.active {
  background: rgba(255, 255, 255, 0.2);
  opacity: 1;
  color: #fff;
}

.nav li > a i {
  font-size: 20px;
  float: left;
  margin-right: 12px;
  line-height: 30px;
  width: 34px;
  text-align: center;
}

.nav li > a p {
  margin: 0;
  line-height: 30px;
  font-size: 14px;
  position: relative;
  display: block;
  height: auto;
  white-space: nowrap;
  transition: 0.3s ease;
}

// Responsive design
@media (max-width: 991px) {
  .sidebar {
    position: fixed;
    display: block;
    top: 0;
    height: 100%;
    width: 260px;
    right: auto;
    left: 0;
    z-index: 1032;
    visibility: visible;
    overflow-y: visible;
    padding: 0;
    transform: translate3d(-260px, 0, 0);
    transition: all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1);
  }
  
  .sidebar.show {
    transform: translate3d(0, 0, 0);
  }
}
```

## Paso 2: Crear el Sistema de Grid

### 2.1 Crear el Componente de Productos

**Archivo**: `src/app/features/producto/producto-list/producto-list.component.ts`

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

// Interface para definir la estructura de un producto
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  fechaCreacion: string;
}

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.scss']
})
export class ProductoListComponent implements OnInit {
  
  // Array con datos de ejemplo de productos
  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Laptop Dell Inspiron',
      descripcion: 'Laptop para trabajo y entretenimiento',
      precio: 2500000,
      categoria: 'Tecnología',
      stock: 15,
      fechaCreacion: '2025-01-15'
    },
    {
      id: 2,
      nombre: 'Mouse Inalámbrico',
      descripcion: 'Mouse óptico inalámbrico ergonómico',
      precio: 85000,
      categoria: 'Accesorios',
      stock: 50,
      fechaCreacion: '2025-01-14'
    },
    {
      id: 3,
      nombre: 'Teclado Mecánico',
      descripcion: 'Teclado mecánico RGB para gaming',
      precio: 320000,
      categoria: 'Accesorios',
      stock: 25,
      fechaCreacion: '2025-01-13'
    },
    {
      id: 4,
      nombre: 'Monitor 24"',
      descripcion: 'Monitor Full HD para oficina',
      precio: 450000,
      categoria: 'Monitores',
      stock: 12,
      fechaCreacion: '2025-01-12'
    },
    {
      id: 5,
      nombre: 'Auriculares Bluetooth',
      descripcion: 'Auriculares inalámbricos con cancelación de ruido',
      precio: 180000,
      categoria: 'Audio',
      stock: 30,
      fechaCreacion: '2025-01-11'
    },
    {
      id: 6,
      nombre: 'Tablet Samsung',
      descripcion: 'Tablet Android para trabajo y entretenimiento',
      precio: 1200000,
      categoria: 'Tecnología',
      stock: 8,
      fechaCreacion: '2025-01-10'
    }
  ];

  constructor() { }

  ngOnInit() {
    // Lógica de inicialización si es necesaria
  }

  // Método para formatear precios en pesos colombianos
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // Método para crear un nuevo producto
  crearProducto() {
    console.log('Crear nuevo producto');
    // Aquí se implementaría la lógica para crear un nuevo producto
    alert('Función de crear producto - Por implementar');
  }

  // Método para editar un producto existente
  editarProducto(producto: Producto) {
    console.log('Editar producto:', producto);
    // Aquí se implementaría la lógica para editar un producto
    alert(`Editando producto: ${producto.nombre}`);
  }

  // Método para eliminar un producto
  eliminarProducto(producto: Producto) {
    console.log('Eliminar producto:', producto);
    // Aquí se implementaría la lógica para eliminar un producto
    if (confirm(`¿Estás seguro de eliminar ${producto.nombre}?`)) {
      alert(`Producto ${producto.nombre} eliminado`);
    }
  }
}
```

### 2.2 Crear el Template HTML del Grid

**Archivo**: `src/app/features/producto/producto-list/producto-list.component.html`

```html
<!-- Panel de encabezado -->
<div class="panel-header panel-header-sm">
</div>

<!-- Contenido principal -->
<div class="main-content">
  <div class="row">
    
    <!-- Vista de tabla -->
    <div class="col-md-12">
      <div class="card">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="card-title">Gestión de Productos</h4>
              <p class="category">Administra el inventario de productos</p>
            </div>
            <button class="btn btn-primary" (click)="crearProducto()">
              <i class="now-ui-icons ui-1_simple-add"></i>
              Crear Producto
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead class="text-primary">
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Fecha Creación</th>
                <th class="text-right">Acciones</th>
              </thead>
              <tbody>
                <tr *ngFor="let producto of productos">
                  <td>{{producto.id}}</td>
                  <td>{{producto.nombre}}</td>
                  <td>{{producto.descripcion}}</td>
                  <td>{{formatearPrecio(producto.precio)}}</td>
                  <td>
                    <span class="badge badge-primary">{{producto.categoria}}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="producto.stock > 20 ? 'badge-success' : producto.stock > 10 ? 'badge-warning' : 'badge-danger'">
                      {{producto.stock}}
                    </span>
                  </td>
                  <td>{{producto.fechaCreacion}}</td>
                  <td class="text-right">
                    <button class="btn btn-sm btn-info" (click)="editarProducto(producto)" title="Editar">
                      <i class="now-ui-icons ui-2_settings-90"></i>
                    </button>
                    <button class="btn btn-sm btn-danger ml-2" (click)="eliminarProducto(producto)" title="Eliminar">
                      <i class="now-ui-icons ui-1_simple-remove"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Vista de grid con cards -->
    <div class="col-md-12">
      <div class="card card-plain">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="card-title">Vista de Productos</h4>
              <p class="category">Visualización en grid de todos los productos</p>
            </div>
            <button class="btn btn-success" (click)="crearProducto()">
              <i class="now-ui-icons ui-1_simple-add"></i>
              Nuevo Producto
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <!-- Card de producto individual -->
            <div class="col-md-4 col-sm-6 mb-4" *ngFor="let producto of productos">
              <div class="card product-card">
                <div class="card-body">
                  <div class="product-header">
                    <h5 class="product-title">{{producto.nombre}}</h5>
                    <span class="badge badge-primary">{{producto.categoria}}</span>
                  </div>
                  <p class="product-description">{{producto.descripcion}}</p>
                  <div class="product-details">
                    <div class="detail-item">
                      <strong>Precio:</strong>
                      <span class="price">{{formatearPrecio(producto.precio)}}</span>
                    </div>
                    <div class="detail-item">
                      <strong>Stock:</strong>
                      <span class="stock" [ngClass]="producto.stock > 20 ? 'text-success' : producto.stock > 10 ? 'text-warning' : 'text-danger'">
                        {{producto.stock}} unidades
                      </span>
                    </div>
                    <div class="detail-item">
                      <strong>Fecha:</strong>
                      <span class="date">{{producto.fechaCreacion}}</span>
                    </div>
                  </div>
                  <div class="product-actions">
                    <button class="btn btn-sm btn-info" (click)="editarProducto(producto)">
                      <i class="now-ui-icons ui-2_settings-90"></i>
                      Editar
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="eliminarProducto(producto)">
                      <i class="now-ui-icons ui-1_simple-remove"></i>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2.3 Crear los Estilos SCSS del Grid

**Archivo**: `src/app/features/producto/producto-list/producto-list.component.scss`

```scss
// Estilos del contenido principal
.main-content {
  padding: 20px;
  margin-left: 260px; // Espacio para el sidebar
  min-height: 100vh;
  background: #f8f9fa;
}

.panel-header {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: -20px -20px 20px -20px;
  border-radius: 0 0 10px 10px;
}

.panel-header-sm {
  height: 40px;
}

// Estilos de las cards
.card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: none;
  margin-bottom: 30px;
}

.card-header {
  background: transparent;
  border-bottom: 1px solid #e9ecef;
  padding: 20px;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.category {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 5px 0 0 0;
}

.card-body {
  padding: 20px;
}

// Estilos de la tabla
.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  border-top: none;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table td {
  vertical-align: middle;
  border-top: 1px solid #e9ecef;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

// Estilos de los badges
.badge {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
}

.badge-primary {
  background-color: #007bff;
  color: white;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #212529;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}

// Estilos de las cards de productos
.product-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e9ecef;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  margin-right: 10px;
}

.product-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.4;
}

.product-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.detail-item strong {
  color: #495057;
  font-weight: 600;
}

.price {
  color: #28a745;
  font-weight: 600;
}

.stock {
  font-weight: 600;
}

.text-success {
  color: #28a745 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.date {
  color: #6c757d;
}

.product-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.product-actions .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

// Responsive design
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }
  
  .card-header {
    padding: 15px;
  }
  
  .card-body {
    padding: 15px;
  }
  
  .table-responsive {
    font-size: 0.8rem;
  }
  
  .product-card {
    margin-bottom: 20px;
  }
  
  .product-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .product-actions .btn {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 15px;
  }
  
  .product-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-title {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
```

## Paso 3: Integrar el Sidebar en el Layout Principal

### 3.1 Actualizar el App Component

**Archivo**: `src/app/app.component.ts`

```typescript
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent],
  template: `
    <div class="wrapper">
      <div class="sidebar" data-color="red">
        <app-sidebar></app-sidebar>
      </div>
      <div class="main-panel">
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wrapper {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 1000;
      width: 260px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .sidebar[data-color="red"] {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .main-panel {
      flex: 1;
      margin-left: 260px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .content {
      padding: 0;
    }

    @media (max-width: 991px) {
      .sidebar {
        transform: translate3d(-260px, 0, 0);
        transition: all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1);
      }
      
      .sidebar.show {
        transform: translate3d(0, 0, 0);
      }
      
      .main-panel {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent {
  title = 'frontend-angular-clean-architecture';
}
```

### 3.2 Configurar las Rutas

**Archivo**: `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categoria/categoria-list/categoria-list.component').then(m => m.CategoriaListComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/producto/producto-list/producto-list.component').then(m => m.ProductoListComponent)
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuario/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
```

## Paso 4: Configurar Estilos Globales

### 4.1 Agregar Iconos y Utilidades

**Archivo**: `src/styles.scss`

```scss
/* Estilos globales para la aplicación Angular */

/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #06b6d4;
  --light-color: #f8fafc;
  --dark-color: #1e293b;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--dark-color);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-size: 16px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Utilidades */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Spacing utilities */
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-5 { margin-top: 1.25rem; }
.mt-6 { margin-top: 1.5rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-5 { margin-bottom: 1.25rem; }
.mb-6 { margin-bottom: 1.5rem; }

.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }

/* Flexbox utilities */
.d-flex { display: flex; }
.flex-column { flex-direction: column; }
.flex-row { flex-direction: row; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.align-center { align-items: center; }
.align-start { align-items: flex-start; }
.align-end { align-items: flex-end; }

/* Display utilities */
.d-none { display: none; }
.d-block { display: block; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }

/* Width utilities */
.w-100 { width: 100%; }
.w-75 { width: 75%; }
.w-50 { width: 50%; }
.w-25 { width: 25%; }

/* Text utilities */
.text-decoration-none { text-decoration: none; }
.text-decoration-underline { text-decoration: underline; }
.font-weight-bold { font-weight: 700; }
.font-weight-normal { font-weight: 400; }
.font-weight-light { font-weight: 300; }

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25;
  transition: all 0.2s ease-in-out;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn:hover:before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: linear-gradient(135deg, var(--secondary-color), #475569);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn-success {
  background: linear-gradient(135deg, var(--success-color), #059669);
  color: white;
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn-danger {
  background: linear-gradient(135deg, var(--danger-color), #dc2626);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn-info {
  background: linear-gradient(135deg, var(--info-color), #0891b2);
  color: white;
}

.btn-info:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

/* Cards */
.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
}

.card-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.card-body {
  padding: 0;
}

.card-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  margin-top: 1.5rem;
}

/* Formularios */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark-color);
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.form-control::placeholder {
  color: var(--secondary-color);
  opacity: 0.7;
}

.form-control.is-invalid {
  border-color: var(--danger-color);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--danger-color);
  font-weight: 500;
}

/* Tablas */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.table th {
  background: linear-gradient(135deg, var(--light-color), #f1f5f9);
  font-weight: 700;
  color: var(--dark-color);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table tbody tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

/* Alertas */
.alert {
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  border-left: 4px solid;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideInDown 0.3s ease;
}

.alert-success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-left-color: var(--success-color);
  color: #065f46;
}

.alert-danger {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-left-color: var(--danger-color);
  color: #991b1b;
}

.alert-warning {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-left-color: var(--warning-color);
  color: #92400e;
}

.alert-info {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-left-color: var(--info-color);
  color: #1e40af;
}

/* Animaciones */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease;
}

.slide-in-up {
  animation: slideInUp 0.5s ease;
}

.slide-in-down {
  animation: slideInDown 0.5s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .card {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
  }
  
  .table {
    font-size: 0.875rem;
  }
  
  .table th,
  .table td {
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 1rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }
  
  .form-control {
    padding: 0.625rem 0.75rem;
  }
}

/* Loading states */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Glass morphism effect */
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, var(--primary-color), var(--info-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Text contrast utilities */
.text-high-contrast {
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) !important;
  font-weight: 600 !important;
}

.text-title-contrast {
  color: white !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6) !important;
  font-weight: 800 !important;
  letter-spacing: -0.025em !important;
}

.text-medium-contrast {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
  font-weight: 500 !important;
}

.text-dark-contrast {
  color: var(--dark-color) !important;
  font-weight: 600 !important;
}

/* Enhanced readability */
.enhanced-text {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Additional styles for the sidebar layout */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col-md-12 {
  flex: 0 0 100%;
  max-width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}

.col-md-4 {
  flex: 0 0 33.333333%;
  max-width: 33.333333%;
  padding-right: 15px;
  padding-left: 15px;
}

.col-sm-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding-right: 15px;
  padding-left: 15px;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.text-right {
  text-align: right;
}

/* Now UI Icons fallback */
.now-ui-icons {
  font-family: 'Nucleo Outline';
  speak: none;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Simple text icons without emojis */
.now-ui-icons.design_app:before { content: "■"; }
.now-ui-icons.shopping_basket:before { content: "●"; }
.now-ui-icons.users_single-02:before { content: "▲"; }
.now-ui-icons.shopping_box:before { content: "◆"; }
.now-ui-icons.ui-1_bell-53:before { content: "○"; }
.now-ui-icons.objects_spaceship:before { content: "◊"; }
.now-ui-icons.ui-1_simple-add:before { content: "+"; }
.now-ui-icons.ui-2_settings-90:before { content: "●"; }
.now-ui-icons.ui-1_simple-remove:before { content: "×"; }
```

## Paso 5: Cómo Agregar Nuevas Secciones al Sidebar

### 5.1 Agregar Nueva Ruta al Sidebar

**Archivo**: `src/app/shared/components/sidebar/sidebar.component.ts`

```typescript
// Agregar nueva ruta al array ROUTES
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '' },
    { path: '/categorias', title: 'Categorías',  icon:'shopping_basket', class: '' },
    { path: '/usuarios', title: 'Usuarios',  icon:'users_single-02', class: '' },
    { path: '/productos', title: 'Productos',  icon:'shopping_box', class: '' },
    // NUEVA SECCIÓN
    { path: '/ventas', title: 'Ventas',  icon:'shopping_cart', class: '' },
    { path: '/reportes', title: 'Reportes',  icon:'chart_bar', class: '' },
    { path: '/notifications', title: 'Notificaciones',  icon:'ui-1_bell-53', class: '' },
    { path: '/upgrade', title: 'Configuración',  icon:'objects_spaceship', class: 'active active-pro' }
];
```

### 5.2 Crear el Componente de la Nueva Sección

```bash
# Crear componente para ventas
mkdir -p src/app/features/venta/venta-list
```

**Archivo**: `src/app/features/venta/venta-list/venta-list.component.ts`

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Venta {
  id: number;
  cliente: string;
  producto: string;
  cantidad: number;
  precio: number;
  fecha: string;
  estado: string;
}

@Component({
  selector: 'app-venta-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './venta-list.component.html',
  styleUrls: ['./venta-list.component.scss']
})
export class VentaListComponent implements OnInit {
  
  ventas: Venta[] = [
    {
      id: 1,
      cliente: 'Juan Pérez',
      producto: 'Laptop Dell',
      cantidad: 1,
      precio: 2500000,
      fecha: '2025-01-15',
      estado: 'Completada'
    },
    {
      id: 2,
      cliente: 'María García',
      producto: 'Mouse Inalámbrico',
      cantidad: 2,
      precio: 170000,
      fecha: '2025-01-14',
      estado: 'Pendiente'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  crearVenta() {
    alert('Función de crear venta - Por implementar');
  }

  editarVenta(venta: Venta) {
    alert(`Editando venta: ${venta.id}`);
  }

  eliminarVenta(venta: Venta) {
    if (confirm(`¿Eliminar venta ${venta.id}?`)) {
      alert(`Venta ${venta.id} eliminada`);
    }
  }
}
```

### 5.3 Crear el Template HTML de la Nueva Sección

**Archivo**: `src/app/features/venta/venta-list/venta-list.component.html`

```html
<div class="panel-header panel-header-sm">
</div>
<div class="main-content">
  <div class="row">
    <div class="col-md-12">
      <div class="card">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="card-title">Gestión de Ventas</h4>
              <p class="category">Administra las ventas del sistema</p>
            </div>
            <button class="btn btn-primary" (click)="crearVenta()">
              <i class="now-ui-icons ui-1_simple-add"></i>
              Nueva Venta
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead class="text-primary">
                <th>ID</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </thead>
              <tbody>
                <tr *ngFor="let venta of ventas">
                  <td>{{venta.id}}</td>
                  <td>{{venta.cliente}}</td>
                  <td>{{venta.producto}}</td>
                  <td>{{venta.cantidad}}</td>
                  <td>{{formatearPrecio(venta.precio)}}</td>
                  <td>{{venta.fecha}}</td>
                  <td>
                    <span class="badge" [ngClass]="venta.estado === 'Completada' ? 'badge-success' : 'badge-warning'">
                      {{venta.estado}}
                    </span>
                  </td>
                  <td class="text-right">
                    <button class="btn btn-sm btn-info" (click)="editarVenta(venta)" title="Editar">
                      <i class="now-ui-icons ui-2_settings-90"></i>
                    </button>
                    <button class="btn btn-sm btn-danger ml-2" (click)="eliminarVenta(venta)" title="Eliminar">
                      <i class="now-ui-icons ui-1_simple-remove"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 5.4 Agregar la Ruta a la Configuración

**Archivo**: `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categoria/categoria-list/categoria-list.component').then(m => m.CategoriaListComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/producto/producto-list/producto-list.component').then(m => m.ProductoListComponent)
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuario/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent)
  },
  // NUEVA RUTA
  {
    path: 'ventas',
    loadComponent: () => import('./features/venta/venta-list/venta-list.component').then(m => m.VentaListComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
```

## Paso 6: Cómo Funciona Sin Backend

### 6.1 Datos Simulados

El sistema funciona completamente con **datos simulados** en el frontend:

```typescript
// Ejemplo de datos simulados en el componente
productos: Producto[] = [
  {
    id: 1,
    nombre: 'Laptop Dell Inspiron',
    descripcion: 'Laptop para trabajo y entretenimiento',
    precio: 2500000,
    categoria: 'Tecnología',
    stock: 15,
    fechaCreacion: '2025-01-15'
  }
  // ... más productos
];
```

### 6.2 Funciones Simuladas

Las funciones CRUD están implementadas con **alertas y console.log**:

```typescript
crearProducto() {
  console.log('Crear nuevo producto');
  alert('Función de crear producto - Por implementar');
}

editarProducto(producto: Producto) {
  console.log('Editar producto:', producto);
  alert(`Editando producto: ${producto.nombre}`);
}

eliminarProducto(producto: Producto) {
  console.log('Eliminar producto:', producto);
  if (confirm(`¿Estás seguro de eliminar ${producto.nombre}?`)) {
    alert(`Producto ${producto.nombre} eliminado`);
  }
}
```

### 6.3 Persistencia Local (Opcional)

Para simular persistencia, puedes usar **localStorage**:

```typescript
// Guardar datos en localStorage
guardarProductos() {
  localStorage.setItem('productos', JSON.stringify(this.productos));
}

// Cargar datos desde localStorage
cargarProductos() {
  const productosGuardados = localStorage.getItem('productos');
  if (productosGuardados) {
    this.productos = JSON.parse(productosGuardados);
  }
}
```

## Paso 7: Ejecutar la Aplicación

### 7.1 Comandos de Instalación

```bash
# Navegar al proyecto
cd 04-Frontend-angular

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

### 7.2 Acceder a la Aplicación

1. **Abrir navegador**: `http://localhost:4200`
2. **Navegar por el sidebar**: Click en las diferentes opciones
3. **Probar el grid**: Ir a "Productos" para ver la vista de tabla y grid
4. **Probar funciones**: Click en los botones de crear, editar, eliminar

## Resumen de Archivos Creados

### Estructura Completa:
```
04-Frontend-angular/
├── src/
│   ├── app/
│   │   ├── shared/
│   │   │   └── components/
│   │   │       └── sidebar/
│   │   │           ├── sidebar.component.ts      
│   │   │           ├── sidebar.component.html    
│   │   │           └── sidebar.component.scss   
│   │   ├── features/
│   │   │   └── producto/
│   │   │       └── producto-list/
│   │   │           ├── producto-list.component.ts    
│   │   │           ├── producto-list.component.html  
│   │   │           └── producto-list.component.scss   
│   │   ├── app.component.ts         (Actualizado)
│   │   └── app.routes.ts           (Actualizado)
│   └── styles.scss                 (Actualizado)
```

## Características Implementadas

### Sidebar Responsivo
- Navegación lateral fija
- Iconos sin emojis
- Diseño responsivo
- Gradientes modernos
- Logo personalizable

### Sistema de Grid
- Vista de tabla tradicional
- Vista de cards en grid
- Botones de acción (crear, editar, eliminar)
- Datos simulados
- Formateo de precios
- Indicadores de stock

### Funcionalidades Sin Backend
- Datos simulados en arrays
- Funciones con alertas
- Persistencia opcional con localStorage
- Sistema completamente funcional

### Fácil Extensión
- Agregar nuevas secciones al sidebar
- Crear nuevos componentes
- Configurar rutas
- Mantener consistencia de diseño

## Próximos Pasos

Para convertir en un sistema real:

1. **Implementar backend** con API REST
2. **Conectar servicios** con endpoints reales
3. **Implementar autenticación** real
4. **Agregar persistencia** de datos
5. **Implementar validaciones** del lado del servidor

---

**¡Listo!** Ahora tienes un sistema completo de sidebar y grid en Angular que funciona sin backend, con datos simulados y fácil de extender.
