# Frontend Angular - Clean Architecture

Sistema de gestión moderno con Angular 17, arquitectura limpia y diseño responsive.

## Características

- **Diseño Moderno**: Interfaz con glass morphism y gradientes
- **100% Responsive**: Optimizado para todos los dispositivos
- **Animaciones Suaves**: Transiciones y efectos visuales
- **Autenticación Falsa**: Sistema de login sin backend (admin/admin123)
- **Arquitectura Limpia**: Separación clara de responsabilidades
- **TypeScript**: Tipado estático para mayor robustez
- **Modo Demo**: Credenciales de prueba incluidas

## Tecnologías

- **Angular 17** - Framework principal
- **TypeScript** - Lenguaje de programación
- **SCSS** - Preprocesador CSS
- **RxJS** - Programación reactiva
- **Angular Router** - Navegación SPA

## Inicio Rápido

### Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn
- Angular CLI

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

### Credenciales de Prueba

El sistema incluye un login falso para demostración:

- **Usuario**: `admin`
- **Contraseña**: `admin123`

**Nota**: Estas credenciales están hardcodeadas en el código y no requieren conexión al backend.

### Scripts Disponibles

```bash
# Iniciar con URL personalizada en consola
npm start

# Iniciar servidor simple
npm start:simple

# Construir para producción
npm run build

# Ejecutar tests
npm test

# Linting
npm run lint
```

## Diseño y UI

### Características del Diseño

- **Glass Morphism**: Efectos de cristal con blur
- **Gradientes Modernos**: Paleta de colores actualizada
- **Animaciones CSS**: Transiciones suaves y naturales
- **Responsive Design**: Adaptable a todos los tamaños
- **Iconos**: Interfaz amigable y moderna

### Componentes Principales

- **Header**: Navegación principal con logo y menú
- **Dashboard**: Panel principal con módulos
- **Login**: Formulario de autenticación
- **Cards**: Componentes reutilizables
- **Forms**: Formularios con validación

## Responsive Design

El diseño se adapta automáticamente a:

- **Móviles** (320px - 768px)
- **Tablets** (768px - 1024px)
- **Desktop** (1024px+)

## Arquitectura

```
src/
├── app/
│   ├── core/           # Servicios centrales
│   │   ├── services/   # AuthService, ApiService, etc.
│   │   ├── models/     # Interfaces y tipos
│   │   └── interceptors/ # Interceptores HTTP
│   ├── features/       # Módulos de funcionalidad
│   │   ├── auth/       # Login y registro
│   │   ├── dashboard/  # Panel principal
│   │   ├── categoria/ # Gestión de categorías
│   │   ├── producto/  # Gestión de productos
│   │   └── usuario/    # Gestión de usuarios
│   ├── shared/         # Componentes compartidos
│   │   └── models/     # Modelos compartidos
│   └── app.component.ts
├── environments/       # Configuraciones
└── styles.scss        # Estilos globales
```

## Guía de Desarrollo Paso a Paso

### Paso 1: Configuración del Sistema de Autenticación

#### 1.1 Configuración del AuthService

Primero, creamos el servicio de autenticación en `src/app/core/services/auth.service.ts`. Este servicio simula la autenticación sin necesidad de un backend real.

```typescript
// Importamos las dependencias necesarias
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';

// Definimos las interfaces para el login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    activo: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Configuramos las claves para el localStorage
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  
  // Creamos un BehaviorSubject para manejar el estado del usuario
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  // Método principal de login que simula una llamada HTTP
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    // Simulamos un delay de red de 1 segundo
    return of(this.fakeLogin(credentials)).pipe(delay(1000));
  }

  // Método privado que contiene la lógica del login falso
  private fakeLogin(credentials: LoginRequest): ApiResponse<LoginResponse> {
    // Verificamos las credenciales hardcodeadas
    if (credentials.email === 'admin' && credentials.password === 'admin123') {
      // Creamos un usuario falso
      const fakeUser: User = {
        id: 1,
        email: 'admin@itm.edu.co',
        nombre: 'Administrador',
        apellido: 'Sistema',
        activo: true
      };

      // Generamos un token falso con timestamp
      const fakeResponse: LoginResponse = {
        access_token: 'fake_token_' + Date.now(),
        token_type: 'Bearer',
        user: fakeUser
      };

      // Retornamos la respuesta exitosa
      return {
        success: true,
        message: 'Login exitoso',
        data: fakeResponse,
        status: 200
      };
    } else {
      // Lanzamos error si las credenciales son incorrectas
      throw new Error('Credenciales inválidas. Usa admin / admin123');
    }
  }
}
```

