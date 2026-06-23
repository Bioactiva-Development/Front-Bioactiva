# Informe de Estructura del Frontend — BioActiva CRM

## 1. Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16 App Router | Framework principal con enrutamiento basado en archivos |
| React | 19 | UI components |
| TypeScript | ~5.x | Tipado estático |
| Tailwind CSS | 4 | Estilos utilitarios |
| TanStack Query | ~5.x | Server state (data fetching, caché, mutaciones) |
| Zustand | ~4.x | Estado global (auth, UI) |
| Axios | ~1.x | Cliente HTTP con interceptores |
| Zod | ~3.x | Validación de formularios |
| React Hook Form | ~7.x | Manejo de formularios |
| Recharts | ~2.x | Gráficos en dashboard |

## 2. Arquitectura de Capas

El proyecto sigue una arquitectura estrictamente en capas:

```
PÁGINAS / COMPONENTES (UI)
       ↓
HOOKS (TanStack Query wrappers)
       ↓
SERVICIOS (Llamadas API + mappers)
       ↓
CLIENTE API (Axios + endpoints)
       ↓
BACKEND (NestJS REST API)
```

### 2.1 Capa de Presentación (`src/app/`)

- **Route Groups**: `(auth)` para páginas públicas (login, reset password) y `(dashboard)` para páginas autenticadas con sidebar.
- Cada módulo sigue la misma estructura de rutas:
  - `/modulo` → página de listado
  - `/modulo/[id]` → página de detalle (con toggle vista/edición)
  - `/modulo/nueva` (o `nuevo/`) → página de creación

### 2.2 Capa de Componentes (`src/components/`)

- `components/ui/` → primitivas reutilizables (Button, Modal, SearchBar, Spinner, EmptyState)
- `components/layout/` → componentes de layout (Navbar, Sidebar, PageHeader)
- `components/modules/` → componentes específicos por dominio

### 2.3 Capa de Hooks (`src/hooks/`)

Cada módulo tiene hooks que envuelven TanStack Query:
- `useOrganizaciones(filtros)` → query con `keepPreviousData`
- `useCrearOrganizacion()` → mutation que invalida caché
- `useSunat()` → hook compuesto con estado de búsqueda SUNAT

### 2.4 Capa de Servicios (`src/services/`)

- `services/api/client.ts` → instancia Axios con interceptores (token, refresh, errores)
- `services/api/endpoints.ts` → todas las URLs centralizadas
- `services/modules/*.service.ts` → lógica de negocio por dominio
- `services/modules/*.mapper.ts` → mapeo DTO ↔ dominio (camelCase ↔ snake_case)
- `services/mock/` → datos mock para desarrollo

### 2.5 Tipos y Validación

- `src/types/` → interfaces y tipos TypeScript
- `src/lib/validators/` → esquemas Zod para formularios
- `src/lib/utils/` → utilidades de formato y transformación

## 3. Módulo de Organizaciones (Foco de los Tests)

### 3.1 Rutas

| Ruta | Archivo | Propósito |
|---|---|---|
| `/organizaciones` | `app/(dashboard)/organizaciones/page.tsx` | Listado con tabla, filtros (búsqueda, sector, tamaño, tipo), paginación, botones "Validador SUNAT" y "Nueva Organización" |
| `/organizaciones/nueva` | `app/(dashboard)/organizaciones/nueva/page.tsx` | Formulario de creación con soporte para datos SUNAT |
| `/organizaciones/[id]` | `app/(dashboard)/organizaciones/[id]/page.tsx` | Detalle con toggle vista/edición |

### 3.2 Componentes Clave

