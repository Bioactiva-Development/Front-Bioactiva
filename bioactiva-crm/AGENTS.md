<!-- BEGIN:nextjs-agent-rules -->
# BioActiva CRM — Guía para Agentes IA

> Este archivo define las reglas, estructura, convenciones y contexto completo del proyecto para que cualquier agente IA trabaje de forma coherente, sin duplicar código y respetando los estándares del equipo.
>
> **Fuente oficial de toda decisión funcional y arquitectónica**: `BIOACTIVA-UTEC / Documento de Análisis y Diseño v1.6` (132 páginas, 11 CUs, 65 RF, 16 RNF, 14 RN, 13 entidades). Este AGENTS.md es la traducción operativa de ese documento para el frontend.

---

## 1. Contexto del Proyecto

**BioActiva** es una empresa peruana especializada en gestión de innovación, I+D+i, formulación de proyectos, vigilancia tecnológica y propiedad intelectual. Este CRM centraliza su operación comercial reemplazando hojas de Excel manuales.

### Problema que resuelve
- Duplicidad de datos en Excel
- Pérdida de seguimiento de oportunidades comerciales
- Falta de visibilidad del proceso comercial
- Dificultad para validar organizaciones

### Objetivo
Plataforma web CRM que gestione el ciclo comercial completo: desde la identificación de un prospecto hasta el cierre, con notificaciones, dashboards e importación/exportación de datos.

### Prototipo desplegado
<https://a-frontend-bioactiva-73nc.vercel.app/>

---

## 2. Stack Tecnológico

### Frontend (este repo)

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 |
| Estado global | Zustand 5 |
| Server state / caché | React Query (TanStack Query v5) |
| Validación | Zod + React Hook Form |
| Iconos | Lucide React |
| Gráficas | Recharts |
| Drag & Drop (Kanban) | @dnd-kit/core + @dnd-kit/sortable |
| HTTP Client | Axios |
| Runtime | Node.js v24 |

### Backend (otro repo / contenedor)

| Capa | Tecnología |
|---|---|
| Framework | **NestJS** (controladores REST, módulos, servicios) |
| Base de datos | **PostgreSQL** |
| Caché / sesiones | **Redis** |
| Auth | JWT (sesión) + OAuth 2.0 + Azure AD (Microsoft) |
| Integración SUNAT | Web scraping del portal de consultas |
| Integración Microsoft 365 | Microsoft Graph API (Outlook Mail, Outlook Calendar, Teams) |

### Despliegue

Contenerización con Docker. Vista de despliegue (§11.3 del documento oficial) define 4 contenedores comunicados por red interna controlada: **frontend (Next.js)**, **backend (NestJS)**, **postgres**, **redis**.

---

## 3. Roles del Sistema

| Rol | Descripción |
|---|---|
| **Administrador** | Acceso total. Único que puede gestionar usuarios (invitar, deshabilitar, asignar roles). Accede a todos los módulos. |
| **Trabajador** | Usuario operativo. Gestiona organizaciones, contactos, leads, cotizaciones, notificaciones, plantillas, dashboard, importación y exportación. NO accede a control de acceso. |

### Actores externos
- **SUNAT** (sistema externo): consulta automatizada por RUC o razón social para validar y autocompletar datos de organizaciones. Integración por **web scraping** desde el backend.
- **Microsoft 365** (sistema externo): integración opcional. Outlook Mail para envío de correos de seguimiento, Outlook Calendar y Teams para asociar reuniones a actividades. Integración por **Microsoft Graph API + OAuth 2.0 + Azure AD App Registration**.

---

## 4. Módulos y Estado

