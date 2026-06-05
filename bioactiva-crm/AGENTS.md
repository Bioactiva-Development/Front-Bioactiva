# BioActiva CRM - Guia para agentes

Este archivo es la fuente operativa para agentes que analicen o modifiquen este frontend. Antes de tocar codigo, revisa esta guia, el contrato backend vigente y los mappers existentes.

## Fuentes de verdad

- Analisis y diseno funcional: documento Bioactiva/UTEC compartido por el equipo.
- Backend actualizado: https://bioactiva.mintlify.app/introduction
- Indice backend para agentes: https://bioactiva.mintlify.app/llms.txt
- Paginas clave:
  - Leads: https://bioactiva.mintlify.app/api/leads/overview
  - Lead status: https://bioactiva.mintlify.app/api/leads/status
  - Quotations: https://bioactiva.mintlify.app/api/quotations/overview
  - Quotation lifecycle: https://bioactiva.mintlify.app/api/quotations/lifecycle
  - Activities: https://bioactiva.mintlify.app/api/activities/overview
  - Activity lifecycle: https://bioactiva.mintlify.app/api/activities/lifecycle
  - Users: https://bioactiva.mintlify.app/api/users/list
  - Organizations: https://bioactiva.mintlify.app/api/organizations/overview
  - Contacts: https://bioactiva.mintlify.app/api/contacts/overview

Si hay conflicto entre mocks, comentarios antiguos o documentos locales y Mintlify, prioriza Mintlify. La API rechaza propiedades desconocidas: errores como `property <campo> should not exist` significan que el frontend esta enviando un campo fuera del contrato.

## Stack y estructura

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- TanStack Query para server state.
- Axios en `src/services/api/client.ts`.
- URLs solo en `src/services/api/endpoints.ts`.
- Servicios por dominio en `src/services/modules/*.service.ts`.
- Mappers por dominio en `src/services/modules/*.mapper.ts`.
- Mocks en `src/services/mock`.
- Tipos en `src/types`.
- Validadores Zod en `src/lib/validators`.
- Estado global con Zustand en `src/store`.

Regla basica: componentes y paginas no deben conocer detalles del backend. Componentes llaman hooks; hooks llaman servicios; servicios usan endpoints y mappers.

## Contrato backend actual

La API usa rutas REST en ingles, sin prefijo `/api` para los modulos principales:

| Dominio | Endpoints vigentes |
| --- | --- |
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, reset password |
| Users | `GET /users`, `PATCH /users/:id/enable`, `PATCH /users/:id/disable` |
| Organizations | `GET/POST /organizations`, `GET/PATCH /organizations/:id`, `GET /organizations/sunat/:query` |
| Contacts | `GET/POST /contacts`, `GET/PATCH /contacts/:id`, `GET /contacts/organization/:orgId` |
| Leads | `GET/POST /leads`, `GET/PATCH/DELETE /leads/:id`, `PATCH /leads/:id/status` |
| Activities | `GET/POST /activities`, `GET/PATCH/DELETE /activities/:id`, `PATCH /activities/:id/complete`, `PATCH /activities/:id/cancel` |
| Quotations | `GET/POST /quotations`, `GET/PATCH/DELETE /quotations/:id`, `PATCH /quotations/:id/send`, `PATCH /quotations/:id/accept`, `PATCH /quotations/:id/reject` |

No vuelvas a usar rutas antiguas como `/api/leads/:id/actividades`, `/api/actividades`, `/api/cotizaciones` o `/api/leads`.

## Formato de datos backend

- Backend usa camelCase y enums uppercase: `idLead`, `fechaInicio`, `nombreActividad`, `PENDIENTE`, `EN_PROSPECTO`.
- Frontend usa snake_case y labels en espanol: `id_lead`, `fecha_inicio`, `nombre_actividad`, `Pendiente`, `En prospecto`.
- Todo cruce se hace con mappers, no dentro de componentes.
- Fechas enviadas al backend deben ser ISO 8601 UTC.
- Listas paginadas suelen venir como `{ data, meta }`.
- Soft deletes: leads, activities y quotations se eliminan logicamente y ya no aparecen en listados.

## Mappers obligatorios

No saltes estos mappers:

- `leads.mapper.ts`: `EN_PROSPECTO` <-> `LeadState.Prospecto`, `idOrg` <-> `id_org`, etc.
- `cotizaciones.mapper.ts`: `PENDIENTE/ENVIADA/ACEPTADA/RECHAZADA`, `monto` string backend <-> number frontend.
- `actividades.mapper.ts`: `REUNION/LLAMADA/EMAIL/OTRO`, `PENDIENTE/REALIZADA`, `idLead`, `fechaInicio`, `fechaFin`.

Si agregas un campo backend, actualiza mapper, tipo, servicio y prueba unitaria.

## Reglas de negocio criticas

### Pipeline y cotizaciones

El pipeline tiene cuatro estados:

| LeadState frontend | Backend | Estado de cotizacion coherente |
| --- | --- | --- |
| `En prospecto` | `EN_PROSPECTO` | `PENDIENTE` |
| `Ofertado` | `OFERTADO` | `ENVIADA` |
| `Cierre con venta` | `CIERRE_CON_VENTA` | `ACEPTADA` |
| `Cierre sin venta` | `CIERRE_SIN_VENTA` | `RECHAZADA` |

Reglas:

