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
  - En prospecto -> PENDIENTE.
  - Ofertado -> ENVIADA.
  - Cierre con venta -> ACEPTADA.
  - Cierre sin venta -> RECHAZADA.
- Las cotizaciones `ACEPTADA` y `RECHAZADA` son terminales en backend.
- Actividades se crean con `POST /activities`, no con rutas anidadas bajo leads.
- El formulario de actividades muestra una sola fecha, pero backend exige `fechaInicio < fechaFin`.
- El backend actual no persiste `fechaCierre` en leads; no enviar `fechaCierre`.

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

## Verificacion minima

Ejecuta verificaciones focalizadas segun el cambio:

```bash
npx tsc --noEmit
npx eslint <archivos-modificados>
npm test -- --runInBand <test-relevante>
```