| Módulo | Ruta | CU | Rol | Estado actual |
|---|---|---|---|---|
| 🔐 Login / Auth | `/login`, `/forgot-password`, `/reset-password`, `/activate` | CU001 | Público | 🚧 UI completa + middleware; faltan validaciones de dominio institucional y mensajes específicos |
| 👥 Control de Acceso | `/control-acceso` | CU002 | Solo Administrador | 🚧 Página existe; `InvitarUsuarioForm.tsx` y `UsuarioItem.tsx` vacíos |
| 🏢 Organizaciones | `/organizaciones`, `/organizaciones/[id]` | CU003 | Ambos | 🚧 CRUD funcional; falta integración SUNAT (RF-0005) y redirección a Contactos con filtro cuando >6 contactos (RF-0044) |
| 👤 Contactos | `/contactos`, `/contactos/[id]` | CU004 | Ambos | 🚧 CRUD funcional; falta campo `estado` (Vigente/Vencido) requerido por RF-0065 |
| 📊 Pipeline / Leads | `/pipeline`, `/pipeline/[id]` | CU005 | Ambos | 🚧 Kanban con DnD; verificar RN-008 (bloqueo nueva actividad si anterior Pendiente) y RF-0065 |
| 💰 Cotizaciones | `/cotizaciones`, `/cotizaciones/[id]` | CU006 | Ambos | 🚧 CRUD con autocompletado desde lead; verificar RN-007 (automatización cierre del lead) y RF-0015 (monto = 0 permitido) |
| 🔔 Notificaciones | `/notificaciones` | CU007 | Ambos | 🚧 Listado y forms básicos; **falta motor de secuencias** (entidades `SECUENCIAS_SEGUIMIENTO`, `PASOS_SEGUIMIENTO`, `RECORDATORIOS_ACTIVIDAD`), alerta automática 30 días sin avance (RF-0027), cancelación en cascada (RF-0051) |
| 📈 Dashboard | `/dashboard` | CU008 | Ambos | 🚧 UI con 8 KPIs y filtro de periodo; **datos hardcodeados** en la página; falta filtro `TipoServicio` (RF-0060); archivos auxiliares vacíos (`dashboard.service.ts`, `dashboard.types.ts`, `dashboard.mock.ts`, `useDashboard.ts`, `KpiCard.tsx`, `DashboardFiltros.tsx`, `ConversionChart.tsx`, `PipelineChart.tsx`) |
| 📥 Importar / Exportar | `/datos` | CU009, CU010 | Ambos | 🚧 Páginas existen; verificar flujo de 3 etapas (subir → preview/conflictos → confirmar) y filtros específicos por entidad |
| 📧 Plantillas de Correo | `/plantillas` | CU011 | Ambos | 🚧 CRUD básico; falta campo `categoria` (CU011 paso 5d) y regla "desactivar si está en uso" |
| 🔌 Integración Microsoft | (interno) | RF-0029 | Ambos | ❌ No implementado |
| 🔌 Integración SUNAT | (interno, vía Organizaciones) | RF-0005 | Ambos | ❌ No implementado |

**Estados**: ⏳ PENDIENTE | 🚧 EN PROGRESO | ✅ LISTO | ❌ NO IMPLEMENTADO

---

## 5. Descripción Detallada de Módulos

### CU001 — Autenticación
- Login con correo y contraseña
- Generación de JWT al autenticar
- Recuperación de contraseña por correo (token con expiración)
- Activación de cuenta por enlace (token de activación)
- Validaciones: correo válido, usuario habilitado, contraseña hash
- Mensajes de error específicos: "Correo o contraseña incorrectos", "Usuario deshabilitado. Contacte al administrador", "Ingrese un correo válido", "El enlace de recuperación ha expirado", "Las contraseñas no coinciden"

### CU002 — Gestión de Usuarios (solo Administrador)
- Invitar usuario por correo institucional con rol asignado
- Validar que el correo pertenezca al **dominio institucional** permitido
- Envío de correo con token de activación
- El usuario invitado define nombre, apellido y contraseña al activar
- Deshabilitar usuarios activos
- Listado y detalle de usuarios registrados

### CU003 — Gestión de Organizaciones
- Registrar, consultar y editar organizaciones
- Identificación única por **RUC (11 dígitos)** o **código interno único** cuando no haya RUC
- **Consulta automatizada a SUNAT por RUC o razón social (web scraping en backend)**
- Autocompletado de campos desde SUNAT
- Si la búsqueda por razón social retorna varios resultados, mostrar los **10 primeros más coincidentes**
- Detalle muestra: info general, contactos asociados, historial de leads, historial de cotizaciones
- Si tiene más de 6 contactos → botón "Ver todos" redirige a `/contactos` con filtro de organización aplicado
- Campos: `nombre`, `nombre_comercial`, `sub_area`, `ruc`, `tipo`, `linkedin`, `ubicacion`, `sector`, `tamaño`, `actividad_economica`, `alianzas_estrategicas`
- No se elimina físicamente (RN-003)

