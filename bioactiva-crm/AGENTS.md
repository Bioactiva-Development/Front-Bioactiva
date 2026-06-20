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
| Contacts | `GET/POST /contacts`, `GET/PATCH /contacts/:id`; filtrar por organizacion con `GET /contacts?idOrganization=<id>` |
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

El pipeline tiene cuatro estados definidos por el documento de analisis y diseno. Todo lead nuevo inicia en `En prospecto`; el estado no se edita desde los formularios de creacion/edicion.

| LeadState frontend | Backend | Cotizacion requerida |
| --- | --- | --- |
| `En prospecto` | `EN_PROSPECTO` | No requerida |
| `Ofertado` | `OFERTADO` | `ENVIADA` |
| `Cierre con venta` | `CIERRE_CON_VENTA` | `ACEPTADA` |
| `Cierre sin venta` | `CIERRE_SIN_VENTA` | `RECHAZADA` |

Reglas:

- Al crear un lead, no crear cotizaciones automaticamente.
- La creacion de leads se hace solo desde `+ Nuevo Lead`; no reintroducir botones `+` por columna.
- `Prospecto -> Ofertado` requiere una cotizacion asociada `PENDIENTE` o `ENVIADA`; si esta `PENDIENTE`, enviar con `PATCH /quotations/:id/send`.
- `Prospecto -> Cierre con venta` y `Prospecto -> Cierre sin venta` estan bloqueados. Primero debe existir propuesta formal en `Ofertado`.
- `Ofertado -> Cierre con venta` acepta la cotizacion con `PATCH /quotations/:id/accept`.
- `Ofertado -> Cierre sin venta` rechaza la cotizacion con `PATCH /quotations/:id/reject`.
- `Cierre con venta` y `Cierre sin venta` YA NO son finales: pueden volver a `Ofertado` o pasar al otro cierre. Transiciones validas del backend (`PATCH /leads/:id/status`):
  - `En prospecto -> Ofertado`.
  - `Ofertado -> Cierre con venta | Cierre sin venta`.
  - `Cierre con venta -> Ofertado | Cierre sin venta`.
  - `Cierre sin venta -> Ofertado | Cierre con venta`.
- Entre estados de cierre la cotizacion ya es terminal (`ACEPTADA`/`RECHAZADA`) y no se re-transiciona: solo se cambia el estado del lead con `PATCH /leads/:id/status`.
- Al pasar a `Ofertado` desde cualquier estado, el backend crea un borrador de cotizacion solo si el lead no tiene una.
- No se permite regresar un lead a `En prospecto` una vez que avanzo. Reenviar el mismo estado es un no-op valido.
- Al mover un lead por drag and drop, no crear cotizaciones fantasma. Usar solo cotizaciones reales asociadas al lead.
- `ACEPTADA` y `RECHAZADA` son terminales en backend. No se pueden modificar por `PATCH /quotations/:id`.
- Para avanzar estados se usan endpoints de lifecycle: `/send`, `/accept`, `/reject`.
- La lista general de cotizaciones debe sincronizarse con leads activos del pipeline; no debe mostrar cotizaciones historicas de leads soft-deleted o no visibles.

### Leads

Contrato de `POST /leads` y `PATCH /leads/:id`:

- Acepta `idOrg`, `servicioInteres`, `idEncargado`, `idContacto`, `comentarios`, `desafioOportunidad`, `notasContacto`, `canalCaptacion`.
- El backend no acepta `fechaCierre`. Si se envia, responde `property fechaCierre should not exist`.
- El frontend conserva `fecha_cierre` como dato local de UI en `localStorage` mediante `leads.service.ts`, porque el backend actual no lo persiste.
- El estado inicial backend siempre es `EN_PROSPECTO`; la UI crea leads siempre en `En prospecto`.
- No hardcodear responsables: siempre cargar usuarios activos desde `GET /users`.

Filtros del pipeline (server-side, soportados por `GET /leads`):

- Buscador de organizacion: el campo de busqueda es un selector que mapea la organizacion elegida a `idOrg`. No es busqueda libre por texto.
- Estado (`estado`).
- Encargado (`idEncargado`).
- Sector (`sector`): el backend de leads ya soporta filtrar por el sector de la organizacion vinculada. Se envia el valor del enum `Sector` (ej. `TECNOLOGIA`).
- Rango de fechas de creacion (`fechaDesde`, `fechaHasta`, con `fechaHasta >= fechaDesde`).
- Semaforo de actividades (`alertaActividad`), ver abajo.

