# Plan de Elaboración de Tests E2E — Módulo Organizaciones

## 1. Estado Actual (8 tests implementados)

### Archivos existentes

```
test/e2e/organizations/
├── view-organizations.spec.ts      ← 4 tests: listado, filtros, modal SUNAT, navegación
└── create-organization.spec.ts     ← 4 tests: feliz, duplicado, manual, validación
```

### Endpoints mockeados con `page.route()`

| Endpoint | Método | Propósito |
|---|---|---|
| `/organizations/sunat*` | GET | SUNAT por RUC o Razón Social |
| `/organizations` | POST | Crear organización (éxito 201 o error 409) |

## 2. Nuevo Alcance — Pasos 10–32

### Análisis de la página de detalle (`/organizaciones/[id]`)

La página `src/app/(dashboard)/organizaciones/[id]/page.tsx` tiene 3 modos:
1. **Detalle** (default) → renderiza `<OrganizacionDetalle>` con info, contactos, leads, cotizaciones
2. **Edición** (state `editando=true`) → renderiza `<OrganizacionForm>` con datos precargados (mismo componente que creación, pero con `readOnly` en código cliente y botón "Guardar cambios")
3. **Desactivación** (state `confirmarEliminar=true`) → modal inline de confirmación

### Llamadas API que debe mocks para tests deterministas

| # | Endpoint | Método | DTO esperado | Uso |
|---|---|---|---|---|
| 1 | `/organizations/:id` | GET | `OrganizacionConRelacionesDto` | Info general de la org |
| 2 | `/contacts/organization/:id` | GET | `ContactoResumidoDto[]` | Contactos asociados |
| 3 | `/leads?idOrg=:id&limit=100` | GET | `LeadDtoOut[]` | Historial de leads |
| 4 | `/quotations?idOrg=:id&limit=100` | GET | `CotizacionDtoOut[]` | Historial de cotizaciones |
| 5 | `/organizations/:id` | PATCH | `OrganizacionDtoOut` | Actualizar organización |
| 6 | `/organizations/:id` | DELETE | 200/204 | Desactivar organización |

### Formato de datos para mocks

Basado en `src/services/modules/organizaciones.mapper.ts`:

**OrganizacionDtoOut** (GET, PATCH response):
```json
{
  "id": "mock-org-id",
  "codigoCliente": "TEC-MOCK-001",
  "nombre": "TECSUP MOCK",
  "nombreComercial": "TECSUP SEDE LIMA MOCK",
  "subArea": null,
  "ruc": "20117592899",
  "tipo": "EMPRESA_NACIONAL",
  "linkedin": null,
  "ubicacion": "LIMA",
  "sector": "EDUCACION",
  "tamano": "MEDIANO",
  "actividadEconomica": null,
  "alianzasEstrategicas": null,
  "idContactoActivo": null,
  "idAuthor": 1,
  "createdAt": "2026-06-19T00:00:00Z",
  "updatedAt": "2026-06-19T00:00:00Z"
}
```

**ContactoResumidoDto** (GET contacts/organization/:id):
```json
[
  {
    "id": 1,
    "nombres": "Carlos",
    "apellidos": "Perez",
    "vocativo": "SR.",
    "cargo": "Gerente General",
    "correo": "carlos@tecsup.pe",
    "telefono": "+51999000001"
  }
]
```

**LeadDtoOut** (GET /leads, forma de arreglo):
```json
[
  {
    "id": 101,
    "servicioInteres": "Consultoría Técnica",
    "estado": "CIERRE_SIN_VENTA",
    "createdAt": "2026-06-19T00:00:00Z",
    "encargado": "Joseph Anderson Cose Rojas"
  }
]
```

**CotizacionDtoOut** (GET /quotations, forma de arreglo):
```json
[
  {
    "id": 201,
    "nombreServicio": "Formulación de Proyecto",
    "monto": 0,
    "tipo": "PEN",
    "estado": "ENVIADA",
    "fechaCot": "2026-06-19T00:00:00Z",
    "dirigido": "Carlos Perez",
    "nombreRemitente": "Fabricio Alonso Lanche Pacsi"
  }
]
```

## 3. Estructura de Archivos Propuesta (Final)

```
test/e2e/organizations/
├── view-organizations.spec.ts      ← 4 tests (existente, sin cambios)
├── create-organization.spec.ts     ← 4 tests (existente + 1 nuevo: validación)
├── detail-organization.spec.ts     ← 5 tests (NUEVO)
├── edit-organization.spec.ts       ← 2–3 tests (NUEVO)
└── deactivate-organization.spec.ts ← 3 tests (NUEVO)
```

Todos los archivos son **autocontenidos** (POM + mocks inline) por la limitación de Playwright v1.61.0 en Windows que impide importar `.ts` desde `.spec.ts`.

## 4. Escenarios de Test — Paso a Paso

### Bloque 3: Detalle de Organización (`detail-organization.spec.ts`)
Cubre pasos 15–20.