#### 1.2 Implementación del Componente de Login

Creamos el componente de login en `src/app/features/auth/login/login.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="card">
          <div class="card-header text-center">
            <div class="login-icon">[ICONO]</div>
            <h2>Iniciar Sesión</h2>
            <p>Accede a tu cuenta para continuar</p>
          </div>
          
          <div class="card-body">
            <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
              <!-- Credenciales de prueba visibles -->
              <div class="demo-credentials">
                <div class="demo-header">
                  <span class="demo-icon">[ICONO]</span>
                  <strong>Credenciales de Prueba</strong>
                </div>
                <div class="demo-info">
                  <p><strong>Usuario:</strong> admin</p>
                  <p><strong>Contraseña:</strong> admin123</p>
                </div>
              </div>

              <!-- Campo de usuario -->
              <div class="form-group">
                <label for="email" class="form-label">
                  <span class="label-icon">[ICONO]</span>
                  Usuario
                </label>
                <input 
                  type="text" 
                  id="email"
                  class="form-control" 
                  [(ngModel)]="loginData.email"
                  name="email"
                  required
                  placeholder="admin"
                  #email="ngModel"
                  [class.is-invalid]="email.invalid && email.touched"
                >
              </div>

              <!-- Campo de contraseña -->
              <div class="form-group">
                <label for="password" class="form-label">
                  <span class="label-icon">[ICONO]</span>
                  Contraseña
                </label>
                <input 
                  type="password" 
                  id="password"
                  class="form-control" 
                  [(ngModel)]="loginData.password"
                  name="password"
                  required
                  placeholder="admin123"
                  #password="ngModel"
                  [class.is-invalid]="password.invalid && password.touched"
                >
              </div>

              <!-- Botón de envío -->
              <div class="form-group">
                <button 
                  type="submit" 
                  class="btn btn-primary w-100"
                  [disabled]="loginForm.invalid || loading"
                  [class.loading]="loading"
                >
                  <span *ngIf="loading">Iniciando sesión...</span>
                  <span *ngIf="!loading">Iniciar Sesión</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos con glass morphism y animaciones */
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    
    .login-card {
      width: 100%;
      max-width: 450px;
    }

    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .demo-credentials {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      padding: 1rem;
      margin: 1.5rem 0;
      text-align: center;
    }

    .form-control {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 0.75rem;
      color: white;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      background: rgba(255, 255, 255, 0.15);
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }

    .btn {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      color: white;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
  `]
})
export class LoginComponent implements OnInit {
  // Objeto para almacenar los datos del formulario
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    
    // Llamamos al servicio de autenticación
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        // Si el login es exitoso, guardamos los datos del usuario
        this.authService.setUserData(response.data);
        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: (error) => {
        // Si hay error, mostramos el mensaje
        console.error('Error en login:', error);
        alert('Error al iniciar sesión. Verifica tus credenciales.');
        this.loading = false;
      }
    });
  }
}
```

#### 1.3 Implementación del Componente de Registro

Creamos el componente de registro en `src/app/features/auth/register/register.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="card">
          <div class="card-header text-center">
            <div class="register-icon">[ICONO]</div>
            <h2>Crear Cuenta</h2>
            <p>Únete a nuestro sistema</p>
          </div>
          
          <div class="card-body">
            <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
              <!-- Campo de email -->
              <div class="form-group">
                <label for="email" class="form-label">
                  <span class="label-icon">[ICONO]</span>
                  Email
                </label>
                <input 
                  type="email" 
                  id="email"
                  class="form-control" 
                  [(ngModel)]="registerData.email"
                  name="email"
                  required
                  email
                  placeholder="tu@email.com"
                  #email="ngModel"
                  [class.is-invalid]="email.invalid && email.touched"
                >
              </div>

              <!-- Campo de contraseña -->
              <div class="form-group">
                <label for="password" class="form-label">
                  <span class="label-icon">[ICONO]</span>
                  Contraseña
                </label>
                <input 
                  type="password" 
                  id="password"
                  class="form-control" 
                  [(ngModel)]="registerData.password"
                  name="password"
                  required
                  minlength="6"
                  placeholder="••••••••"
                  #password="ngModel"
                  [class.is-invalid]="password.invalid && password.touched"
                >
              </div>

              <!-- Campo de nombre -->
              <div class="form-group">
                <label for="nombre" class="form-label">
                  <span class="label-icon">[ICONO]</span>
                  Nombre
                </label>
                <input 
                  type="text" 
                  id="nombre"
                  class="form-control" 
                  [(ngModel)]="registerData.nombre"
                  name="nombre"
                  required
                  minlength="2"
                  placeholder="Tu nombre"
                  #nombre="ngModel"
                  [class.is-invalid]="nombre.invalid && nombre.touched"
                >
              </div>

              <!-- Campo de apellido -->
              <div class="form-group">
                <label for="apellido" class="form-label">
                  <span class="label-icon">[ICONO]</span>
                  Apellido
                </label>
                <input 
                  type="text" 
                  id="apellido"
                  class="form-control" 
                  [(ngModel)]="registerData.apellido"
                  name="apellido"
                  required
                  minlength="2"
                  placeholder="Tu apellido"
                  #apellido="ngModel"
                  [class.is-invalid]="apellido.invalid && apellido.touched"
                >
              </div>

              <!-- Botón de envío -->
              <div class="form-group">
                <button 
                  type="submit" 
                  class="btn btn-primary w-100"
                  [disabled]="registerForm.invalid || loading"
                  [class.loading]="loading"
                >
                  <span *ngIf="loading">Registrando...</span>
                  <span *ngIf="!loading">Crear Cuenta</span>
                </button>
              </div>

              <!-- Enlace al login -->
              <div class="form-options">
                <div class="text-center">
                  <span class="login-text">¿Ya tienes cuenta? </span>
                  <a routerLink="/auth/login" class="link">
                    Inicia sesión aquí
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos consistentes con el login */
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    
    .register-card {
      width: 100%;
      max-width: 500px;
    }

    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .form-control {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 0.75rem;
      color: white;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      background: rgba(255, 255, 255, 0.15);
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }

    .btn {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      color: white;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
  `]
})
export class RegisterComponent implements OnInit {
  // Objeto para almacenar los datos del formulario
  registerData = {
    email: '',
    password: '',
    nombre: '',
    apellido: ''
  };
  
  loading = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Lógica de inicialización si es necesaria
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    
    // Simulamos el registro (en un sistema real, aquí se haría la llamada al backend)
    setTimeout(() => {
      console.log('Datos de registro:', this.registerData);
      alert('Registro simulado exitoso. Redirigiendo al login...');
      this.router.navigate(['/auth/login']);
      this.loading = false;
    }, 1500);
  }
}
```

### Paso 2: Configuración de Estilos y Diseño

#### 2.1 Estilos Globales

Configuramos los estilos globales en `src/styles.scss`:

```scss
// Variables CSS personalizadas
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #06b6d4;
  
  // Colores de fondo
  --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --bg-secondary: rgba(255, 255, 255, 0.1);
  
  // Bordes y sombras
  --border-radius: 8px;
  --border-radius-lg: 16px;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  // Espaciados
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}

// Reset y configuración base
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: white;
  line-height: 1.6;
  min-height: 100vh;
}

// Utilidades de glass morphism
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-lg);
}

// Utilidades de texto
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

// Utilidades de display
.d-flex { display: flex; }
.d-block { display: block; }
.d-none { display: none; }

// Utilidades de spacing
.p-0 { padding: 0; }
.p-1 { padding: var(--spacing-xs); }
.p-2 { padding: var(--spacing-sm); }
.p-3 { padding: var(--spacing-md); }
.p-4 { padding: var(--spacing-lg); }
.p-5 { padding: var(--spacing-xl); }

.m-0 { margin: 0; }
.m-1 { margin: var(--spacing-xs); }
.m-2 { margin: var(--spacing-sm); }
.m-3 { margin: var(--spacing-md); }
.m-4 { margin: var(--spacing-lg); }
.m-5 { margin: var(--spacing-xl); }

// Responsive design
@media (max-width: 768px) {
  :root {
    --spacing-md: 0.75rem;
    --spacing-lg: 1rem;
    --spacing-xl: 1.5rem;
  }
}
```

### Paso 3: Configuración del Sistema de Rutas

#### 3.1 Configuración del Router

Configuramos las rutas en `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta por defecto - redirige al dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Rutas de autenticación
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  
  // Rutas principales
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  
  {
    path: 'categorias',
    loadComponent: () => import('./features/categoria/categoria-list/categoria-list.component').then(m => m.CategoriaListComponent)
  },
  
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuario/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent)
  },
  
  {
    path: 'productos',
    loadComponent: () => import('./features/producto/producto-list/producto-list-new.component').then(m => m.ProductoListNewComponent)
  },
  
  // Ruta de fallback
  { path: '**', redirectTo: '/dashboard' }
];
```

#### 3.2 Rutas de Autenticación

Configuramos las rutas específicas de autenticación en `src/app/features/auth/auth.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  }
];
```

### Paso 4: Desarrollo del Layout Principal

#### 4.1 Componente Principal

Configuramos el layout principal en `src/app/app.component.ts`:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="app-container">
      <!-- Header con navegación -->
      <header class="app-header glass">
        <div class="container">
          <div class="header-content">
            <div class="logo-section">
              <h1 class="logo">Sistema de Gestión</h1>
              <p class="tagline">Aplicación Angular Moderna</p>
            </div>
            <nav class="main-nav">
              <a routerLink="/dashboard" class="nav-link" routerLinkActive="active">
                Dashboard
              </a>
              <a routerLink="/categorias" class="nav-link" routerLinkActive="active">
                Categorías
              </a>
              <a routerLink="/usuarios" class="nav-link" routerLinkActive="active">
                Usuarios
              </a>
              <a routerLink="/productos" class="nav-link" routerLinkActive="active">
                Productos
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <!-- Contenido principal -->
      <main class="main-content">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="app-footer glass">
        <div class="container">
          <div class="footer-content">
            <p>&copy; 2025 - Proyecto de Programación de Software ITM</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 1rem 0;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .logo {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0;
      line-height: 1.2;
    }

    .main-nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .nav-link {
      padding: 0.75rem 1.25rem;
      border-radius: var(--border-radius);
      text-decoration: none;
      color: rgba(255, 255, 255, 0.95);
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .app-footer {
      margin-top: auto;
      padding: 1.5rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    // Responsive design
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .main-nav {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  `]
})
export class AppComponent {
  title = 'frontend-angular-clean-architecture';
}
```

### Paso 5: Configuración del Entorno de Desarrollo

#### 5.1 Variables de Entorno

Configuramos las variables de entorno en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  appName: 'Sistema de Gestión ITM',
  version: '1.0.0'
};
```

#### 5.2 Configuración de Package.json

Configuramos los scripts en `package.json`:

```json
{
  "name": "frontend-angular-clean-architecture",
  "version": "1.0.0",
  "scripts": {
    "start": "node start-dev.js",
    "start:simple": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint"
  },
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/router": "^17.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  }
}
```

### Paso 6: Implementación de Funcionalidades Avanzadas

#### 6.1 Lazy Loading

Implementamos lazy loading para optimizar el rendimiento:

```typescript
// En app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.authRoutes)
  }
];
```

#### 6.2 Standalone Components

Todos los componentes son standalone para mayor flexibilidad:

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `...`,
  styles: [`...`]
})
export class LoginComponent { }
```

