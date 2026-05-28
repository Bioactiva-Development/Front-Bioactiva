# Front-Bioactiva — CRM BioActiva

Frontend del CRM comercial de **BioActiva**, una plataforma centralizada que reemplaza la gestión actual en hojas de Excel y unifica el ciclo comercial completo: identificación de prospectos, seguimiento, propuestas, cierre, notificaciones, importación/exportación y dashboards.

> Documento de Análisis y Diseño de referencia: `BIOACTIVA-UTEC / Documento de Análisis y Diseño v1.6` (132 páginas, 11 casos de uso, 65 requerimientos funcionales, 16 no funcionales, 14 reglas de negocio, 13 entidades).
>
> Prototipo desplegado: <https://a-frontend-bioactiva-73nc.vercel.app/>

---

## 1. Contexto

BioActiva es una empresa peruana especializada en gestión de la innovación, formulación de proyectos de I+D+i, vigilancia tecnológica, propiedad intelectual y fortalecimiento de capacidades empresariales.

**Problemas que resuelve el CRM**:

- Duplicidad de datos en hojas de Excel.
- Pérdida de seguimiento de oportunidades comerciales.
- Falta de visibilidad sobre el avance del proceso comercial.
- Dificultad para validar organizaciones y mantener integridad de la información.

**Objetivo general**: gestionar la información comercial de manera ordenada, garantizar unicidad de las entidades registradas y conservar el historial de interacciones durante todo el ciclo de venta, con apoyo de notificaciones automáticas, dashboards e importación/exportación.

---

## 2. Roles del sistema

| Rol | Permisos |
|---|---|
| **Administrador** | Acceso total. Único que puede gestionar usuarios (invitar, habilitar, deshabilitar, asignar roles). Accede a todos los módulos. |
| **Trabajador** | Usuario operativo. Gestiona organizaciones, contactos, leads, cotizaciones, notificaciones, plantillas, dashboard, importación y exportación. **No** accede a control de acceso. |

Actores externos: **SUNAT** (consulta de RUC/razón social por web scraping vía backend) y **Microsoft 365** (Outlook Mail, Outlook Calendar y Teams vía Microsoft Graph API + OAuth 2.0 / Azure AD).

---

## 3. Casos de uso y módulos

| CU | Módulo | Ruta principal | Roles |
|---|---|---|---|
| CU001 | Autenticación e inicio de sesión | `/login`, `/forgot-password`, `/reset-password`, `/activate` | Público |
| CU002 | Gestión de Usuarios (invitación por correo institucional, activación por token, deshabilitación) | `/control-acceso` | Administrador |
| CU003 | Gestión de Organizaciones (consulta SUNAT por RUC o razón social, código interno único cuando no hay RUC) | `/organizaciones`, `/organizaciones/[id]` | Ambos |
| CU004 | Gestión de Contactos (vinculación obligatoria a una organización, correo principal único) | `/contactos`, `/contactos/[id]` | Ambos |
| CU005 | Pipeline de Leads (vista Kanban con 4 estados, drag & drop, actividades de seguimiento) | `/pipeline`, `/pipeline/[id]` | Ambos |
| CU006 | Gestión de Cotizaciones (vinculadas a un lead, automatización de cierre del lead según estado) | `/cotizaciones`, `/cotizaciones/[id]` | Ambos |
| CU007 | Notificaciones (recordatorios internos, secuencias de seguimiento con correo interno + externo, alerta automática a leads sin avance >30 días) | `/notificaciones` | Ambos |
| CU008 | Dashboard comercial (8 KPIs, filtros por periodo y tipo de servicio) | `/dashboard` | Ambos |
| CU009 | Importación de datos (3 etapas: subir, preview/conflictos, confirmar; `.xlsx/.xls/.csv`) | `/datos` | Ambos |
| CU010 | Exportación de datos (CSV con filtros por tipo de entidad) | `/datos` | Ambos |
| CU011 | Plantillas de correo (CRUD, activación/desactivación, eliminación física si no están en uso) | `/plantillas` | Ambos |

---

## 4. Estado actual de los módulos

