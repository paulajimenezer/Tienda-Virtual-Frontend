import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categoria/categoria-list/categoria-list.component').then(m => m.CategoriaListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/producto/producto-list/producto-list.component').then(m => m.ProductoListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuario/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./features/pedido/pedido-list/pedido-list.component').then(m => m.PedidoListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'facturas',
    loadComponent: () => import('./features/factura/factura-list/factura-list.component').then(m => m.FacturaListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'descuentos',
    loadComponent: () => import('./features/descuento/descuento-list/descuento-list.component').then(m => m.DescuentoListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'carritos',
    loadComponent: () => import('./features/carrito/carrito/carrito-list.component').then(m => m.CarritoListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
