# Informe Final — Tests E2E Módulo Organizaciones

## Resumen

Se planificaron **18 tests E2E** para el módulo de Organizaciones del CRM BioActiva, organizados en 5 archivos spec. Actualmente **8 tests implementados** (bloques 1 y 2). Pendientes **10 tests** (bloques 3, 4, 5, 6).

## Arquitectura de la página de detalle

El archivo `src/app/(dashboard)/organizaciones/[id]/page.tsx` tiene tres modos manejados por estado local:

1. **Detalle** (`editando=false`): Renderiza `<OrganizacionDetalle>` que muestra:
   - Cabecera: nombre, RUC, tipo, tamaño, sector, ubicación
   - 3 botones de acción: "Volver a Organizaciones", "Desactivar", "Editar organización"
   - Sección "Contactos asociados" (cards o empty state)
   - Sección "Historial de leads" (cards con estado y fecha)
   - Sección "Historial de cotizaciones" (cards con monto, fecha, estado)
   - Sección opcional "Información adicional" (LinkedIn, alianzas)

2. **Edición** (`editando=true`): Renderiza `<OrganizacionForm>` con:
   - Mismos campos que creación (`#of-codigo`, `#of-nombre`, `#of-nombre-comercial`, etc.)
   - `#of-codigo` es `readOnly` (generado automáticamente)
   - Sin tabs de búsqueda SUNAT (RUC no es editable en edición)
   - Botón "Guardar cambios" en vez de "Guardar organización"

3. **Desactivación** (`confirmarEliminar=true`): Modal inline con:
   - Heading "Desactivar organización"
   - Texto de advertencia: "Se desactivará [nombre] y sus N contactos quedarán como VENCIDOS"
   - Botones "Cancelar" (gris) y "Desactivar" (rojo)

## Llamadas API requeridas para tests deterministas

| Endpoint | Método | Se usa en |
|---|---|---|
| `GET /organizations/:id` | GET | Detalle (carga organización) |
| `GET /contacts/organization/:id` | GET | Detalle (carga contactos) |
| `GET /leads?idOrg=:id&limit=100` | GET | Detalle (carga leads) |
| `GET /quotations?idOrg=:id&limit=100` | GET | Detalle (carga cotizaciones) |
| `PATCH /organizations/:id` | PATCH | Edición (guardar cambios) |
| `DELETE /organizations/:id` | DELETE | Desactivación |

## Archivos

### Existentes (implementados)

| Archivo | Tests | Propósito |
|---|---|---|
| `test/e2e/organizations/view-organizations.spec.ts` | 4 | Listado, filtros, modal SUNAT, navegación |
| `test/e2e/organizations/create-organization.spec.ts` | 4 | Creación feliz, duplicado, manual, validación |

### Planificados (pendientes de implementación)

| Archivo | Tests | Pasos cubiertos |
|---|---|---|
| `test/e2e/organizations/detail-organization.spec.ts` | 5 | 15–20: Info general, contactos, leads, cotizaciones, volver |
| `test/e2e/organizations/edit-organization.spec.ts` | 2 | 21–27: Form precargado, cambiar sector, guardar |
| `test/e2e/organizations/deactivate-organization.spec.ts` | 3 | 28–31: Modal, cancelar, confirmar desactivación |

## Estrategia de Tests

### Intercepción de Red

Todas las llamadas API relevantes se interceptan con `page.route()`:

| Llamada | Comportamiento Mock |
|---|---|
| `GET /organizations/sunat*` | Retorna datos SUNAT ficticios (RUC o Razón Social) |
| `POST /organizations` (éxito) | 201 con `OrganizacionDtoOut` |
| `POST /organizations` (duplicado) | 409 con error |
| `GET /organizations/:id` | 200 con `OrganizacionConRelacionesDto` |
| `GET /contacts/organization/:id` | 200 con arreglo de `ContactoResumidoDto` |
| `GET /leads?idOrg=*` | 200 con arreglo de `LeadDtoOut` |
| `GET /quotations?idOrg=*` | 200 con arreglo de `CotizacionDtoOut` |
| `PATCH /organizations/:id` | 200 con `OrganizacionDtoOut` actualizado |
| `DELETE /organizations/:id` | 200/204 (vació) |

### Page Object Model

Cada spec file contiene clases POM inline por la limitación de Playwright v1.61.0 en Windows (no puede importar `.ts` desde `.spec.ts`).

### Escenarios Cubiertos (18 total)

#### `view-organizations.spec.ts` (4 tests)
1. Visualizar tabla con columnas y filtros
2. Filtrar por texto de búsqueda
3. Abrir modal Validador SUNAT
4. Navegar a Nueva Organización

#### `create-organization.spec.ts` (4 tests)
5. Crear organización vía SUNAT por RUC (camino feliz)
6. RUC duplicado → error 409 (camino negativo)
7. Registro manual sin RUC (flujo alternativo)
8. Validación de formulario vacío (errores visibles)

#### `detail-organization.spec.ts` (5 tests)
9. Información general visible (nombre, RUC, tipo, tamaño, sector)
10. Sección de contactos asociados
11. Historial de leads
12. Historial de cotizaciones
13. Volver al listado de organizaciones

#### `edit-organization.spec.ts` (2 tests)
14. Formulario de edición con datos precargados
15. Cambiar sector y guardar cambios

#### `deactivate-organization.spec.ts` (3 tests)
16. Modal de confirmación visible
17. Cancelar desactivación
18. Confirmar desactivación y redirigir

## Pendientes / Próximos Pasos

- [ ] Implementar `detail-organization.spec.ts` (5 tests)
- [ ] Implementar `edit-organization.spec.ts` (2 tests)
- [ ] Implementar `deactivate-organization.spec.ts` (3 tests)
- [ ] Agregar test de validación de formulario vacío en `create-organization.spec.ts`
- [ ] Ejecutar suite completa: `npx playwright test --project=chromium`
