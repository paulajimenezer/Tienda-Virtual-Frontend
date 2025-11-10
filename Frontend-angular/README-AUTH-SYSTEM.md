# Sistema de Autenticación Local con Roles - Angular

## Descripción General

Este documento describe la implementación de un sistema de autenticación local completo en Angular que utiliza localStorage para persistir datos de usuario y roles, sin necesidad de conexión a un backend. El sistema incluye control de acceso basado en roles (RBAC) y guards de rutas para proteger las páginas según los permisos del usuario.

## Conceptos Fundamentales de Autenticación

### ¿Qué es la Autenticación?

La **autenticación** es el proceso de verificar la identidad de un usuario. En aplicaciones web, esto típicamente involucra:

- **Credenciales**: Usuario y contraseña
- **Tokens**: Códigos que confirman la identidad del usuario
- **Sesiones**: Estado de autenticación mantenido durante la navegación

### ¿Qué es la Autorización?

La **autorización** determina qué puede hacer un usuario autenticado. En nuestro sistema:

- **Roles**: Categorías de usuarios (admin, consumidor)
- **Permisos**: Acciones específicas permitidas para cada rol
- **Control de Acceso**: Verificación de permisos antes de mostrar contenido

### ¿Cómo Funciona la Autenticación en Angular?

Angular maneja la autenticación a través de varios mecanismos:

1. **Servicios**: Centralizan la lógica de autenticación
2. **Guards**: Protegen rutas basándose en el estado de autenticación
3. **Interceptors**: Modifican peticiones HTTP para incluir tokens
4. **Observables**: Notifican cambios en el estado de autenticación

### ¿Qué es localStorage?

**localStorage** es una API del navegador que permite almacenar datos de forma persistente:

- **Persistencia**: Los datos se mantienen después de cerrar el navegador
- **Almacenamiento Local**: Los datos solo son accesibles desde el mismo dominio
- **Límite de Tamaño**: Generalmente 5-10MB por dominio
- **Sincronización**: Los datos se almacenan localmente, no en el servidor

### Flujo de Datos en localStorage

```typescript
// Almacenar datos
localStorage.setItem('clave', 'valor');

// Recuperar datos
const valor = localStorage.getItem('clave');

// Eliminar datos
localStorage.removeItem('clave');

// Limpiar todo
localStorage.clear();
```

## Arquitectura del Sistema

### Estructura de Archivos

```
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts          # Guard para rutas protegidas
│   │   └── login.guard.ts         # Guard para páginas de autenticación
│   └── services/
│       └── auth.service.ts        # Servicio principal de autenticación
├── features/
│   └── auth/
│       └── login/
│           └── login.component.ts # Componente de login
├── shared/
│   └── components/
│       └── sidebar/
│           ├── sidebar.component.ts
│           ├── sidebar.component.html
│           └── sidebar.component.scss
└── app.routes.ts                  # Configuración de rutas
```

### Diagrama de Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Login Page    │───▶│   AuthService    │───▶│  localStorage   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Auth Guards   │◀───│   Route Config   │───▶│   Sidebar       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Protected Pages │    │  Role Validation │    │  User Info      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Componentes Principales

### 1. AuthService (`core/services/auth.service.ts`)

**¿Qué es un Servicio en Angular?**

Un **servicio** es una clase que se puede inyectar en otros componentes para compartir lógica y datos. En nuestro caso, el `AuthService`:

- **Singleton**: Una sola instancia en toda la aplicación
- **Inyección de Dependencias**: Se inyecta automáticamente donde se necesite
- **Estado Centralizado**: Mantiene el estado de autenticación en un solo lugar
- **Comunicación**: Permite que diferentes componentes accedan al mismo estado

**Responsabilidades:**
- Gestión de autenticación local
- Manejo de roles y permisos
- Persistencia en localStorage
- Validación de credenciales

**Métodos Principales:**
```typescript
// Autenticación
login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>>
logout(): void
isAuthenticated(): boolean

// Gestión de usuario
getCurrentUser(): User | null
setUserData(loginResponse: LoginResponse): void

// Roles y permisos
getUserRole(): UserRole | null
hasRole(role: UserRole): boolean
isAdmin(): boolean
isConsumidor(): boolean
canAccess(route: string): boolean
```