#### 6.3 Responsive Design

Implementamos diseño responsive con breakpoints:

```scss
// Breakpoints
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .main-nav {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.5rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
}
```

### Paso 7: Instrucciones de Uso

#### 7.1 Iniciar la Aplicación

```bash
# Navegar al directorio
cd 04-Frontend-angular

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

#### 7.2 Acceder al Sistema

1. **Abrir navegador**: `http://localhost:4200`
2. **Redirección automática**: Al login si no está autenticado
3. **Credenciales de prueba**:
   - Usuario: `admin`
   - Contraseña: `admin123`

#### 7.3 Navegación del Sistema

Una vez autenticado, puedes navegar a:
- **Dashboard**: Panel principal con estadísticas
- **Categorías**: Gestión de categorías
- **Usuarios**: Gestión de usuarios  
- **Productos**: Gestión de productos

#### 7.4 Probar el Registro

1. Ir a `/auth/register`
2. Completar formulario de registro
3. Los datos se simulan (no se guardan realmente)

### Paso 8: Personalización y Extensión

#### 8.1 Cambiar Credenciales de Prueba

Para cambiar las credenciales, edita `src/app/core/services/auth.service.ts`:

```typescript
// Línea 59: Cambiar las credenciales
if (credentials.email === 'tu_usuario' && credentials.password === 'tu_password') {
  // Lógica de autenticación
}
```