### CU004 — Gestión de Contactos
- Registrar, consultar y editar contactos
- **Vinculación obligatoria a una organización existente** (RN-005)
- Correo principal único en todo el sistema
- Campo `estado` con default `Vigente`; un contacto puede estar `Vencido` y entonces no puede usarse para crear leads (RF-0065)
- Campos: `organizacion`, `vocativo`, `nombres`, `apellidos`, `cargo`, `correo`, `correo2`, `telefono`, `comentarios`, `estado`
- Validar **formato internacional de teléfono**
- No se elimina físicamente (RN-003)

### CU005 — Pipeline de Leads
- Vista Kanban con columnas: **En prospecto | Ofertado | Cierre con venta | Cierre sin venta**
- Drag & drop para cambiar estado entre columnas
- Registro obligatorio de organización (RN-006), opcional de contacto
- Si se selecciona contacto, validar que esté `Vigente` (no `Vencido`)
- Actividades de seguimiento por lead: `Email`, `Reunion`, `Llamada`, `Otro`
- Estados de actividad: `Pendiente`, `Completada`
- **No se puede crear nueva actividad si la anterior está Pendiente** (RN-008 / RF-0039)
- Historial de comentarios por actividad
- Filtros por organización, estado, encargado, servicio
- No se elimina físicamente (RN-003)

### CU006 — Gestión de Cotizaciones
- Vinculada obligatoriamente a un lead
- Autocompletado de cliente, contacto y servicio desde el lead seleccionado
- Estados: `Pendiente`, `Enviada`, `Aceptada`, `Rechazada`
- **Cotización Aceptada → lead pasa a `Cierre con venta` automáticamente** (RN-007 / RF-0037)
- **Cotización Rechazada → lead pasa a `Cierre sin venta` automáticamente** (RN-007 / RF-0038)
- Antes de cerrar: verificar que el lead no tenga actividades `Pendiente`
- **Monto ≥ 0 (cero permitido por RF-0015)**
- Campos: `fecha`, `dirigido`, `cliente`, `producto`, `remitente`, `nombre_servicio`, `monto`, `moneda`, `estado`, `observacion`, `link_propuesta`
- No se elimina físicamente (RN-003)

### CU007 — Gestión de Notificaciones
- Dos configuraciones:
  - **Recordatorio** (interno): correo al responsable en fecha/hora definida
  - **Seguimiento** (interno + externo): correo interno al responsable → si no marca como completado antes de la fecha programada → correo externo al cliente
- Usa plantillas de correo (CU011) con personalización **sin modificar la plantilla original**
- Si el contacto tiene >1 correo, permitir seleccionar cuál usar para el envío externo
- Fecha del correo externo debe ser **posterior** a la del correo interno
- Si el usuario no define hora específica, programar dentro de horario laboral
- Secciones visibles: **Programadas** y **Vencidas**
- **Canceladas**: se eliminan, no se ejecutan, no aparecen en historial
- **Alerta automática si lead supera 30 días sin cambio de estado** (RF-0027)
- **Una sola notificación por actividad** (RF-0061)
- Cambiar fecha/hora/plantilla = cancelar y crear nueva (no reprogramable)
- Cambiar responsable = editar la actividad asociada

### CU008 — Dashboard
- **8 métricas**:
  1. Leads generados
  2. % Propuesta → Cierre con venta
  3. Tiempo promedio de cierre (días)
  4. Tiempo en etapa propuesta (días)
  5. Promedio de acciones de seguimiento por lead
  6. Monto total en pipeline (cotizaciones abiertas en soles)
  7. Ingresos cerrados (suma de cotizaciones de servicios vendidos)
  8. % de leads con más de 30 días sin avance
- **Filtros**: `fecha_inicio`, `fecha_fin`, **`tipo_servicio` (consultoría | formulación de proyecto)** — RF-0060
- Validar `fecha_inicio <= fecha_fin`; si no, mostrar "El rango de fechas no es válido."
- Empty state: "No se encontraron datos para los filtros seleccionados."
- Solo consulta, no modifica datos (RN-010)
- Gráficas con Recharts