**Interfaces:**
```typescript
interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  rol: string;
}

type UserRole = 'admin' | 'consumidor';
```

### 2. AuthGuard (`core/guards/auth.guard.ts`)

**¿Qué es un Guard en Angular?**

Un **guard** es una función que se ejecuta antes de navegar a una ruta. Puede:

- **Permitir** la navegación (return true)
- **Bloquear** la navegación (return false)
- **Redirigir** a otra ruta

**Tipos de Guards:**
- `CanActivate`: Controla si se puede acceder a una ruta
- `CanDeactivate`: Controla si se puede salir de una ruta
- `CanLoad`: Controla si se puede cargar un módulo lazy

**Propósito:** Proteger rutas que requieren autenticación y validar permisos de acceso.

**Lógica:**
1. Verifica si el usuario está autenticado
2. Si no está autenticado → redirige al login
3. Si está autenticado → verifica permisos de la ruta
4. Si no tiene permisos → redirige al dashboard

### 3. LoginGuard (`core/guards/login.guard.ts`)

**Propósito:** Evitar que usuarios autenticados accedan a páginas de login.

**¿Por qué necesitamos este Guard?**

Sin este guard, un usuario ya autenticado podría:
- Acceder accidentalmente al login
- Ver formularios innecesarios
- Crear confusión en la experiencia de usuario

**Lógica:**
1. Verifica si el usuario ya está autenticado
2. Si está autenticado → redirige al dashboard
3. Si no está autenticado → permite el acceso

### 4. LoginComponent (`features/auth/login/login.component.ts`)

**¿Qué es un Componente en Angular?**

Un **componente** es una clase que controla una vista (template). En nuestro caso:

- **Template**: El HTML del formulario de login
- **Lógica**: Manejo del formulario y autenticación
- **Estilos**: CSS específico del componente
- **Ciclo de Vida**: Métodos que se ejecutan en momentos específicos

**Características:**
- Formulario de login con validación
- Credenciales de prueba integradas
- Diseño responsivo
- Manejo de estados de carga

**Credenciales de Prueba:**
- **Admin:** `admin` / `admin123`
- **Consumidor:** `consumidor` / `consumidor123`

### 5. SidebarComponent (`shared/components/sidebar/sidebar.component.ts`)

**¿Qué es un Componente Compartido?**

Un **componente compartido** es reutilizable en múltiples partes de la aplicación:

- **Reutilización**: Se usa en diferentes páginas
- **Consistencia**: Mantiene el mismo comportamiento en toda la app
- **Mantenimiento**: Un solo lugar para hacer cambios
- **Comunicación**: Se comunica con el servicio de autenticación

**Características:**
- Menú dinámico basado en roles
- Información del usuario actual
- Botón de logout integrado
- Filtrado automático de opciones según permisos

## Sistema de Roles y Permisos

### Roles Implementados

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **admin** | Administrador del sistema | Todas las funcionalidades |
| **consumidor** | Usuario final | Solo productos y dashboard |

### Matriz de Permisos

| Ruta | Admin | Consumidor |
|------|-------|------------|
| `/dashboard` | ✅ | ✅ |
| `/productos` | ✅ | ✅ |
| `/categorias` | ✅ | ❌ |
| `/usuarios` | ✅ | ❌ |
| `/notifications` | ✅ | ❌ |
| `/upgrade` | ✅ | ❌ |

### Implementación de Permisos

```typescript
canAccess(route: string): boolean {
  const role = this.getUserRole();
  
  if (!role) return false;

  // Admin puede acceder a todo
  if (role === 'admin') return true;

  // Consumidor solo puede acceder a productos
  if (role === 'consumidor') {
    return route === 'productos' || route === 'dashboard';
  }

  return false;
}
```

## Configuración de Rutas

### ¿Qué es el Enrutamiento en Angular?

El **enrutamiento** permite navegar entre diferentes vistas sin recargar la página:

- **SPA (Single Page Application)**: Una sola página HTML
- **Navegación del Cliente**: El navegador no hace peticiones al servidor
- **URLs Limpias**: URLs amigables para cada vista
- **Historial del Navegador**: Botones atrás/adelante funcionan correctamente