| # | Test | Pasos | Verifica |
|---|---|---|---|
| 9 | Mostrar información general (nombre, RUC, tipo, tamaño, sector, ubicación) | 15, 16 | Badges y texto visible en cabecera |
| 10 | Mostrar sección de contactos asociados | 17 | Heading "Contactos asociados" + cards de contacto |
| 11 | Mostrar historial de leads | 18 | Heading "Historial de leads" + cards con estado |
| 12 | Mostrar historial de cotizaciones | 19 | Heading "Historial de cotizaciones" + cards con estado |
| 13 | Navegar de vuelta al listado | 20 | Click "Volver a Organizaciones" → URL cambia a `/organizaciones` |

**Estrategia**: Mockear las 4 llamadas GET para un ID ficticio. Esto hace el test determinista (mismos datos siempre) y rápido (sin esperar backend real).

### Bloque 4: Edición de Organización (`edit-organization.spec.ts`)
Cubre pasos 21–27.

| # | Test | Pasos | Verifica |
|---|---|---|---|
| 14 | Mostrar formulario de edición con datos precargados | 21, 22, 23 | Click "Editar organización" → form visible con valores esperados; `#of-codigo` es readonly; botón dice "Guardar cambios" |
| 15 | Cambiar sector y guardar cambios | 24, 25, 26, 27 | Seleccionar nuevo sector → click "Guardar cambios" → mock PATCH 200 → página vuelve a detalle con sector actualizado |

**Estrategia**:
- Test 14: Navegar a detalle (mocks GET), click "Editar", verificar form reactivo.
- Test 15: Interceptar `PATCH /organizations/:id` para retornar 200 con DTO actualizado. Verificar que tras submit la URL vuelve a `/organizaciones/:id`.

### Bloque 5: Desactivación (`deactivate-organization.spec.ts`)
Cubre pasos 28–31.

| # | Test | Pasos | Verifica |
|---|---|---|---|
| 16 | Mostrar modal de confirmación al hacer clic en Desactivar | 28, 29 | Click "Desactivar" → modal visible con heading "Desactivar organización" y texto sobre contactos VENCIDOS |
| 17 | Cancelar desactivación cierra el modal | 30 (cancelar) | Click "Cancelar" en modal → modal desaparece |
| 18 | Confirmar desactivación redirige al listado | 30 (confirmar), 31 | Click "Desactivar" en modal → mock DELETE 200 → URL cambia a `/organizaciones` |

**Estrategia**: Mockear las 4 llamadas GET para cargar el detalle, luego mockear DELETE para la desactivación. El modal se controla con state local (`confirmarEliminar`), no hay llamada API hasta que se confirma.

### Bloque 6: Validación de formulario (Nuevo test en `create-organization.spec.ts`)
Cubre paso 11.

| # | Test | Pasos | Verifica |
|---|---|---|---|
| 19 | Mostrar errores de validación al enviar formulario vacío | 11 | Click "Guardar organización" sin llenar campos → mensajes de error visibles: "El nombre es obligatorio", "El nombre comercial es obligatorio", "El tipo es obligatorio", etc. |

**Estrategia**: Navegar a `/organizaciones/nueva`, hacer click en Guardar sin llenar nada. React Hook Form con Zod validará y mostrará los `<p class="text-red-500 text-xs">` debajo de cada campo.

## 5. DTOs Backend para Mocks

Basado en `src/services/modules/organizaciones.mapper.ts:22-76`:

```typescript
// OrganizacionDtoOut (GET /organizations/:id)
interface OrganizacionDtoOut {
  id: string
  codigoCliente: string
  nombre: string
  nombreComercial: string
  subArea: string | null
  ruc: string | null
  tipo: string              // Backend enum: "EMPRESA_NACIONAL" | "ONG" | etc
  linkedin: string | null
  ubicacion: string | null
  sector: string | null     // "EDUCACION" | "TECNOLOGIA" | etc
  tamano: string            // "MICRO" | "PEQUENO" | "MEDIANO" | "GRANDE"
  actividadEconomica: string | null
  alianzasEstrategicas: string | null
  idContactoActivo: number | null
  idAuthor: number
  createdAt: string
  updatedAt: string
}
```

## 6. Resumen Final de Tests

| Bloque | Archivo | Tests | Pasos cubiertos |
|---|---|---|---|
| Listado y filtros | `view-organizations.spec.ts` | 4 | 1, 2, 3, 4b |
| Creación | `create-organization.spec.ts` | 4 | 4a, 5, 6, 7, 8, 9, 10, 11 |
| Detalle | `detail-organization.spec.ts` | 5 | 15, 16, 17, 18, 19, 20 |
| Edición | `edit-organization.spec.ts` | 2 | 21, 22, 23, 24, 25, 26, 27 |
| Desactivación | `deactivate-organization.spec.ts` | 3 | 28, 29, 30, 31 |
| **Total** | **5 archivos** | **18** | **Pasos 1–31** |

## 7. Criterios de Aceptación

- Todos los tests pasan con `npx playwright test --project=chromium`
- No dependen de SUNAT real (todas las llamadas SUNAT interceptadas)
- No crean/modifican/eliminan registros reales en el backend (POST/PATCH/DELETE interceptados)
- No importan archivos `.ts` externos desde `.spec.ts` (todo inline por limitación de Playwright v1.61.0 Windows)
- Selectores usan `id`, `role`, `placeholder`, `label` — nunca clases CSS
- Cada test es independiente (no depende del resultado de otro test)
