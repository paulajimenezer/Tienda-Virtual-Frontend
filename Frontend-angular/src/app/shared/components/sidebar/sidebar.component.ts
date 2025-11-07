import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

declare interface RouteInfo {
  path?: string;
  title: string;
  icon?: string;
  class?: string;
  roles?: string[];
  children?: RouteInfo[];
  isSection?: boolean;
  expanded?: boolean;
  logout?: boolean; // para items de cierre de sesión
}

declare interface MenuSection {
  title: string;
  children: RouteInfo[];
  expanded?: boolean;
  icon?: string; // icono para el menú padre
}

export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '' },
  { path: '/categorias', title: 'Categorías',  icon:'shopping_basket', class: '', roles: ['admin'] },
  { path: '/usuarios', title: 'Usuarios',  icon:'users_single-02', class: '', roles: ['admin'] },
  { path: '/productos', title: 'Productos',  icon:'shopping_box', class: '' },
  { path: '/notifications', title: 'Notificaciones',  icon:'ui-1_bell-53', class: '', roles: ['admin'] },
  { path: '/upgrade', title: 'Configuración',  icon:'objects_spaceship', class: 'active active-pro', roles: ['admin'] }
];

// Secciones solicitadas con submenús
const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Usuarios',
    children: [
      { path: '/usuarios', title: 'Usuarios', icon: 'ui-1_bell-53', class: '', roles: ['admin'] },
    ],
    expanded: false,
    icon: 'shopping_box' 
  },
  {
    title: 'Productos',
    children: [
      { path: '/categorias', title: 'Categorías', icon: 'ui-1_bell-53', class: '' },
      { path: '/productos', title: 'Productos', icon: 'ui-1_bell-53', class: '' }
    ],
    expanded: false,
    icon: 'shopping_box' 
  },
  {
    title: 'Facturación',
    children: [
      { path: '/facturas', title: 'Facturas', icon: 'ui-1_bell-53', class: '' },
      { path: '/descuentos', title: 'Descuentos', icon: 'ui-1_bell-53', class: '' }
    ],
    expanded: false,
    icon: 'shopping_box' 
  },
  {
    title: 'Carritos y Pedidos',
    children: [
      { path: '/carritos', title: 'Carritos', icon: 'ui-1_bell-53', class: '' },
      { path: '/carrito-items', title: 'Ítems del carrito', icon: 'ui-1_bell-53', class: '' },
      { path: '/pedidos', title: 'Pedidos', icon: 'ui-1_bell-53', class: '' },
      { path: '/pedido-items', title: 'Ítems del pedido', icon: 'ui-1_bell-53', class: '' }
    ],
    expanded: false,
    icon: 'shopping_box' 
  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[] = [];
  sections: MenuSection[] = []; // nuevas secciones

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Filtrar elementos del menú según permisos
    this.menuItems = ROUTES.filter(menuItem => this.canAccessMenuItem(menuItem));

    // Construir secciones con filtro de permisos y colapsadas por defecto
    this.sections = MENU_SECTIONS
      .map(sec => ({
        ...sec,
        children: sec.children.filter(child => this.canAccessMenuItem(child)),
        expanded: false
      }))
      .filter(sec => sec.children.length > 0);
  }

  toggleSection(index: number): void {
    // Acordeón: al abrir uno, se cierran los otros
    this.sections = this.sections.map((sec, i) => ({
      ...sec,
      expanded: i === index ? !sec.expanded : false
    }));
  }

  canAccessMenuItem(menuItem: RouteInfo): boolean {
    if (menuItem.children && menuItem.children.length) {
      return menuItem.children.some(child => this.canAccessMenuItem(child));
    }
    //Si no tiene roles definidos, todos pueden acceder
    if (!menuItem.roles || menuItem.roles.length === 0) {
      return true;
    }
    const userRole = this.authService.getUserRole();
    return userRole ? menuItem.roles.includes(userRole) : false;
  }
  
  isMobileMenu() {
      if ( window.innerWidth > 991) {
          return false;
      }
      return true;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onMenuItemClick(item: RouteInfo) {
    if (item.logout) {
      this.logout();
      return;
    }
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}