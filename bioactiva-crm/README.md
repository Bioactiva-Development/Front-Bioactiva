# BioActiva CRM Frontend

Frontend web para el CRM comercial de BioActiva. La aplicacion gestiona pipeline de leads, actividades de seguimiento, cotizaciones, organizaciones y contactos, conectandose al backend documentado en Mintlify.

## Documentacion vigente

Usa estas fuentes antes de analizar o modificar integraciones:

- Backend actual: https://bioactiva.mintlify.app/introduction
- Indice para agentes: https://bioactiva.mintlify.app/llms.txt
- Leads: https://bioactiva.mintlify.app/api/leads/overview
- Cotizaciones: https://bioactiva.mintlify.app/api/quotations/overview
- Ciclo de vida de cotizaciones: https://bioactiva.mintlify.app/api/quotations/lifecycle
- Actividades: https://bioactiva.mintlify.app/api/activities/overview
- Usuarios: https://bioactiva.mintlify.app/api/users/list
- Organizaciones: https://bioactiva.mintlify.app/api/organizations/overview
- Contactos: https://bioactiva.mintlify.app/api/contacts/overview

Si hay conflicto entre mocks, comentarios antiguos, documentos locales o supuestos previos y Mintlify, prioriza Mintlify. El backend es estricto: si se envia una propiedad no documentada, puede responder errores como `property <campo> should not exist`.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Axios
- Zustand
- Zod

## Inicio rapido

```bash
npm install
npm run dev
```

Variables recomendadas:

```bash
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=BioActiva CRM
```

Usa `NEXT_PUBLIC_USE_MOCK=true` solo para escenarios mock. Para integracion real, los servicios deben funcionar con `NEXT_PUBLIC_USE_MOCK=false`.

## Arquitectura

El frontend debe mantener esta direccion de dependencias:

```text
pages/components -> hooks -> services -> api client/endpoints
                         -> mappers -> types
```

Reglas practicas:

- Los componentes no deben hacer `fetch` ni `axios` directo.
- Las URLs viven en `src/services/api/endpoints.ts`.
- Los servicios por dominio viven en `src/services/modules/*.service.ts`.
- Los mappers por dominio viven en `src/services/modules/*.mapper.ts`.
- Los tipos compartidos viven en `src/types`.
- Los validadores viven en `src/lib/validators`.

## Contrato backend actual

Los modulos principales usan rutas REST en ingles, sin prefijo `/api`:

