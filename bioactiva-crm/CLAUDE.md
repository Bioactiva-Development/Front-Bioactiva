# Claude - BioActiva CRM

Antes de analizar o modificar este proyecto, lee `AGENTS.md`. Ese archivo contiene el contrato operativo completo para agentes.

## Reglas que no debes olvidar

- La documentacion backend vigente esta en https://bioactiva.mintlify.app/introduction y su indice para agentes en https://bioactiva.mintlify.app/llms.txt.
- Prioriza Mintlify sobre mocks, comentarios antiguos o suposiciones.
- No uses rutas antiguas con `/api` para leads, activities o quotations.
- No envies campos no documentados; el backend rechaza propiedades desconocidas.
- Usa servicios y mappers. No hagas llamadas HTTP directas desde componentes.
- No hardcodees responsables, IDs de usuarios ni endpoints.
- Mantener coherencia pipeline-cotizacion es obligatorio:
  - Lead nuevo siempre inicia en `En prospecto`.
  - En prospecto no exige cotizacion.
  - Ofertado requiere cotizacion real `PENDIENTE` o `ENVIADA`; si esta pendiente, usar `/send`.
  - Cierre con venta usa cotizacion `ACEPTADA` via `/accept`.
  - Cierre sin venta usa cotizacion `RECHAZADA` via `/reject`.
  - No crear cotizaciones automaticas o fantasma al mover leads.
- Las cotizaciones `ACEPTADA` y `RECHAZADA` son terminales en backend.
- Los cierres del pipeline son finales y no se puede volver a `En prospecto`.
- El estado del lead no se edita desde los formularios de creacion/edicion.
- La creacion de leads se hace solo con `+ Nuevo Lead`; no reintroduzcas botones `+` por columna.
- En cotizaciones, `idRemitente` debe venir de usuarios reales (`GET /users`). No hardcodear remitentes.
- No envies `nombreRemitente`; el backend lo captura automaticamente desde `idRemitente`.
- En la pagina de cotizaciones, los filtros van `Todas | Pendiente | Enviada | Aceptada | Rechazada`, y el KPI final es `Rechazadas` con color rojo.
- Actividades se crean con `POST /activities`, no con rutas anidadas bajo leads.
- El formulario de actividades muestra una sola fecha, pero backend exige `fechaInicio < fechaFin`.
- El backend actual no persiste `fechaCierre` en leads; no enviar `fechaCierre`.
- `GET /contacts` responde `{ data, meta }`; filtra por organizacion con `idOrganization`.
- En organizaciones, `codigoCliente` es requerido, unico y no autogenerado por backend.

## Archivos clave

- `src/services/api/endpoints.ts`
- `src/services/api/client.ts`
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

## Verificacion minima

Ejecuta verificaciones focalizadas segun el cambio:

```bash
npx tsc --noEmit
npx eslint <archivos-modificados>
npm test -- --runInBand <test-relevante>
```