El semaforo del lead esta atado al campo backend `activityAlert` y al filtro `alertaActividad`. Ambos usan el mismo enum, de menor a mayor severidad: `SIN_ACTIVIDADES` < `PENDIENTE` < `EN_RIESGO` < `POR_VENCER`. Omitir el filtro trae todos los leads; valores invalidos devuelven 400. No usar los valores antiguos `VERDE/AMARILLO/ROJO` ni `TODAS/VENCIDAS`.

No reintroducir filtros de tipo de organizacion o tamano en pipeline si el backend de leads no los soporta.

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

- Body de creación: `fechaCot`, `nombreServicio`, `monto` como string decimal, `tipo`, `idLead`, `idRemitente`, opcionales `producto`, `observacion`, `linkPropuesta`.
- NO enviar en la creación `dirigido` (lo deriva del contacto del lead), `cliente` (lo deriva de la organización) ni `nombreRemitente` (snapshot automático). `idAuthor` lo toma del JWT.
- Nuevas cotizaciones inician en `PENDIENTE`; para enviar/aceptar/rechazar usar lifecycle.
- `PATCH /quotations/:id` no permite cambiar `estado`, `idLead` ni `idRemitente`; sí permite override de `dirigido` y `cliente`.
- Backend no permite modificar cotizaciones terminales `ACEPTADA` o `RECHAZADA`.
- `DELETE /quotations/:id` es soft delete.
- `idRemitente` debe pertenecer a un usuario real del backend. Cargar remitentes desde `GET /users`; no hardcodear `Luis Torres`, `Administracion` u otros IDs.
- No enviar `nombreRemitente`; el backend lo captura automaticamente como snapshot desde `idRemitente`.
- En edicion, mantener fijo `idRemitente`.
- La pagina de cotizaciones ordena filtros como `Todas`, `Pendiente`, `Enviada`, `Aceptada`, `Rechazada`.
- El KPI de la cuarta tarjeta es `Rechazadas`, no conversion, y las cotizaciones rechazadas usan color rojo.

### Contactos y organizaciones

- Lead requiere organizacion existente.
- Si se envia `idContacto`, debe pertenecer a la organizacion del lead y tener email vigente.
- `GET /contacts` devuelve `{ data, meta }`; filtrar por organizacion con `idOrganization`.
- Organizaciones usan `codigoCliente` requerido, maximo 20 caracteres y unico. No es autogenerado por backend.
- SUNAT se consulta desde backend con `/organizations/sunat/:query`; el frontend no debe hacer scraping.

## Errores recurrentes y causa probable

| Mensaje | Causa probable | Solucion |
| --- | --- | --- |
| `Cannot POST /api/leads/:id/actividades` | Ruta antigua | Usar `POST /activities` |
| `Cannot GET /api/cotizaciones...` | Ruta antigua | Usar `GET /quotations` |
| `property fechaCierre should not exist` | Campo no soportado por backend | No enviar `fechaCierre` |
| `Responsable con id X no encontrado` | Responsable hardcodeado o ID inexistente | Cargar usuarios reales con `GET /users` |
| `Remitente con id X no encontrado` | Remitente hardcodeado o ID inexistente | Cargar remitentes reales con `GET /users` |
| `Solo se puede aceptar una cotizacion...` | Se intento lifecycle incompatible | Respetar lifecycle y bloquear transiciones no permitidas |
| Cotizaciones de mas en listado | Listado no cruzado con leads activos | Filtrar contra pipeline activo |

## Convenciones de desarrollo

- No hacer `fetch`/`axios` directo en componentes.
- No hardcodear endpoints, responsables, IDs de usuarios ni datos operativos.
- No mandar campos que el backend no documenta.
- Mantener pruebas de mappers cuando cambie un contrato.
- Al tocar drag and drop, verificar coherencia lead-cotizacion.
- Al tocar creacion/edicion de leads, verificar que el lead nuevo siempre inicie en prospecto y que el estado no sea editable en formularios.
- Al tocar actividades, verificar regla de una pendiente por lead y usuarios reales.
- Al tocar cotizaciones, verificar lifecycle, terminales, remitentes reales y patron rojo para rechazadas.
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
