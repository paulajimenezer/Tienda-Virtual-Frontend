import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Estructuras simples para grupos y submenús
interface MenuChild {
  path: string;
  title: string;
  icon?: string;
  roles?: string[];
}

interface MenuGroup {
  key: string; // usado para abrir/cerrar
  title: string;
  icon: string;
  children: MenuChild[];
}

const TOP_LINKS: MenuChild[] = [
  { path: '/dashboard', title: 'Dashboard', icon: 'design_app' }
];

const GROUPS: MenuGroup[] = [
  {
    key: 'usuarios',
    title: 'Usuarios',
    icon: 'users_single-02',
    children: [
      { path: '/usuarios', title: 'Usuarios', icon: 'users_single-02', roles: ['admin'] }
    ]
  },
  {
    key: 'productos',
    title: 'Productos',
    icon: 'shopping_box',
    children: [
      { path: '/productos', title: 'Productos', icon: 'shopping_box', roles: ['admin', 'cliente'] },
      { path: '/categorias', title: 'Categorías', icon: 'design_app', roles: ['admin'] }
    ]
  },
  {
    key: 'compras',
    title: 'Compras',
    icon: 'shopping_box',
    children: [
      { path: '/carritos', title: 'Carritos', icon: 'shopping_box', roles: ['admin', 'cliente'] },
      { path: '/descuentos', title: 'Descuentos', icon: 'design_app', roles: ['admin'] }
    ]
  },
  {
    key: 'pedidos',
    title: 'Pedidos',
    icon: 'users_single-02',
    children: [
      { path: '/pedidos', title: 'Pedidos', icon: 'users_single-02', roles: ['admin'] },
      { path: '/facturas', title: 'Facturas', icon: 'shopping_box', roles: ['admin', 'cliente'] }
    ]
  }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  topLinks: MenuChild[] = [];
  menuGroups: MenuGroup[] = [];
  openKey: string | null = null; // solo un grupo abierto a la vez
  private authSub?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.rebuildMenu();
    // Suscribir a cambios de sesión para actualizar accesos
    this.authSub = this.authService.currentUser$.subscribe(() => {
      this.rebuildMenu();
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  private rebuildMenu(): void {
    // Enlaces sueltos (p. ej. Dashboard)
    this.topLinks = TOP_LINKS.filter(link => this.canAccessChild(link));
    // Grupos con al menos un hijo accesible
    this.menuGroups = GROUPS
      .map(g => ({
        ...g,
        children: g.children.filter(c => this.canAccessChild(c))
      }))
      .filter(g => g.children.length > 0);
    // Si el grupo abierto dejó de existir (por permisos), cerrarlo
    if (this.openKey && !this.menuGroups.find(g => g.key === this.openKey)) {
      this.openKey = null;
    }
  }

  private canAccessChild(child: MenuChild): boolean {
    // Mantener lógica simple: delegar en AuthService
    return this.authService.canAccess(child.path);
  }

  toggleGroup(key: string): void {
    this.openKey = this.openKey === key ? null : key;
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
}
