# Skill: Tests E2E con Playwright — BioActiva CRM (Módulo Organizaciones)

## Contexto del Proyecto

CRM BioActiva, frontend Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4.
Backend NestJS REST en `https://bioactiva.ingsoftware.lat`.

## Stack de Testing

- **Playwright** v1.61.0 (config en `playwright.config.ts`)
- Test directory: `test/e2e/`
- Auth: `auth.setup.ts` (login + CAPTCHA manual → `test/e2e/.auth/user.json`)
- No `webServer` configurado — tests contra live site
- Único browser habilitado: `chromium`
- **Limitación crítica**: Playwright v1.61.0 en Windows NO puede importar `.ts` desde `.spec.ts` (`TypeError: context.conditions?.includes is not a function`). Todo POM + mock debe ir **inline** en cada spec file.

## Estructura de Tests

```
test/e2e/
├── .auth/user.json                    # Storage state (sesión)
├── auth.setup.ts                      # Setup de autenticación
└── organizations/
    ├── view-organizations.spec.ts     # 4 tests: listado + filtros + SUNAT modal + navegación
    └── create-organization.spec.ts    # 4 tests: feliz, duplicado, manual, validación
```

**Pendientes**:
- `detail-organization.spec.ts` (5 tests: info general, contactos, leads, cotizaciones, volver)
- `edit-organization.spec.ts` (2 tests: form precargado, cambiar sector)
- `deactivate-organization.spec.ts` (3 tests: modal, cancelar, confirmar)

## Estrategia de Mocks

Usar `page.route()` de Playwright para interceptar TODAS las llamadas:

```
GET  /organizations/sunat*              // SUNAT queries
POST /organizations                      // Crear (éxito 201 / error 409)
GET  /organizations/:id                 // Detalle (OrganizacionConRelacionesDto)
GET  /contacts/organization/:id         // Contactos asociados
GET  /leads?idOrg=:id&limit=100         // Historial de leads
GET  /quotations?idOrg=:id&limit=100    // Historial de cotizaciones
PATCH /organizations/:id                // Editar (200 + dto actualizado)
DELETE /organizations/:id               // Desactivar (200/204)
```

Mocks devuelven DTOs en formato backend (camelCase):
- `OrganizacionDtoOut`: `{ id, codigoCliente, nombre, nombreComercial, ruc, tipo: "EMPRESA_NACIONAL", tamano: "MEDIANO", sector: "EDUCACION", ... }`
- `ContactoResumidoDto`: `{ id, nombres, apellidos, vocativo, cargo, correo, telefono }`
- `LeadDtoOut`: `{ id, servicioInteres, estado, createdAt, encargado }`
- `CotizacionDtoOut`: `{ id, nombreServicio, monto, tipo, estado, fechaCot, dirigido, nombreRemitente }`

## Arquitectura Clave del Frontend

### Página de detalle (`/organizaciones/[id]`)
Tres modos manejados por estado local:
1. **Detalle** → `<OrganizacionDetalle>` (cabecera + contactos + leads + cotizaciones)
2. **Edición** (`editando=true`) → `<OrganizacionForm>` (mismo form que creación, readonly `#of-codigo`, botón "Guardar cambios")
3. **Desactivación** (`confirmarEliminar=true`) → modal inline con heading "Desactivar organización"

### Selectores principales
- Formulario: `#of-codigo`, `#of-nombre`, `#of-nombre-comercial`, `#of-tipo`, `#of-tamano`, `#of-sector`
- Acciones: botón "Editar organización", "Desactivar", "Volver a Organizaciones"
- Modal: heading "Desactivar organización", botones "Cancelar" y "Desactivar"

## Escenarios Cubiertos (Plan: 18 tests)

### Implementados (8)
1. **Listado**: tabla visible, columnas, filtros (búsqueda + selects)
2. **Validador SUNAT**: modal visible desde listado
3. **Camino feliz creación**: SUNAT mock → autocompletar → guardar → redirección
4. **Camino negativo**: RUC duplicado → error 409 → mensaje visible
5. **Flujo alternativo**: código manual → llenar formulario → guardar
6. **Validación**: formulario vacío → errores visibles por campo

### Pendientes (10)
7. **Detalle**: info general visible (nombre, RUC, tipo, tamaño, sector)
8. **Detalle**: sección contactos asociados
9. **Detalle**: historial de leads
10. **Detalle**: historial de cotizaciones
11. **Detalle**: volver al listado
12. **Edición**: form precargado con datos existentes
13. **Edición**: cambiar sector y guardar cambios
14. **Desactivación**: modal de confirmación visible
15. **Desactivación**: cancelar cierra el modal
16. **Desactivación**: confirmar redirige al listado

## Comandos Útiles

```bash
npx playwright test --project=chromium              # Todos los tests
npx playwright test --project=chromium --headed     # Con navegador visible
npx playwright test organizations/                   # Solo módulo organizaciones
npx playwright test organizations/detail-org          # Un archivo específico
npx playwright show-report                           # Ver reporte HTML
```

## Reglas para Tests Nuevos

1. Siempre usar `page.route()` para llamadas externas (SUNAT, API)
2. Interceptar POST/PATCH/DELETE para no modificar datos reales
3. No hardcodear tiempos de espera — usar `waitForSelector`, `waitForURL`, etc.
4. Usar selectores por `id`, `role`, `label` o `placeholder` — evitar clases CSS
5. Separar caminos felices, negativos y alternativos en distintos `test()`
6. **NO importar archivos `.ts` desde `.spec.ts`** — todo inline (limitación Playwright v1.61.0 Windows)