### CU009 — Importación de Datos
- Importar desde Excel: **`.xlsx`, `.xls`, `.csv`** (CU009) — nota: RF-0021 dice solo CSV, primar lo de CU009 hasta aclaración
- Flujo en 3 etapas: **Subir archivo → Preview y conflictos → Confirmar**
- Valida estructura, campos obligatorios, duplicados, relaciones
- Muestra preview antes de confirmar
- Registra historial de importación: usuario, fecha, archivo, registros procesados/importados/rechazados

### CU010 — Exportación de Datos
- Exportar organizaciones, contactos, leads o cotizaciones en CSV
- Filtros por tipo de entidad:
  - **Organizaciones**: sector, tamaño, tipo, departamento
  - **Contactos**: organización asociada
  - **Leads**: estado
  - **Cotizaciones**: estado
- No modifica datos

### CU011 — Plantillas de Correo
- Crear, editar, desactivar y eliminar plantillas
- Campos: `nombre` (único), `asunto`, `cuerpo`, `categoria` (opcional), `activo` (bool)
- **Si está en uso en notificaciones**: no se puede eliminar físicamente → solo desactivar
- **Si NO está en uso**: se permite eliminación física (excepción a RN-003 — RN-003 cubre organizaciones, contactos, leads y cotizaciones; plantillas son distintas)
- Las plantillas activas aparecen en el selector de notificaciones
- Editar una plantilla **no afecta correos ya personalizados** en notificaciones existentes

---

## 6. ENUMs del Sistema

**Todos los ENUMs viven en `src/types/enums.ts`. No redefinirlos en otro lugar.**

```ts
export enum RolUsuario      { Administrador = 'Administrador', Trabajador = 'Trabajador' }
export enum EstadoUsuario   { Pendiente = 'Pendiente', Activo = 'Activo', Inactivo = 'Inactivo' }
export enum EstadoContacto  { Vigente = 'Vigente', Vencido = 'Vencido' }
export enum LeadState       { Prospecto = 'En prospecto', Ofertado = 'Ofertado', CierreVenta = 'Cierre con venta', CierreSinVenta = 'Cierre sin venta' }
export enum TipoActividad   { Email = 'Email', Reunion = 'Reunion', Llamada = 'Llamada', Otro = 'Otro' }
export enum EstadoActividad { Pendiente = 'Pendiente', Completada = 'Completada' }
export enum EstadoCot       { Pendiente = 'Pendiente', Enviada = 'Enviada', Aceptada = 'Aceptada', Rechazada = 'Rechazada' }
export enum TipoMoneda      { Soles = 'PEN', Dolares = 'USD' }
export enum TipoEmpresa     { Privada = 'Privada', Publica = 'Publica', ONG = 'ONG', Mixta = 'Mixta' }
export enum TamanoEmpresa   { Micro = 'Micro', Pequena = 'Pequena', Mediana = 'Mediana', Grande = 'Grande' }
export enum EstadoNotif     { NoLeida = 'No Leida', Leida = 'Leida' }
export enum TokenPurpose    { Activacion = 'Activacion', Recuperacion = 'Recuperacion' }
export enum EstadoSecuencia { Programada = 'Programada', EnEjecucion = 'EnEjecucion', Completada = 'Completada', Cancelada = 'Cancelada' }
export enum Vocativo        { Sr = 'Sr', Sra = 'Sra', Dr = 'Dr', Dra = 'Dra', Ing = 'Ing', Lic = 'Lic' }
export enum Sector          { Agroindustria = 'Agroindustria', Manufactura = 'Manufactura', Tecnologia = 'Tecnologia', Salud = 'Salud', Educacion = 'Educacion', OtroSector = 'Otro' }
export enum TipoServicio    { Consultoria = 'Consultoria', FormulacionProyecto = 'FormulacionProyecto' }
export enum TipoNotificacion { Recordatorio = 'Recordatorio', Seguimiento = 'Seguimiento' }
```

---

## 7. Diccionario de Datos (Entidades Principales)

> Referencia oficial: §9 del Documento de Análisis y Diseño v1.6.

### Usuarios
`id, nombres, apellidos, rol(ENUM RolUsuario), estado(ENUM EstadoUsuario), correo(único), password(hash), created_at, updated_at`