#### 8.2 Modificar Estilos

Para personalizar el diseño, edita `src/styles.scss`:

```scss
:root {
  --primary-color: #tu_color_principal;
  --secondary-color: #tu_color_secundario;
  // Más variables personalizadas
}
```

#### 8.3 Agregar Nuevas Funcionalidades

1. **Crear componente**:
   ```bash
   ng generate component features/nueva-funcionalidad
   ```

2. **Agregar ruta** en `src/app/app.routes.ts`:
   ```typescript
   {
     path: 'nueva-funcionalidad',
     loadComponent: () => import('./features/nueva-funcionalidad/nueva-funcionalidad.component')
       .then(m => m.NuevaFuncionalidadComponent)
   }
   ```

3. **Actualizar navegación** en `src/app/app.component.ts`:
   ```html
   <a routerLink="/nueva-funcionalidad" class="nav-link">
     Nueva Funcionalidad
   </a>
   ```

### Paso 9: Características Técnicas del Sistema

#### 9.1 Arquitectura Limpia

- **Core**: Servicios centrales (AuthService, ApiService)
- **Features**: Módulos de funcionalidad (auth, dashboard, etc.)
- **Shared**: Componentes y modelos compartidos

#### 9.2 Glass Morphism

Efectos de cristal implementados con CSS:

