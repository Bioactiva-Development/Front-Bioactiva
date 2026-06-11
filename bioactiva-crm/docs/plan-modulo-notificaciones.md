# Plan de implementación — Módulo de Notificaciones

> Documento de traspaso entre sesiones. Última actualización: 2026-06-10.
> Contrato verificado contra Mintlify (leído literalmente de las 3 páginas):
> - https://bioactiva.mintlify.app/api/notifications/overview
> - https://bioactiva.mintlify.app/api/notifications/templates
> - https://bioactiva.mintlify.app/api/notifications/in-app

## Contrato backend (resumen verificado)

### Programadas (correos)
- `POST /notifications/reminders` — body: `{ idActividad, fechaEnvio (ISO), idTemplate, asunto, cuerpo }`. **No recibe idLead** (se deriva de la actividad).
- `POST /notifications/follow-ups` — body anidado: `{ idActividad, internal: { fechaEnvio, idTemplate, asunto, cuerpo }, external: { correoCliente, fechaEnvio, idTemplate, asunto, cuerpo } }`.
- `GET /notifications?estado=PROGRAMADA|VENCIDA&idLead=&idResponsable=`.
- `DELETE /notifications/:id` — cancela; 409 si ya está VENCIDA. Las canceladas desaparecen para siempre.
- Respuesta: `{ id, tipo: RECORDATORIO|SEGUIMIENTO, estado: PROGRAMADA|VENCIDA, idActividad, idLead, idResponsable, asuntoInterno, fechaEnvioInterno, enviadoInterno, correoCliente, asuntoExterno, fechaEnvioExterno, enviadoExterno, createdAt }`.

### Reglas de negocio del backend
- **1 notificación PROGRAMADA por actividad** → segundo intento = 409.
- `fechaEnvio` debe ser futura y anterior al fin de la actividad; fuera de 09:00–18:00 se reagenda automáticamente a las 09:00 del mismo día.
- `external.fechaEnvio` > `internal.fechaEnvio` (400 si no).
- `external.correoCliente` **debe pertenecer al contacto del lead** (400 si no).
- Si el responsable completa la actividad antes del envío externo, el correo al cliente se cancela automáticamente (lo hace el backend).

### In-app (campanita)
- `GET /notifications/in-app` → `{ id, titulo, mensaje, estado: NO_LEIDA|LEIDA, idLead, idActividad, createdAt }` (del usuario autenticado, más reciente primero).
- `PATCH /notifications/in-app/:id/read` — 409 si ya está LEIDA.
- **No existe endpoint read-all** ni endpoint "centro" — se componen en cliente.
- Alerta automática diaria a las 09:00 para leads abiertos con 30+ días sin cambio de estado (destinatario: responsable del lead).

### Plantillas
- `/templates` CRUD completo (PATCH para desactivar, DELETE 409 si está asociada a una notificación).
- `GET /notifications/templates` — selector de solo-activas para los formularios.
- El asunto/cuerpo se **copia** a la notificación al programar; editar la copia no muta la plantilla.

## Estado de las fases

| Fase | Estado | Detalle |
|---|---|---|
| 1. Contrato | ✅ HECHA | endpoints + mapper + tipos + service + mocks alineados. `tsc --noEmit` verde en `src/` (errores preexistentes solo en `test/unit/.../lead-flow.utils.spec.ts` y `usuarios.service.spec.ts`, ajenos). **eslint quedó pendiente de correr** por caída del harness. |
| 2. Servicio real | ⬜ | Probar contra backend real (USE_MOCK off), revisar `retry: false` en hooks, manejar 409 con mensajes del servidor. |
| 3. Fix sincronización | ⬜ | **BUG confirmado**: `SeguimientoForm.tsx` precarga `correo_cliente` con `selectedLead.encargado_correo` (correo del encargado). El contrato exige el correo del **contacto** del lead (400 si no) → resolver `lead.id_contacto` → `contactosService.getById()` → selector correo principal/secundario (CU007 paso 50). Además: filtrar actividades completadas en selects de ambos forms; invalidar `['notificaciones']` al completar/cancelar actividad en `useActividades`; dejar de enviar `id_lead`/decoraciones desde los forms (el mapper ya las filtra). |
| 4. UX CU007 | ⬜ | Confirmación al cancelar; anti-duplicados preventivo (deshabilitar form si la actividad ya tiene PROGRAMADA + botón "ver notificación"); validar fecha recordatorio (> ahora, < fecha_fin actividad) en `notificacion.schema.ts`; tabs explícitas Programadas/Vencidas. |
| 5. Campanita | ⬜ | `NotificationBell` en layout dashboard usando `useCentroNotificaciones` (`sinLeer` como badge) + deep-link al lead (`ROUTES.lead`). Hay un `NotificacionDropdown` estático en `NotificacionItem.tsx` para reemplazar con data real. |
| 6. Calendario MS | ⬜ | Sección solo con integración activa; solo actividades tipo Reunión; "Crear evento Teams"; si `outlook_event_id` existe → "La reunión ya fue creada". |

## Archivos clave del módulo
- `src/services/api/endpoints.ts` (bloque `notificaciones`)
- `src/services/modules/notificaciones.mapper.ts` (DTOs + mappers, NUEVO en fase 1)
- `src/services/modules/notificaciones.service.ts`
- `src/services/mock/notificaciones.mock.ts`
- `src/types/notificacion.types.ts` (+ `EstadoNotif` en `src/types/enums.ts` → `NO_LEIDA`/`LEIDA`)
- `src/hooks/notificaciones/useNotificaciones.ts`
- `src/components/modules/notificaciones/{RecordatorioForm,SeguimientoForm,NotificacionItem,NotificacionFiltros}.tsx`
- `src/app/(dashboard)/notificaciones/page.tsx`
- `src/components/modules/pipeline/LeadDetalle.tsx` (historial usa programadas)

## Pendientes / acuerdos
- Correr `npx eslint` sobre los archivos de la fase 1 (quedó bloqueado por el harness).
- Pedir al equipo backend un `PATCH /notifications/in-app/read-all` (hoy "marcar todas" = N PATCHes).
- `marcarTodasLeidas` filtra solo NO_LEIDA para evitar 409.
- El "centro" (`CentroNotificaciones`) es un agregado de UI: programadas PROGRAMADA + bandeja in-app completa; `vencidas` del centro hoy contiene la bandeja in-app (renombrar/reestructurar en fase 4).