### Organizaciones
`id(UUID), codigo_cliente(único), nombre(único), nombre_comercial, sub_area, ruc(11 chars), tipo(ENUM TipoEmpresa), linkedin, ubicacion, sector(ENUM Sector), tamaño(ENUM TamanoEmpresa), actividad_economica, alianzas_estrategicas, id_contacto_activo(FK), id_author(FK), created_at, updated_at`

### Contactos
`id, nombres, apellidos, vocativo(ENUM Vocativo), cargo, correo(único), telefono, correo2, comentarios, id_organizacion(FK UUID), id_author(FK), estado(ENUM EstadoContacto, default Vigente), created_at, updated_at`

### Leads
`id, id_org(FK UUID), id_contacto(FK opcional), estado(ENUM LeadState), servicio_interes, comentarios, desafio_oportunidad, notas_contacto, id_encargado(FK), canal_captacion, id_author(FK), created_at, updated_at`

### Actividades
`id, id_lead(FK), id_responsable(FK), nombre_actividad, fecha_inicio, tipo(ENUM TipoActividad), estado(ENUM EstadoActividad), fecha_fin, notas, outlook_event_id, outlook_imported, teamsMeetingUrl, seguimiento_automatico, id_author(FK), created_at, updated_at`

### Recordatorios_Actividad
`id, id_actividad(FK), minutos_antes(INT positivo), enviado(BOOL default false), job_id, created_at`

### Cotizaciones
`id, id_lead(FK), id_remitente(FK), fecha_cot, dirigido, cliente, producto, nombre_remitente, nombre_servicio, monto(DECIMAL≥0, RF-0015 permite 0), tipo(ENUM TipoMoneda), estado(ENUM EstadoCot), observacion, link_propuesta, id_author(FK), created_at, updated_at`

### Secuencias_Seguimiento
`id, id_actividad(FK, único), estado(ENUM EstadoSecuencia, default Programada), fecha_activacion, fecha_finalizacion, created_at, updated_at`

### Pasos_Seguimiento
`id, id_secuencia(FK), orden(INT), esperar_dias(INT≥0)`

### Integraciones_Microsoft
`id, id_usuario(FK, único), microsoft_email(único), microsoft_oid(único), refresh_token(sensible), token_expires_at, conectado(BOOL default false), created_at, updated_at`

### Notificaciones
`id, id_usuario(FK), id_actividad(FK), titulo, mensaje, estado(ENUM EstadoNotif), created_at`

### Templates_Email
`id, nombre(único), asunto, cuerpo, categoria(opcional), activo(BOOL default true), created_at, updated_at`

### User_Tokens
`id, correo, token_hash(único), proposito(ENUM TokenPurpose), id_usuario(FK), rol(ENUM RolUsuario), invitador_id(FK), estado(ENUM), expires_at, consumed_at, created_at`

---

## 8. Reglas de Negocio Críticas

| Código | Regla | Impacto en Frontend |
|---|---|---|
| RN-001 | Sesión válida para todo acceso | Guard en `middleware.ts` + layout `(dashboard)` |
| RN-002 | Control por rol | Ocultar `/control-acceso` para Trabajador |
| RN-003 | Sin borrado físico de **organizaciones, contactos, leads y cotizaciones** | No mostrar botón eliminar para estas entidades. **Plantillas SÍ pueden eliminarse físicamente** si no están en uso (CU011) |
| RN-004 | Sin RUC → código interno obligatorio | Validación condicional en `OrganizacionForm` |
| RN-005 | Contacto vinculado a una organización obligatoriamente | Validación en `ContactoForm` |
| RN-006 | Lead vinculado a una organización obligatoriamente | Validación en `LeadForm` |
| RN-007 | Cotización Aceptada → lead `CierreVenta`; Rechazada → `CierreSinVenta` | Lógica en `cotizaciones.service.ts` (RF-0037, RF-0038) |
| RN-008 | No nueva actividad si la anterior está `Pendiente` | Bloquear `ActividadForm` (RF-0039) |
| RN-009 | Solo estados válidos del pipeline | Usar `LeadState` enum |
| RN-010 | Dashboard solo de consulta | Sin mutaciones desde `/dashboard` |
| RN-013 | Una sola notificación por actividad | Verificar en `RecordatorioForm` y `SeguimientoForm` (RF-0061) |
| RN-014 | Integración Microsoft opcional — operar sin ella | Tolerancia a fallos en `integraciones.service.ts` (RNF-0011) |
| RF-0015 | Monto cotización ≥ 0 (incluye 0) | Schema Zod `cotizacion.schema.ts` |
| RF-0027 | Alerta automática 30 días sin avance | Backend ejecuta el job; frontend solo visualiza |
| RF-0044 | Org con >6 contactos → redirección a `/contactos?org=` | Navegación desde `OrganizacionDetalle` |
| RF-0048 | Personalizar correo de plantilla sin modificar la plantilla original | Guardar versión editada en la notificación |
| RF-0051 | Marcar actividad como completada cancela correos pendientes | Cascada en `notificaciones.service.ts` |
| RF-0061 | Una notificación por actividad | Validación en formularios de notificación |
| RF-0065 | Bloquear lead con contacto vencido | Validación en `LeadForm`; requiere `estado` en `Contacto` |