```scss
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

#### 9.3 Autenticación Falsa

Sistema completo de autenticación sin backend:
- Credenciales hardcodeadas
- Token falso generado
- Persistencia en localStorage
- Manejo de errores

#### 9.4 Responsive Design

Diseño adaptable a todos los dispositivos:
- Mobile: 320px - 768px
- Tablet: 768px - 1024px  
- Desktop: 1024px+

### Paso 10: Consideraciones Importantes

#### 10.1 Desarrollo

- Usa `npm start` para desarrollo con URL personalizada
- Los estilos están en `src/styles.scss`
- Los componentes son standalone
- La navegación usa Angular Router
- Los formularios incluyen validación

#### 10.2 Limitaciones

- **IMPORTANTE**: El sistema usa autenticación falsa - no hay backend real
- Los datos no se persisten realmente
- Es un sistema de demostración

#### 10.3 Próximos Pasos

Para convertir en un sistema real:
1. Implementar backend con API real
2. Conectar AuthService con endpoints reales
3. Implementar persistencia de datos
4. Agregar tests unitarios
5. Implementar CI/CD

## Resumen del Proyecto

Este proyecto implementa un sistema de gestión moderno utilizando Angular 17 con las siguientes características principales:

### Tecnologías Implementadas
- **Angular 17** con componentes standalone
- **TypeScript** para tipado estático
- **SCSS** para estilos avanzados
- **RxJS** para programación reactiva
- **Angular Router** para navegación SPA

### Arquitectura del Sistema
- **Arquitectura Limpia** con separación clara de responsabilidades
- **Glass Morphism** para efectos visuales modernos
- **Responsive Design** adaptable a todos los dispositivos
- **Autenticación Simulada** para demostración

### Funcionalidades Principales
- Sistema de autenticación con credenciales de prueba
- Dashboard principal con navegación
- Gestión de categorías, productos y usuarios
- Formularios con validación
- Diseño responsive y moderno

### Uso del Sistema
1. Instalar dependencias: `npm install`
2. Iniciar servidor: `npm start`
3. Acceder a: `http://localhost:4200`
4. Usar credenciales: `admin` / `admin123`

---

**Desarrollado para el ITM - 2025**