| Dominio | Endpoints principales |
| --- | --- |
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh` |
| Users | `GET /users`, `PATCH /users/:id/enable`, `PATCH /users/:id/disable` |
| Organizations | `GET/POST /organizations`, `GET/PATCH /organizations/:id`, `GET /organizations/sunat/:query` |
| Contacts | `GET/POST /contacts`, `GET/PATCH /contacts/:id`; filtrar por organizacion con `GET /contacts?idOrganization=<id>` |
| Leads | `GET/POST /leads`, `GET/PATCH/DELETE /leads/:id`, `PATCH /leads/:id/status` |
| Activities | `GET/POST /activities`, `GET/PATCH/DELETE /activities/:id`, `PATCH /activities/:id/complete`, `PATCH /activities/:id/cancel` |
| Quotations | `GET/POST /quotations`, `GET/PATCH/DELETE /quotations/:id`, `PATCH /quotations/:id/send`, `PATCH /quotations/:id/accept`, `PATCH /quotations/:id/reject` |

No uses rutas antiguas como `/api/leads`, `/api/leads/:id/actividades`, `/api/actividades` o `/api/cotizaciones`.

## Formato de datos

El backend usa camelCase y enums uppercase:

- `idLead`, `idOrg`, `fechaInicio`, `fechaFin`, `nombreActividad`.
- `EN_PROSPECTO`, `OFERTADO`, `CIERRE_CON_VENTA`, `CIERRE_SIN_VENTA`.
- `PENDIENTE`, `ENVIADA`, `ACEPTADA`, `RECHAZADA`.

El frontend usa snake_case y labels en espanol:

- `id_lead`, `id_org`, `fecha_inicio`, `fecha_fin`, `nombre_actividad`.
- `En prospecto`, `Ofertado`, `Cierre con venta`, `Cierre sin venta`.

La conversion debe ocurrir en mappers, nunca dentro de componentes.

## Logica de negocio clave

### Pipeline y cotizaciones

El documento de analisis y diseno define que todo lead nuevo inicia en `En prospecto`. El estado no se edita en el formulario de creacion ni en el formulario de edicion; el avance se gestiona desde el pipeline o desde acciones de detalle.

Relaciones validas entre lead y cotizacion:

| Estado del lead | Estado backend | Cotizacion asociada |
| --- | --- | --- |
| En prospecto | `EN_PROSPECTO` | No exige cotizacion |
| Ofertado | `OFERTADO` | `ENVIADA` |
| Cierre con venta | `CIERRE_CON_VENTA` | `ACEPTADA` |
| Cierre sin venta | `CIERRE_SIN_VENTA` | `RECHAZADA` |

Reglas implementadas:

- `Prospecto -> Ofertado` requiere una cotizacion asociada `PENDIENTE` o `ENVIADA`. Si esta `PENDIENTE`, se usa `PATCH /quotations/:id/send`.
- `Prospecto -> Cierre con venta` y `Prospecto -> Cierre sin venta` estan bloqueados. Primero debe existir una propuesta formal en `Ofertado`.
- `Ofertado -> Cierre con venta` usa `PATCH /quotations/:id/accept`.
- `Ofertado -> Cierre sin venta` usa `PATCH /quotations/:id/reject`.
- `Cierre con venta` y `Cierre sin venta` son estados finales. No se puede mover un lead desde un cierre.
- No se permite regresar un lead avanzado a `En prospecto`.
- El frontend no crea cotizaciones fantasma al mover tarjetas. La cotizacion debe ser una propuesta real creada desde el modulo de cotizaciones.
- Los botones `+` por columna fueron eliminados. La creacion de leads se hace solo con `+ Nuevo Lead`.

### Leads

`POST /leads` y `PATCH /leads/:id` aceptan campos como:

- `idOrg`
- `idContacto`
- `servicioInteres`
- `idEncargado`
- `comentarios`
- `desafioOportunidad`
- `notasContacto`
- `canalCaptacion`

El backend actual no acepta `fechaCierre`. El frontend mantiene la fecha de cierre estimada como dato local de UI (`fecha_cierre`) mediante `leads.service.ts`, porque el backend no la persiste todavia. No envies `fechaCierre` al backend.

El estado inicial del backend es `EN_PROSPECTO`. En la UI el lead nuevo siempre se envia como `En prospecto`; no se acepta seleccionar otro estado al crear.

### Actividades

Las actividades se crean con `POST /activities`, no con rutas anidadas bajo leads.

El formulario muestra un solo campo `Fecha`, pero el backend exige:

- `fechaInicio`
- `fechaFin`
- `fechaInicio` estrictamente anterior a `fechaFin`

La implementacion actual genera `fechaFin` una hora despues de la fecha seleccionada. Solo puede existir una actividad `PENDIENTE` por lead. Los responsables deben cargarse desde `GET /users`; no hardcodear IDs.

### Cotizaciones

Las cotizaciones se crean con `POST /quotations`. El monto se envia como string decimal en `monto`. El estado no se cambia con `PATCH /quotations/:id`; se cambia con:

- `PATCH /quotations/:id/send`
- `PATCH /quotations/:id/accept`
- `PATCH /quotations/:id/reject`

`DELETE /quotations/:id` es soft delete.

Detalles importantes del contrato:

- `idRemitente` debe ser el ID de un usuario real existente. No hardcodear remitentes; cargarlos desde `GET /users`.
- No enviar `nombreRemitente` en el request. El backend lo deriva automaticamente de `idRemitente` como snapshot al crear la cotizacion.
- `PATCH /quotations/:id` no permite modificar `estado`, `idLead` ni `idRemitente`.
- Las cotizaciones nuevas inician en `PENDIENTE`.
- En la lista de cotizaciones los filtros se ordenan: `Todas`, `Pendiente`, `Enviada`, `Aceptada`, `Rechazada`.
- El KPI de rechazos muestra el numero de cotizaciones `RECHAZADA`. Las rechazadas usan patron visual rojo.

### Contactos y organizaciones

- `GET /contacts` devuelve respuesta paginada `{ data, meta }`. El frontend debe soportar ese formato y filtrar por organizacion con `idOrganization`.
- Los contactos usan `estado_correo`/estado de correo segun backend; no asumir datos mock como fuente final.
- En organizaciones, `codigoCliente` es requerido al crear, maximo 20 caracteres y unico. No es un ID autogenerado por backend; puede ser ingresado por el usuario o por logica interna del frontend.
- La validacion SUNAT se consume desde el backend; no hacer scraping desde el frontend.

### Filtros del pipeline

El filtro basico del pipeline debe limitarse a:

- Busqueda comercial
- Estado
- Encargado
- Canal
- Solo con alerta activa

No reintroducir filtros de sector, tipo de organizacion, tamano o fecha de creacion en el pipeline si el backend de leads no los soporta directamente.

## Errores comunes de integracion

| Mensaje | Causa probable | Correccion |
| --- | --- | --- |
| `Cannot POST /api/leads/:id/actividades` | Ruta antigua | Usar `POST /activities` |
| `Cannot GET /api/cotizaciones...` | Ruta antigua | Usar `GET /quotations` |
| `property fechaCierre should not exist` | Campo no soportado | No enviar `fechaCierre` |
| `Responsable con id X no encontrado` | ID hardcodeado o usuario inexistente | Cargar usuarios reales con `GET /users` |
| `Remitente con id X no encontrado` | Remitente hardcodeado o usuario inexistente | Cargar remitentes reales con `GET /users` y enviar `idRemitente` valido |
| Cotizaciones duplicadas o historicas visibles | Listado no sincronizado con leads activos | Filtrar contra pipeline activo y soft deletes |

## Archivos importantes

- `src/services/api/client.ts`
- `src/services/api/endpoints.ts`
- `src/services/modules/leads.service.ts`
- `src/services/modules/leads.mapper.ts`
- `src/services/modules/cotizaciones.service.ts`
- `src/services/modules/cotizaciones.mapper.ts`
- `src/services/modules/actividades.service.ts`
- `src/services/modules/actividades.mapper.ts`
- `src/hooks/pipeline/useLeads.ts`
- `src/components/modules/pipeline/LeadFiltros.tsx`
- `src/components/modules/pipeline/LeadForm.tsx`
- `src/components/modules/pipeline/ActividadForm.tsx`
- `src/components/modules/cotizaciones/CotizacionForm.tsx`
- `src/components/modules/cotizaciones/CotizacionFiltros.tsx`
- `src/components/modules/cotizaciones/CotizacionCard.tsx`

## Verificacion

Para cambios de codigo, ejecuta verificaciones focalizadas:

```bash
npx tsc --noEmit
npx eslint <archivos-modificados>
npm test -- --runInBand <test-relevante>
```

Pruebas unitarias utiles:

- `test/unit/modules/leads/leads.mapper.spec.ts`
- `test/unit/modules/cotizaciones/cotizaciones.mapper.spec.ts`
- `test/unit/modules/actividades/actividades.mapper.spec.ts`

## Guias para agentes

Los agentes deben leer:

- `AGENTS.md`: guia operativa completa.
- `CLAUDE.md`: recordatorio especifico para Claude.

Estos archivos resumen la logica de negocio, el contrato backend actual y los errores recurrentes del proyecto.