### ¿Cómo Funciona el Enrutamiento?

1. **Configuración**: Se definen las rutas en `app.routes.ts`
2. **Navegación**: El usuario hace clic en un enlace
3. **Guard**: Se ejecutan los guards (si los hay)
4. **Carga**: Se carga el componente correspondiente
5. **Renderizado**: Se muestra la vista al usuario

### Rutas Principales (`app.routes.ts`)

```typescript
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
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
```

### Rutas de Autenticación (`features/auth/auth.routes.ts`)

```typescript
export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    canActivate: [LoginGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    canActivate: [LoginGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [LoginGuard]
  }
];
```

## Persistencia de Datos

### ¿Por qué Usar localStorage?

**localStorage** es ideal para nuestro sistema porque:

- **Sin Backend**: No necesitamos un servidor para almacenar datos
- **Persistencia**: Los datos se mantienen entre sesiones
- **Rapidez**: Acceso inmediato a los datos
- **Simplicidad**: API fácil de usar
- **Desarrollo**: Perfecto para prototipos y demos

### ¿Cómo Funciona localStorage en Angular?

Angular no tiene métodos específicos para localStorage, pero podemos usarlo directamente:

```typescript
// En cualquier componente o servicio
const datos = localStorage.getItem('miClave');
localStorage.setItem('miClave', 'miValor');
localStorage.removeItem('miClave');
```

### Ventajas y Desventajas

**Ventajas:**
- Fácil de implementar
- No requiere configuración adicional
- Datos persistentes
- Acceso síncrono

**Desventajas:**
- Solo funciona en el navegador
- Límite de tamaño (5-10MB)
- No se sincroniza entre dispositivos
- Datos se pueden perder si se limpia el navegador

### localStorage Keys

| Key | Propósito | Contenido |
|-----|-----------|-----------|
| `auth_token` | Token de autenticación | String del token |
| `user_data` | Datos del usuario | JSON del objeto User |
| `user_role` | Rol del usuario | String del rol |

### Flujo de Persistencia

#### 1. Login Exitoso

Cuando el usuario se autentica correctamente:

```typescript
setUserData(loginResponse: LoginResponse): void {
  // 1. Guardar token de autenticación
  localStorage.setItem(this.TOKEN_KEY, loginResponse.access_token);
  
  // 2. Guardar datos del usuario (convertir objeto a JSON)
  localStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.user));
  
  // 3. Guardar rol del usuario
  localStorage.setItem(this.ROLE_KEY, loginResponse.user.rol);
  
  // 4. Notificar a todos los componentes suscritos
  this.currentUserSubject.next(loginResponse.user);
}
```

**¿Qué hace cada línea?**
- `localStorage.setItem()`: Almacena datos en el navegador
- `JSON.stringify()`: Convierte el objeto JavaScript a texto
- `currentUserSubject.next()`: Notifica a los componentes que el usuario cambió

#### 2. Carga Inicial

Cuando la aplicación se inicia, verifica si hay datos guardados:

```typescript
private loadUserFromStorage(): void {
  // 1. Intentar obtener datos del usuario
  const userData = localStorage.getItem(this.USER_KEY);
  
  if (userData) {
    try {
      // 2. Convertir texto JSON a objeto JavaScript
      const user = JSON.parse(userData);
      
      // 3. Establecer el usuario actual
      this.currentUserSubject.next(user);
    } catch (error) {
      // 4. Si hay error, limpiar datos y hacer logout
      console.error('Error al cargar datos del usuario:', error);
      this.logout();
    }
  }
}
```

**¿Por qué usar try-catch?**
- `JSON.parse()` puede fallar si los datos están corruptos
- Es mejor limpiar datos inválidos que dejar la app en estado inconsistente

#### 3. Logout

Cuando el usuario cierra sesión:

```typescript
logout(): void {
  // 1. Eliminar token de autenticación
  localStorage.removeItem(this.TOKEN_KEY);
  
  // 2. Eliminar datos del usuario
  localStorage.removeItem(this.USER_KEY);
  
  // 3. Eliminar rol del usuario
  localStorage.removeItem(this.ROLE_KEY);
  
  // 4. Notificar que no hay usuario
  this.currentUserSubject.next(null);
}
```

