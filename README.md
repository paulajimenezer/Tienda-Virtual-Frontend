# Tienda Virtual Frontend (Angular 17)

Cliente web para la plataforma Tienda Virtual. Está construido con Angular 17 y consume la API FastAPI del backend (`../Tienda-Virtual`) para administrar usuarios, catálogos, pedidos, carritos y facturas desde un panel administrativo responsive.

## Características clave

- **Arquitectura modular** (core, features, shared) con componentes standalone.
- **Integración total con FastAPI** mediante servicios tipados, interceptores y guards JWT.
- **Gestión completa** de usuarios, roles, productos, categorías, descuentos, pedidos, carritos y facturas.
- **Filtros híbridos** (server + client) para búsquedas por nombre, estado, fechas y atributos específicos.
- **Formularios reactivos + SCSS modulados**, listos para aplicar validaciones y estilos consistentes.
- **Scripts de desarrollo** que simplifican el arranque mediante `start-dev.js` con mensajes guiados.

## Stack

| Capa | Tecnologías |
| --- | --- |
| Framework SPA | Angular 17, Angular Router |
| Lenguaje | TypeScript 5, RxJS 7 |
| UI | SCSS modular, componentes standalone |
| Tooling | Angular CLI, Karma/Jasmine, ESLint |
| Backend esperado | FastAPI (`../Tienda-Virtual`) |

## Requisitos previos

- Node.js 18+ (usa la misma versión que CI/producción para evitar discrepancias).
- npm 9+ (o pnpm/yarn si adaptas los scripts).
- Angular CLI instalado globalmente (`npm install -g @angular/cli`).
- Backend FastAPI levantado o una URL accesible de la API.

## Puesta en marcha

```powershell
# 1. Instalar dependencias
npm install

# 2. Configurar la URL del backend (ver sección "Configuración de entornos")

# 3. Levantar el backend FastAPI desde ../Tienda-Virtual

# 4. Iniciar el frontend con mensajes guiados
npm start

#   Alternativa minimalista (sin script personalizado)
npm run start:simple
```

El servidor se expone en `http://localhost:4200`. `npm start` abre el navegador y muestra URLs útiles en consola. Usa `Ctrl + C` para detener.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm start` | Ejecuta `start-dev.js`, que lanza `ng serve` (0.0.0.0:4200) y muestra instrucciones amigables. |
| `npm run start:simple` | Ejecuta `ng serve --open` de manera directa (útil en contenedores). |
| `npm run build` | Compila para producción dentro de `dist/`. |
| `npm run watch` | Build en modo watch para integraciones. |
| `npm test` | Pruebas unitarias con Karma + Jasmine. |
| `npm run lint` | Reglas de estilo/calidad (`ng lint`). |

> Recomendación: ejecuta `npm run lint` y `npm test` antes de subir cambios o crear PRs.

## Configuración de entornos

Las URLs de API y flags se definen en `src/environments/`.

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://midominio/api'
};
```

Actualiza ambos archivos para reflejar tu backend (dev/prod). El valor se consume en los servicios (`environment.apiUrl`).

## Arquitectura de carpetas (resumen)

```
src/
├─ app/
│  ├─ app.component|config|routes.ts
│  ├─ core/
│  │  ├─ services/      # ApiService, AuthService, PedidoService, etc.
│  │  ├─ interceptors/  # auth.interceptor.ts (JWT), error.interceptor.ts
│  │  └─ guards/        # Protección de rutas según roles/permisos
│  ├─ features/
│  │  ├─ auth/
│  │  ├─ carrito/
│  │  ├─ categoria/
│  │  ├─ descuento/
│  │  ├─ factura/
│  │  ├─ pedido/
│  │  ├─ producto/
│  │  └─ usuario/
│  └─ shared/           # Componentes utilitarios, pipes, modelos compartidos
├─ assets/
└─ environments/
```

Cada feature encapsula vistas, estilos y lógica específica. Los servicios viven en `core` para ser reutilizados a lo largo de la aplicación.

## Integración con la API FastAPI

- **Autenticación**: `AuthService` maneja login/logout; los interceptores inyectan el JWT (si existe) y centralizan el manejo de errores/refresh.
- **Servicios REST**: cada recurso (`PedidoService`, `FacturaService`, `UsuarioService`, etc.) abstrae las llamadas `HttpClient` y define métodos para filtros, búsquedas y acciones CRUD.
- **Filtros avanzados**: componentes como `pedido-list`, `carrito-list` o `factura-list` consultan primero al backend (ej. búsqueda por nombre o usuario) y luego aplican filtros locales (estado, fecha, activo) para mejorar la UX sin duplicar lógica.
- **Mensajería de estados**: los componentes muestran mensajes claros para "cargando", "sin resultados" o errores, de modo que el usuario final entienda lo que ocurre.

## Flujo recomendado de desarrollo

1. **Levanta el backend** y verifica que expone las rutas `api/**` necesarias.
2. **Ajusta `environment.ts`** con la URL correcta del backend.
3. **Ejecuta `npm start`** para trabajar en caliente con `ng serve`.
4. **Desarrolla features** creando o reutilizando servicios en `core`. Evita llamar `HttpClient` directamente en los componentes.
5. **Valida datos** desde los formularios reactivos antes de enviar peticiones.
6. **Prueba y lint** antes de subir cambios:
   ```powershell
   npm run lint
   npm test
   ```
7. **Construye** cuando necesites empaquetar la app:
   ```powershell
   npm run build
   ```
   El artefacto queda en `dist/frontend-angular-clean-architecture/` (configurable).

## Buenas prácticas

- Centraliza toda lógica HTTP en servicios dentro de `core/services`.
- Usa interceptores para manejar tokens, errores y logging.
- Mantén los filtros en los componentes sincronizados con las capacidades reales del backend.
- Documenta ayudas visuales (placeholders, labels) para entradas que esperan UUIDs u otros formatos específicos.
- Añade pruebas unitarias cuando agregues lógica en servicios o componentes complejos.

## Solución de problemas

| Problema | Posible causa / solución |
| --- | --- |
| **401/403 en todas las peticiones** | El backend no está levantado o el `apiUrl` es incorrecto. Verifica que el token se guarde tras el login. |
| **Filtros no muestran resultados** | Comprueba si el backend retorna datos para ese criterio. Los filtros por nombre/ID hacen llamadas server-side y luego aplican filtros locales. |
| **`npm start` no abre navegador** | Usa `npm run start:simple` o lanza `ng serve` manualmente (algunos entornos bloquean `--open`). |
| **Errores de CORS** | Asegúrate de habilitar CORS en FastAPI (`CORSMiddleware`) para la URL del frontend. |
| **Build se queda sin memoria** | Ejecuta `node --max-old-space-size=4096 node_modules/@angular/cli/bin/ng build`. |

## Próximos pasos sugeridos

- Implementar refresh tokens si el backend lo soporta.
- Añadir pruebas unitarias/e2e por feature crítico.
- Evaluar NgRx o signals cuando se requiera un estado global más complejo.
- Automatizar despliegues (GitHub Actions / Azure DevOps) con build + pruebas.

---
¿Necesitas extender el frontend o integrar nuevos endpoints? Abre un issue o PR describiendo tu cambio. ¡Feliz coding! 🚀