| Módulo | Estado | Notas |
|---|---|---|
| Autenticación | 🚧 UI completa con login y guards de middleware | Falta validación de dominio institucional; faltan mensajes específicos del CU001 |
| Control de Acceso | 🚧 Página existe; formularios `InvitarUsuarioForm.tsx` y `UsuarioItem.tsx` están vacíos | Pendiente flujo completo de invitación con token |
| Organizaciones | 🚧 CRUD funcional con React Query | Falta integración SUNAT (RF-0005), redirección a Contactos con filtro cuando hay >6 contactos (RF-0044) |
| Contactos | 🚧 CRUD funcional, validación de correo único | Falta campo `estado` (Vigente/Vencido) requerido por RF-0065 |
| Pipeline / Leads | 🚧 Vista Kanban con DnD, actividades | Pendiente RN-008 (bloqueo de nueva actividad si la anterior está Pendiente), RF-0065 |
| Cotizaciones | 🚧 CRUD con autocompletado desde lead | Pendiente verificar automatización Aceptada→CierreVenta / Rechazada→CierreSinVenta (RF-0037, RF-0038) y monto = 0 permitido (RF-0015) |
| Notificaciones | 🚧 Listado y formularios básicos | **Pendiente el motor de secuencias y pasos** (entidades `SECUENCIAS_SEGUIMIENTO`, `PASOS_SEGUIMIENTO`, `RECORDATORIOS_ACTIVIDAD`), alerta automática 30 días sin avance (RF-0027), cancelación en cascada (RF-0051) |
| Dashboard | 🚧 UI completa con 8 KPIs y filtros de periodo | Datos hardcodeados en la página; faltan `dashboard.service.ts`, `dashboard.mock.ts`, `dashboard.types.ts`, `useDashboard.ts`, `KpiCard.tsx`, `DashboardFiltros.tsx`, `ConversionChart.tsx`, `PipelineChart.tsx` (todos vacíos); falta filtro **tipo de servicio** (consultoría / formulación de proyecto, RF-0060 y §CU008) |
| Importación / Exportación | 🚧 Páginas existen | Verificar flujo de 3 etapas (CU009) y filtros específicos por entidad (CU010) |
| Plantillas | 🚧 CRUD básico | Falta campo `categoria` opcional (CU011 paso 5d) y regla "no eliminar si está en uso → solo desactivar" |
| Integración Microsoft | ❌ No implementado | Requiere OAuth 2.0 + Azure AD App Registration + Microsoft Graph API |
| Integración SUNAT | ❌ No implementado | Web scraping vía backend; el frontend solo invoca el endpoint |

Leyenda: ✅ listo · 🚧 en progreso · ❌ pendiente

---

## 5. Arquitectura (resumen del §11 del documento de Análisis y Diseño)

Monolito modular orientado a servicios, contenerizado y desplegado en servidor centralizado.

### 5.1. Vista lógica (por capas)

| Capa | Componente | Tecnología |
|---|---|---|
| Presentación | SPA web (este repo) | **Next.js 16 + React 19 + TypeScript + Tailwind CSS 4** |
| Aplicación / Negocio | Backend CRM (REST API) | **NestJS** (controladores, servicios, módulos) |
| Integración | Microsoft 365 | Microsoft Graph API + OAuth 2.0 + Azure AD |
| Integración | SUNAT | Web scraping desde backend |
| Persistencia | Base de datos relacional | **PostgreSQL** |
| Persistencia | Cache / sesiones | **Redis** |

### 5.2. Vista física

Servidor on-premise centralizado que aloja front, back, BD y cache. Los clientes acceden por navegador desde red institucional o Internet. La comunicación con SUNAT y Microsoft 365 se realiza por HTTPS.

### 5.3. Vista de despliegue (Docker)

Cuatro contenedores: **frontend (Next.js)**, **backend (NestJS)**, **PostgreSQL**, **Redis**, comunicados por una red interna controlada.

### 5.4. Vista de integración