- Al crear un lead, debe existir una cotizacion inicial coherente con el estado del lead.
- Al mover un lead por drag and drop, la cotizacion principal debe sincronizarse con la columna destino.
- `ACEPTADA` y `RECHAZADA` son terminales en backend. No se pueden modificar por `PATCH /quotations/:id`.
- Para avanzar estados se usan endpoints de lifecycle: `/send`, `/accept`, `/reject`.
- Para volver desde un estado terminal o cambiar a una ruta no permitida por backend, la estrategia actual del frontend es soft-delete de la cotizacion anterior y creacion de una nueva coherente, para mantener una sola cotizacion visible por lead.
- La lista general de cotizaciones debe sincronizarse con leads activos del pipeline; no debe mostrar cotizaciones historicas de leads soft-deleted o no visibles.

### Leads

Contrato de `POST /leads` y `PATCH /leads/:id`:

- Acepta `idOrg`, `servicioInteres`, `idEncargado`, `idContacto`, `comentarios`, `desafioOportunidad`, `notasContacto`, `canalCaptacion`.
- El backend no acepta `fechaCierre`. Si se envia, responde `property fechaCierre should not exist`.
- El frontend conserva `fecha_cierre` como dato local de UI en `localStorage` mediante `leads.service.ts`, porque el backend actual no lo persiste.
- El estado inicial backend siempre es `EN_PROSPECTO`; para otro estado se crea el lead y luego se llama `PATCH /leads/:id/status`.
- No hardcodear responsables: siempre cargar usuarios activos desde `GET /users`.

Filtro basico del pipeline:

- Busqueda comercial.
- Estado.
- Encargado.
- Canal.
- Solo con alerta activa.

No reintroducir filtros de sector, tipo de organizacion, tamano o fecha de creacion en pipeline si el backend de leads no los soporta.

### Actividades

Contrato de `POST /activities`:

- Body: `idLead`, `nombreActividad`, `fechaInicio`, `fechaFin`, `tipo`, `idResponsable`, `notas`.
- `fechaInicio` debe ser estrictamente anterior a `fechaFin`.
- La UI actual muestra un solo campo `Fecha`; internamente genera `fechaFin` una hora despues.
- El estado inicial backend siempre es `PENDIENTE`.
- Solo puede existir una actividad `PENDIENTE` por lead. Un segundo intento devuelve `409 Conflict`.
- Estados backend: `PENDIENTE`, `REALIZADA`, `CANCELADA`.
- Frontend mapea `REALIZADA` a `EstadoActividad.Completada`.
- Completar usa `PATCH /activities/:id/complete`; cancelar usa `PATCH /activities/:id/cancel`.
- No usar responsables hardcodeados; cargar `GET /users`.

### Cotizaciones

Contrato de `POST /quotations`:

- Body: `fechaCot`, `dirigido`, `nombreServicio`, `monto` como string decimal, `tipo`, `idLead`, `idRemitente`, opcionales `cliente`, `producto`, `observacion`, `linkPropuesta`.
- Nuevas cotizaciones inician en `PENDIENTE`; para enviar/aceptar/rechazar usar lifecycle.
- `PATCH /quotations/:id` no permite cambiar `estado`, `idLead` ni `idRemitente`.
- Backend no permite modificar cotizaciones terminales `ACEPTADA` o `RECHAZADA`.
- `DELETE /quotations/:id` es soft delete.

### Contactos y organizaciones

- Lead requiere organizacion existente.
- Si se envia `idContacto`, debe pertenecer a la organizacion del lead y tener email vigente.
- Organizaciones usan UUID como ID.
- SUNAT se consulta desde backend con `/organizations/sunat/:query`; el frontend no debe hacer scraping.

## Errores recurrentes y causa probable

| Mensaje | Causa probable | Solucion |
| --- | --- | --- |
| `Cannot POST /api/leads/:id/actividades` | Ruta antigua | Usar `POST /activities` |
| `Cannot GET /api/cotizaciones...` | Ruta antigua | Usar `GET /quotations` |
| `property fechaCierre should not exist` | Campo no soportado por backend | No enviar `fechaCierre` |
| `Responsable con id X no encontrado` | Responsable hardcodeado o ID inexistente | Cargar usuarios reales con `GET /users` |
| `Solo se puede aceptar una cotizacion...` | Se intento lifecycle incompatible | Respetar lifecycle o recrear cotizacion coherente |
| Cotizaciones de mas en listado | Listado no cruzado con leads activos | Filtrar contra pipeline activo |

## Convenciones de desarrollo

- No hacer `fetch`/`axios` directo en componentes.
- No hardcodear endpoints, responsables, IDs de usuarios ni datos operativos.
- No mandar campos que el backend no documenta.
- Mantener pruebas de mappers cuando cambie un contrato.
- Al tocar drag and drop, verificar coherencia lead-cotizacion.
- Al tocar creacion/edicion de leads, verificar cotizacion automatica.
- Al tocar actividades, verificar regla de una pendiente por lead y usuarios reales.
- Al tocar cotizaciones, verificar lifecycle y terminales.
- Usar `rg` para busquedas.
- Usar `apply_patch` para editar archivos.

## Verificaciones recomendadas

Para cambios de mappers/servicios:

```bash
npx tsc --noEmit
npx eslint <archivos>
npm test -- --runInBand <test-especifico>
```

Pruebas unitarias existentes utiles:

- `test/unit/modules/leads/leads.mapper.spec.ts`
- `test/unit/modules/cotizaciones/cotizaciones.mapper.spec.ts`
- `test/unit/modules/actividades/actividades.mapper.spec.ts`

## Variables de entorno

```bash
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=BioActiva CRM
```

`NEXT_PUBLIC_USE_MOCK=true` solo para mocks. En integracion real, los servicios deben funcionar con `false`.