**¿Por qué limpiar todo?**
- Seguridad: Evitar que datos sensibles queden en el navegador
- Consistencia: Asegurar que la app esté en estado limpio
- Privacidad: El usuario puede cerrar sesión en computadora compartida

## Guía de Implementación Paso a Paso

### Paso 1: Crear el Servicio de Autenticación

1. Crear `src/app/core/services/auth.service.ts`
2. Implementar interfaces `User`, `LoginRequest`, `LoginResponse`
3. Definir tipo `UserRole`
4. Implementar métodos de autenticación y gestión de roles

### Paso 2: Crear los Guards

1. Crear `src/app/core/guards/auth.guard.ts`
2. Crear `src/app/core/guards/login.guard.ts`
3. Implementar lógica de validación de rutas

### Paso 3: Configurar las Rutas

1. Modificar `src/app/app.routes.ts`
2. Aplicar guards a las rutas protegidas
3. Configurar redirección inicial al login

### Paso 4: Implementar el Componente de Login

1. Crear `src/app/features/auth/login/login.component.ts`
2. Implementar formulario con validación
3. Integrar con AuthService
4. Añadir credenciales de prueba

### Paso 5: Modificar el Sidebar

1. Actualizar `src/app/shared/components/sidebar/sidebar.component.ts`
2. Implementar filtrado por roles
3. Añadir información del usuario
4. Integrar botón de logout

### Paso 6: Aplicar Estilos

1. Mejorar visibilidad del texto
2. Reemplazar emojis con iconos
3. Ajustar colores para mejor contraste

## Pruebas del Sistema

### Casos de Prueba

1. **Login como Admin:**
   - Usuario: `admin`
   - Contraseña: `admin123`
   - Resultado esperado: Acceso completo a todas las funcionalidades

2. **Login como Consumidor:**
   - Usuario: `consumidor`
   - Contraseña: `consumidor123`
   - Resultado esperado: Solo acceso a productos y dashboard

3. **Navegación no autenticada:**
   - Intentar acceder a `/dashboard` sin login
   - Resultado esperado: Redirección automática al login

4. **Persistencia de sesión:**
   - Hacer login y recargar la página
   - Resultado esperado: Mantener la sesión activa

5. **Logout:**
   - Hacer logout desde el sidebar
   - Resultado esperado: Limpiar datos y redirigir al login

## Comandos de Desarrollo

### Instalación
```bash
cd 04-Frontend-angular
npm install
```

### Desarrollo
```bash
npm start
```

### Compilación
```bash
npm run build
```

### Pruebas
```bash
npm test
```

## Características Responsivas

- Diseño adaptativo para móviles y tablets
- Formulario optimizado para pantallas pequeñas
- Sidebar colapsible en dispositivos móviles
- Iconos escalables según el tamaño de pantalla

## Personalización

### Colores
- Variables CSS para fácil personalización
- Tema consistente en toda la aplicación
- Contraste optimizado para accesibilidad

### Iconos
- Uso de `now-ui-icons` para consistencia
- Iconos escalables y responsivos
- Fácil reemplazo por otros sets de iconos

## Consideraciones de Seguridad

### Limitaciones del Sistema Local
- Los datos se almacenan en el navegador
- No hay validación del lado del servidor
- Los tokens son simulados (no reales)
- **Solo para desarrollo y demostración**

### Mejoras para Producción
- Integración con backend real
- Tokens JWT válidos
- Encriptación de datos sensibles
- Validación del lado del servidor
- HTTPS obligatorio

## Dependencias

### Principales
- `@angular/core`: Framework principal
- `@angular/router`: Navegación y guards
- `@angular/forms`: Formularios reactivos
- `@angular/common`: Funcionalidades comunes

### Opcionales
- `now-ui-icons`: Iconos (puede reemplazarse)
- Bootstrap o similar para estilos base

## Contribución

Para contribuir al sistema:

1. Fork del repositorio
2. Crear rama de feature
3. Implementar cambios
4. Probar exhaustivamente
5. Crear pull request

## Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## Conceptos Avanzados de Angular

### ¿Qué es un Observable?

Un **Observable** es un patrón de programación que permite manejar datos asíncronos:

```typescript
// En nuestro AuthService
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();
```

**¿Por qué usar Observables?**
- **Reactividad**: Los componentes se actualizan automáticamente cuando cambian los datos
- **Comunicación**: Múltiples componentes pueden escuchar los mismos datos
- **Eficiencia**: Solo se actualizan los componentes que necesitan los datos

### ¿Qué es BehaviorSubject?

**BehaviorSubject** es un tipo especial de Observable que:

- **Valor Inicial**: Siempre tiene un valor (incluso antes de suscribirse)
- **Último Valor**: Recuerda el último valor emitido
- **Sincronización**: Los nuevos suscriptores reciben inmediatamente el valor actual

```typescript
// Ejemplo de uso
this.currentUserSubject.next(user); // Emite un nuevo usuario
this.currentUserSubject.value; // Obtiene el valor actual
```

### ¿Qué es la Inyección de Dependencias?

La **Inyección de Dependencias** permite que Angular proporcione automáticamente las dependencias:

```typescript
// En el constructor del componente
constructor(
  private authService: AuthService,  // Angular inyecta automáticamente
  private router: Router
) { }
```

**Ventajas:**
- **Desacoplamiento**: Los componentes no crean sus propias dependencias
- **Testeo**: Fácil de mockear en pruebas
- **Mantenimiento**: Cambios centralizados en un solo lugar

### ¿Qué es el Ciclo de Vida de un Componente?

Los componentes de Angular tienen métodos que se ejecutan en momentos específicos:

```typescript
export class LoginComponent implements OnInit {
  ngOnInit(): void {
    // Se ejecuta después de que el componente se inicializa
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
```

**Métodos principales:**
- `ngOnInit()`: Después de la inicialización
- `ngOnDestroy()`: Antes de destruir el componente
- `ngOnChanges()`: Cuando cambian las propiedades de entrada

## Flujo Completo del Sistema

### 1. Inicio de la Aplicación

```
Usuario abre la app → AppComponent se carga → AuthService se inicializa → 
loadUserFromStorage() verifica localStorage → Si hay datos, establece usuario actual
```

### 2. Proceso de Login

```
Usuario ingresa credenciales → LoginComponent valida formulario → 
AuthService.login() verifica credenciales → Si es válido, setUserData() guarda en localStorage → 
Router navega a /dashboard → AuthGuard verifica permisos → Sidebar se actualiza con opciones permitidas
```

### 3. Navegación Protegida

```
Usuario hace clic en enlace → Router verifica ruta → AuthGuard.canActivate() se ejecuta → 
Verifica autenticación → Verifica permisos → Si todo está bien, carga componente → 
Sidebar filtra opciones según rol
```

### 4. Logout

```
Usuario hace clic en logout → SidebarComponent.logout() se ejecuta → 
AuthService.logout() limpia localStorage → Router navega a /login → 
LoginGuard verifica que no esté autenticado → Muestra formulario de login
```

## Mejores Prácticas Implementadas

### 1. Separación de Responsabilidades
- **AuthService**: Solo maneja autenticación
- **Guards**: Solo protegen rutas
- **Componentes**: Solo manejan la UI

### 2. Manejo de Errores
```typescript
try {
  const user = JSON.parse(userData);
  this.currentUserSubject.next(user);
} catch (error) {
  console.error('Error al cargar datos del usuario:', error);
  this.logout();
}
```

### 3. Validación de Datos
```typescript
canAccess(route: string): boolean {
  const role = this.getUserRole();
  if (!role) return false; // Validar que existe el rol
  // ... resto de la lógica
}
```

### 4. Limpieza de Recursos
```typescript
logout(): void {
  localStorage.removeItem(this.TOKEN_KEY);
  localStorage.removeItem(this.USER_KEY);
  localStorage.removeItem(this.ROLE_KEY);
  this.currentUserSubject.next(null);
}
```

---

**Nota:** Este sistema está diseñado para desarrollo y demostración. Para uso en producción, se recomienda implementar un backend real con autenticación segura.