- **Microsoft 365**: REST API vía Microsoft Graph; OAuth 2.0 + Azure AD; sincronización de calendarios, reuniones, correos y vinculación de interacciones con leads/contactos.
- **SUNAT**: web scraping del portal de consulta; recuperación de información empresarial por RUC o razón social en tiempo real.
- **Interna**: front ↔ back vía REST; el backend centraliza el acceso a persistencia, cache e integraciones externas.

---

## 6. Stack del frontend

| Capa | Librería |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Estado global | Zustand 5 |
| Server state / cache | TanStack React Query 5 |
| HTTP client | Axios |
| Formularios | React Hook Form 7 |
| Validación | Zod 4 |
| Iconos | Lucide React |
| Gráficas | Recharts 3 |
| Drag & drop (Kanban) | @dnd-kit/core + @dnd-kit/sortable |

---

## 7. Estructura del repositorio

```
Front-Bioactiva/
├── README.md                         # este archivo
└── bioactiva-crm/                    # aplicación Next.js
    ├── AGENTS.md                     # guía técnica completa para agentes IA y humanos
    ├── CLAUDE.md                     # apunta a AGENTS.md
    ├── README.md                     # guía rápida de desarrollo
    ├── Dockerfile                    # contenedor del frontend
    ├── next.config.ts
    ├── package.json
    ├── tsconfig.json
    ├── public/
    └── src/
        ├── app/
        │   ├── (auth)/               # login, forgot-password, reset-password, activate
        │   ├── (dashboard)/          # área protegida con todos los módulos
        │   ├── layout.tsx
        │   ├── providers.tsx         # React Query Provider, etc.
        │   └── globals.css
        ├── components/
        │   ├── ui/                   # átomos reutilizables (Button, Modal, SearchBar, EmptyState, Spinner)
        │   ├── layout/               # Sidebar, Navbar, PageHeader
        │   └── modules/              # componentes específicos por módulo
        ├── hooks/                    # hooks personalizados por dominio
        ├── services/
        │   ├── api/                  # cliente Axios + endpoints
        │   ├── mock/                 # data falsa por módulo
        │   └── modules/              # servicios que conmutan mock ↔ API real
        ├── store/                    # stores Zustand (auth, ui)
        ├── types/                    # interfaces de dominio + enums
        ├── lib/
        │   ├── constants/            # routes, queryKeys, config
        │   ├── utils/                # date, format, validation, csv
        │   └── validators/           # esquemas Zod
        ├── styles/                   # globals, temas
        └── middleware.ts             # guards de sesión y rol
```

---

## 8. Cómo iniciar el proyecto

```bash
cd bioactiva-crm
npm install
npm run dev
```

Abrir <http://localhost:3000>.

### Scripts disponibles (`bioactiva-crm/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Ejecuta ESLint |

### Variables de entorno

Crear `bioactiva-crm/.env.local`:

```bash
NEXT_PUBLIC_USE_MOCK=true                       # true para usar mocks, false para conectar al backend NestJS
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001  # URL del backend
NEXT_PUBLIC_APP_NAME=BioActiva CRM
```

El switch mock ↔ API se aplica en `src/services/modules/*.service.ts` mediante la constante `USE_MOCK`. Cambiar de mock a API real **no requiere** modificar componentes, hooks ni páginas.

---

## 9. Cuentas demo (entorno de prototipo)

> Disponibles únicamente en el prototipo desplegado, no en desarrollo local.

| Rol | Correo | Contraseña | Datos asociados |
|---|---|---|---|
| Administrador | `admin@bioactiva.pe` | `Bioactiva2025!` | — |
| Trabajador | `karien@bioactiva.pe` | `Bioactiva2025!` | LEAD-2025-003, LN-001 recordatorio programado |
| Trabajador | `ltorres@bioactiva.pe` | `Bioactiva2025!` | LEAD-2025-005, LN-003 seguimiento enviado |
| Trabajador | `arojas@bioactiva.pe` | `Bioactiva2025!` | sin notificaciones de email |
| Trabajador | `mquispe@bioactiva.pe` | `Bioactiva2025!` | sin notificaciones de email |
| Trabajador | `cmamani@bioactiva.pe` | `Bioactiva2025!` | LEAD-2025-008 con una actividad registrada |

---

## 10. Reglas de negocio críticas para el frontend