---

## 9. Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/             # login, forgot-password, reset-password, activate
│   └── (dashboard)/        # todas las rutas protegidas
│
├── components/
│   ├── ui/                 # átomos: Button, Input, Select, Badge, Modal, Table, Card, Spinner, Toast, EmptyState
│   ├── layout/             # Sidebar, Navbar, PageHeader
│   └── modules/            # componentes por módulo
│
├── hooks/                  # custom hooks por dominio
├── services/
│   ├── api/client.ts       # Axios con interceptores
│   ├── api/endpoints.ts    # TODAS las URLs aquí
│   ├── mock/               # data falsa por módulo
│   └── modules/            # servicios: switch mock ↔ API
│
├── store/                  # Zustand: auth.store, ui.store
├── types/                  # interfaces + enums.ts
└── lib/
    ├── utils/              # date, format, validation, csv
    ├── constants/          # routes.ts, queryKeys.ts, config.ts
    └── validators/         # schemas Zod
```

---

## 10. Patrón Mock → API

El switch entre mock y API real se controla **únicamente** en `src/services/modules/*.service.ts`.

```ts
// src/lib/constants/config.ts
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// src/services/modules/leads.service.ts
import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import * as mock from '@/services/mock/leads.mock'

export const leadsService = {
  getAll: async (filters?) => {
    if (USE_MOCK) return mock.getLeads(filters)
    return apiClient.get(ENDPOINTS.leads.list, { params: filters })
  },
}
```

**Integrar backend real = cambiar `NEXT_PUBLIC_USE_MOCK=false` en `.env.local`. Nada más.**

El backend que recibe las peticiones es un servicio **NestJS** que expone endpoints REST. Los endpoints en `endpoints.ts` deben alinearse con las rutas definidas por backend.

---

## 11. Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=BioActiva CRM
```

---

## 12. Integraciones Externas

### SUNAT (RF-0005, RN-004, RNF-0011)
- El backend hace **web scraping** del portal de consultas SUNAT.
- El frontend solo consume un endpoint REST (ej. `GET /sunat/ruc/:ruc` o `GET /sunat/razon-social?q=...`).
- En consulta por razón social, mostrar los **10 primeros resultados más coincidentes**.
- Si SUNAT no responde o no encuentra datos: mensaje "No se encontraron resultados en SUNAT para la organización consultada." y permitir registro manual (con código interno si no hay RUC).
- **Degradación elegante**: si SUNAT cae, el registro manual debe seguir disponible.

### Microsoft 365 (RF-0029, RN-014, RNF-0016)
- Integración via **Microsoft Graph API + OAuth 2.0 + Azure AD App Registration**.
- Funcionalidades:
  - Outlook Mail: envío de correos de seguimiento, recordatorios y notificaciones.
  - Outlook Calendar: asociar eventos/reuniones a actividades.
  - Teams: generar/asociar enlaces de reunión.
- Activación condicional: si el usuario no conectó su cuenta Microsoft, el CRM debe seguir operando con notificaciones internas y registro manual.
- Persistencia en la entidad `Integraciones_Microsoft` (refresh_token, token_expires_at, conectado).

---

## 13. Convención de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
refactor: mejora de código sin cambio funcional
style: cambios de estilos/UI
chore: tareas de mantenimiento, dependencias
docs: documentación
```

Ejemplos:
```
feat(auth): implement login form with JWT
feat(organizaciones): add SUNAT search integration
fix(pipeline): fix drag and drop state update
refactor(cotizaciones): extract form validation to schema
```

---

## 14. Skills Instaladas

El proyecto tiene las siguientes skills activas (instaladas via autoskills):

- `accessibility` — buenas prácticas de accesibilidad web
- `seo` — optimización para motores de búsqueda
- `frontend-design` — diseño de interfaces production-grade
- `tailwind-css-patterns` — patrones avanzados de Tailwind
- `react-hook-form` — formularios con validación
- `zod` — validación de esquemas TypeScript
- `nodejs-best-practices` — buenas prácticas Node.js
- `react-best-practices` — patrones React modernos
- `composition-patterns` — patrones de composición de componentes
- `next-best-practices` — convenciones Next.js 16
- `next-cache-components` — estrategias de caché en Next.js
- `next-upgrade` — guía de migración y upgrades
- `typescript-advanced-types` — tipos avanzados TypeScript
- `nodejs-backend-patterns` — patrones de backend Node.js

---

## 15. Reglas Críticas (NO negociables)

- ❌ Nunca hacer `fetch` o `axios` directamente en componentes o páginas
- ❌ Nunca hardcodear URLs fuera de `endpoints.ts`
- ❌ Nunca hardcodear rutas fuera de `routes.ts`
- ❌ Nunca redefinir ENUMs fuera de `enums.ts`
- ❌ Nunca usar `any` sin justificación documentada
- ❌ Nunca crear tipos inline en componentes si ya existen en `src/types/`
- ❌ Nunca importar con rutas relativas largas (`../../../../`); usar alias `@/`
- ❌ Nunca poner lógica de negocio en componentes de `src/components/ui/`
- ❌ Nunca eliminar físicamente organizaciones, contactos, leads o cotizaciones (RN-003) — plantillas son la única excepción cuando no están en uso
- ❌ Nunca crear archivos de prueba, scratch, temp o demo en el proyecto
- ❌ Nunca colocar data mock dentro de páginas o componentes — debe vivir en `src/services/mock/`
- ❌ Nunca asumir que las integraciones externas (SUNAT, Microsoft) están siempre disponibles — degradación elegante

---

## 16. Skills del Equipo

### skill:mock-to-api
Cuando el backend NestJS entregue un endpoint:
1. Agregar URL en `src/services/api/endpoints.ts`
2. Actualizar `src/services/modules/[modulo].service.ts`
3. Probar con `NEXT_PUBLIC_USE_MOCK=false`
4. No tocar componentes, hooks ni páginas

### skill:nuevo-modulo
1. Crear `src/app/(dashboard)/[modulo]/page.tsx`
2. Crear tipos en `src/types/[modulo].types.ts`
3. Crear schema Zod en `src/lib/validators/[modulo].schema.ts`
4. Crear mock en `src/services/mock/[modulo].mock.ts`
5. Crear servicio en `src/services/modules/[modulo].service.ts`
6. Crear hook en `src/hooks/[modulo]/use[Modulo].ts`
7. Crear componentes en `src/components/modules/[modulo]/`
8. Agregar endpoints en `src/services/api/endpoints.ts`
9. Agregar ruta en `src/lib/constants/routes.ts`
10. Agregar query keys en `src/lib/constants/queryKeys.ts`
11. Agregar ítem al Sidebar si corresponde

### skill:nuevo-componente-ui
1. Crear carpeta `src/components/ui/[Nombre]/`
2. Archivos: `[Nombre].tsx`, `[Nombre].types.ts`, `index.ts`
3. Exportar desde `src/components/ui/index.ts`
4. Sin lógica de negocio ni llamadas a servicios

### skill:validacion-formulario
1. Definir schema Zod en `src/lib/validators/`
2. Usar `react-hook-form` con `zodResolver`
3. Errores inline, no como toast
4. Toast solo para éxito o error de red

---

## 17. Resumen de Requerimientos Funcionales clave

> Lista no exhaustiva; consultar §7.5 del documento oficial para los 65 RF completos.

| RF | Descripción resumida | RN |
|---|---|---|
| RF-0001 | Login con credenciales válidas registradas por el admin | RN-001, RN-002 |
| RF-0002 | Recuperación de contraseña | RN-001, RN-002 |
| RF-0003 | Registrar y deshabilitar usuarios | RN-002 |
| RF-0004 | Registrar/editar organizaciones por RUC, código interno o razón social | RN-003, RN-004 |
| RF-0005 | Consulta SUNAT por RUC o razón social | RN-004 |
| RF-0006 | Registrar/editar contactos asociados a organización | RN-005 |
| RF-0007 | Validar correo principal del contacto sin duplicados | RN-003, RN-005 |
| RF-0008 / RF-0009 | Leads con organización obligatoria, contacto opcional | RN-006 |
| RF-0011 | Gestionar estados del pipeline | RN-009 |
| RF-0012 / RF-0024 / RF-0025 | Registrar actividades y mantener su historial | RN-008 |
| RF-0014 / RF-0015 | Generar cotizaciones, monto ≥ 0 (incluye 0) | RN-007 |
| RF-0017 / RF-0018 | Notificaciones programadas/vencidas asociadas al responsable | RN-013 |
| RF-0019 | Buscar y filtrar leads por organización, estado, encargado, asunto | RN-011 |
| RF-0020 / RF-0021 | Exportar/Importar CSV | RN-011, RN-012 |
| RF-0022 / RF-0060 | Métricas de dashboard con filtros por periodo y tipo de servicio | RN-010 |
| RF-0026 | Pipeline en formato Kanban | RN-009 |
| RF-0027 | Notificación automática lead inactivo >30 días | RN-013 |
| RF-0028 / RF-0047 / RF-0048 | Plantillas editables, personalizables sin modificar la original | RN-013, RN-003 |
| RF-0029 | Integración con Outlook y Teams | RN-014 |
| RF-0037 / RF-0038 | Automatización Aceptada→CierreVenta / Rechazada→CierreSinVenta | RN-007 |
| RF-0039 | Bloquear nueva actividad si la anterior está Pendiente | RN-008 |
| RF-0044 | Redirigir a Contactos con filtro de organización cuando >6 contactos | RN-005, RN-011 |
| RF-0050 / RF-0051 | Marcar actividad como completada cancela correos pendientes | RN-008, RN-013 |
| RF-0061 | Una sola notificación por actividad | RN-013 |
| RF-0062 | Monto de cotización no menor a 0 | RN-007 |
| RF-0063 / RF-0064 | Filtrado/exportación por características | RN-006, RN-011 |
| RF-0065 | Bloquear creación de leads con contactos vencidos | RN-005 |

---

## 18. Requerimientos No Funcionales clave

| RNF | Descripción | Prioridad |
|---|---|---|
| RNF-0001 | Seguridad de sesión: JWT con expiración controlada | MUST |
| RNF-0002 | Control de acceso por rol | MUST |
| RNF-0003 | Consultas principales <5 s | MUST |
| RNF-0004 | Dashboard <5 s | SHOULD |
| RNF-0005 | Validaciones de unicidad, formato y relaciones antes de guardar | MUST |
| RNF-0007 | Usabilidad: interfaz clara sin requerir capacitación técnica avanzada | MUST |
| RNF-0008 | Responsividad: PC, laptop y tablet (no se requiere mobile) | SHOULD |
| RNF-0009 | Navegabilidad: conservar contexto al retornar de vistas/modales | SHOULD |
| RNF-0011 | Tolerancia a fallos en servicios externos (SUNAT, Microsoft) | MUST |
| RNF-0012 | Importación/Exportación sin corrupción de datos | MUST |
| RNF-0013 | Arquitectura modular por dominio | SHOULD |
| RNF-0015 | Registro de errores críticos | SHOULD |
| RNF-0016 | Integración Microsoft no bloquea operación interna | SHOULD |

---

## 19. Volumen Estimado

| Operación | Volumen |
|---|---|
| Usuarios concurrentes | Hasta 9 en horario laboral |
| Organizaciones nuevas | 15–30 / mes |
| Contactos nuevos | 50–100 / mes |
| Leads activos | 20–30 / mes |
| Actividades registradas | 5–10 / día |
| Cotizaciones generadas | 10–20 / mes |
| Consultas SUNAT | Hasta 20 / día |
| Exportaciones CSV | Hasta 5 / semana |
| Importaciones CSV | Hasta 3 / mes |
<!-- END:nextjs-agent-rules -->