| Componente | Archivo | Propósito |
|---|---|---|
| `OrganizacionForm` | `components/modules/organizaciones/OrganizacionForm.tsx` | Formulario central (create/edit). React Hook Form + Zod. Incluye toggle "Por RUC" / "Por Razón Social". Acepta `sunatData` para autocompletado. |
| `OrganizacionDetalle` | `components/modules/organizaciones/OrganizacionDetalle.tsx` | Vista de detalle con contactos, leads, cotizaciones asociadas |
| `OrganizacionCard` | `components/modules/organizaciones/OrganizacionCard.tsx` | Fila de tabla con avatar, nombre, RUC, sector, tamaño, acción |
| `OrganizacionFiltros` | `components/modules/organizaciones/OrganizacionFiltros.tsx` | Input de búsqueda (debounce 400ms) + 3 selects (sector, tamaño, tipo) |
| `SunatBuscador` | `components/modules/organizaciones/SunatBuscador.tsx` | Modal con tabs RUC/Razón social, resultados, botón "Usar estos datos" |

### 3.3 Formulario — Campos

| Campo | ID / Selector | Tipo | Requerido |
|---|---|---|---|
| `codigo_cliente` | `#of-codigo` | text (max 20) | Sí (o autogenerado) |
| `ruc` | `#of-ruc` | text (11 dígitos) | No |
| `nombre` | `#of-nombre` | text (max 120) | Sí |
| `nombre_comercial` | `#of-nombre-comercial` | text (max 100) | Sí |
| `sub_area` | `#of-sub-area` | text (max 60) | No |
| `tipo` | `#of-tipo` | select | Sí |
| `tamano` | `#of-tamano` | select | Sí |
| `sector` | `#of-sector` | select | Sí |
| `ubicacion` | `#of-ubicacion` | text (max 200) | No |
| `actividad_economica` | `#of-actividad` | text (max 200) | No |
| `linkedin` | `#of-linkedin` | text (max 255) | No |
| `alianzas_estrategicas` | `#of-alianzas` | text (max 300) | No |

### 3.4 Endpoints API

| Endpoint | Método | Propósito |
|---|---|---|
| `/organizations` | GET | Listar organizaciones |
| `/organizations` | POST | Crear organización |
| `/organizations/:id` | GET | Obtener detalle |
| `/organizations/:id` | PATCH | Actualizar |
| `/organizations/:id` | DELETE | Soft delete |
| `/organizations/sunat?query=` | GET | Consulta SUNAT (RUC o razón social) |

## 4. Estado Actual de los Tests E2E

### 4.1 Configuración

- **Framework**: Playwright (config en `playwright.config.ts`)
- **Test directory**: `test/e2e/`
- **Proyectos**: `"setup"` (auth) → `"chromium"` (tests)
- **Autenticación**: `auth.setup.ts` — login con credenciales de `.env.local` + CAPTCHA manual
- **Sin `webServer`**: apunta directamente a `https://bioactiva.ingsoftware.lat`

### 4.2 Archivos

| Archivo | Estado | Lo que hace |
|---|---|---|
| `auth.setup.ts` | ✅ Funcional | Login + storage state |
| `organizations/view-organizations.spec.ts` | ⚠️ Parcial | 2 tests (uno completo, otro incompleto) |
| `organizations/create-organization.spec.ts` | ❌ Vacío | 0 líneas |
| `dashboard.spec.ts` | ❌ Vacío | 0 líneas |

### 4.3 Documentación de Contexto

En `test/contexto/` hay 5 archivos HTML capturados del sitio en vivo:
- `dashboard.md`, `gestion_orgs.md`, `nueva_org.md`, `validador_sunat.md`, `pasos.md`

## 5. Patrones Relevantes para Tests

1. **Selectores**: El HTML usa clases Tailwind y componentes con `id` (ej: `of-codigo`, `of-ruc`, `of-nombre`).
2. **Modal SUNAT**: No es ruta independiente — es un modal que se abre sobre la página actual.
3. **Debounce (400ms)**: Considerar `page.waitForTimeout(500)` después de escribir en búsqueda.
4. **Mocks de Red**: Usar `page.route()` para interceptar `/organizations/sunat*` y simular SUNAT.
5. **Autenticación**: Setup requiere CAPTCHA manual. Tests asumen sesión vía `storageState`.
6. **DUC DTO**: Backend usa camelCase — `razonSocial`, `nombreComercial`, `actividadEconomica`.
7. **Código de Cliente**: Se genera automáticamente desde SUNAT o se ingresa manual.