| Código | Regla | Impacto |
|---|---|---|
| RN-001 | Sesión válida obligatoria | Guard en `middleware.ts` y layout protegido |
| RN-002 | Acceso por rol | Ocultar `/control-acceso` para Trabajador |
| RN-003 | Sin borrado físico de organizaciones, contactos, leads y cotizaciones | No mostrar botón "Eliminar", usar "Desactivar" o no exponerlo. **Plantillas sí pueden eliminarse físicamente si no están en uso** (CU011) |
| RN-004 | Org sin RUC → código interno obligatorio | Validación condicional en `OrganizacionForm` |
| RN-005 | Contacto vinculado a una organización obligatoriamente | Validación en `ContactoForm` |
| RN-006 | Lead vinculado a una organización obligatoriamente | Validación en `LeadForm` |
| RN-007 | Cotización Aceptada → lead a Cierre con venta; Rechazada → Cierre sin venta | Lógica en `cotizaciones.service.ts` (RF-0037, RF-0038) |
| RN-008 | No nueva actividad si la anterior está Pendiente | Bloquear `ActividadForm` (RF-0039) |
| RN-009 | Estados válidos del pipeline únicamente | Usar enum `LeadState` |
| RN-013 | Una sola notificación por actividad | Validar en `RecordatorioForm` y `SeguimientoForm` (RF-0061) |
| RN-014 | Integración Microsoft opcional — el sistema debe seguir operando si está desactivada | Tolerancia a fallos en `integraciones.service.ts` (RNF-0011) |
| RF-0015 | Monto de cotización mayor o igual a 0 (incluye 0) | Schema Zod `cotizacion.schema.ts` |
| RF-0027 | Alerta automática si lead supera 30 días sin cambio de estado | Job en backend; el frontend solo visualiza |
| RF-0044 | Org con >6 contactos → redirección a `/contactos` con filtro de organización aplicado | Navegación desde `OrganizacionDetalle` |
| RF-0065 | Bloquear creación de leads con contactos vencidos | Validación en `LeadForm`; requiere campo `estado` en `Contacto` |

---

## 11. Volumen estimado (§10 del documento)

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

---

## 12. Requerimientos no funcionales destacados

- **RNF-0001** Seguridad de sesión: JWT con expiración controlada.
- **RNF-0003 / RNF-0004** Rendimiento: consultas y dashboards < 5 s en condiciones normales.
- **RNF-0007** Usabilidad: validación inline en formularios, toasts solo para éxito o errores de red.
- **RNF-0008** Responsividad: PC, laptop y tablet (no mobile como requisito).
- **RNF-0011** Tolerancia a fallos en servicios externos (SUNAT, Microsoft): degradación elegante.
- **RNF-0013** Mantenibilidad: arquitectura modular por dominio.
- **RNF-0015** Registro de errores críticos en autenticación, integraciones, notificaciones, importaciones y exportaciones.

---

## 13. Documentación complementaria

- [`bioactiva-crm/AGENTS.md`](./bioactiva-crm/AGENTS.md) — guía técnica completa: convenciones, ENUMs, diccionario de datos, patrón mock→API, skills del equipo, reglas críticas no negociables.
- [`bioactiva-crm/README.md`](./bioactiva-crm/README.md) — guía rápida de desarrollo de la app.
- Documento oficial: `BIOACTIVA-UTEC / Documento de Análisis y Diseño v1.6` (fuente de toda decisión funcional y arquitectónica).

---

## 14. Equipo

| Rol | Integrantes |
|---|---|
| Project Manager | Gonzalo Andrés Valladolid Jiménez |
| Analistas funcionales | Josué Renzo Hernández Yataco, Joel Modesto Cayllahua Hilario |
| Frontend | Jean Paul Cuzcano Ponce, Luis Anthony Romero Padilla |
| Backend | Yuri Abel Escobar Perez, Joseph Anderson Cose Roja |
| Testers | Paulo Isael Miranda Barrientos, Fabricio Alonso Lanche Pacsi |
| Revisor TCH | Teofilo Chambilla Aquino |
| Aprobadores | Karien Diaz, Katia Samanud |
