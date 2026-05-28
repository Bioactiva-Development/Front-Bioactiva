# BioActiva CRM — Frontend

Aplicación Next.js 16 (App Router) del CRM comercial de BioActiva.

Para el contexto general del proyecto, casos de uso, arquitectura y estado de los módulos, ver el [README raíz](../README.md). Para convenciones técnicas detalladas, ENUMs, diccionario de datos y reglas críticas, ver [`AGENTS.md`](./AGENTS.md).

---

## Requisitos

- Node.js v24 o superior
- npm (o pnpm / yarn / bun)

---

## Instalación y desarrollo

```bash
npm install
npm run dev
```

Abrir <http://localhost:3000>.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Ejecuta ESLint |

---

## Variables de entorno

Crear un archivo `.env.local` en esta carpeta:

```bash
NEXT_PUBLIC_USE_MOCK=true                       # true: data mock | false: backend NestJS
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001  # URL del backend NestJS
NEXT_PUBLIC_APP_NAME=BioActiva CRM
```

El switch mock ↔ API se controla **únicamente** en `src/services/modules/*.service.ts`. Cambiar `NEXT_PUBLIC_USE_MOCK=false` conecta toda la app al backend real sin tocar componentes, hooks ni páginas.

---

## Estructura

```
src/
├── app/
│   ├── (auth)/             # login, forgot-password, reset-password, activate
│   ├── (dashboard)/        # todas las rutas protegidas del CRM
│   ├── layout.tsx
│   ├── providers.tsx       # React Query Provider, etc.
│   └── globals.css
├── components/
│   ├── ui/                 # átomos: Button, Modal, SearchBar, EmptyState, Spinner
│   ├── layout/             # Sidebar, Navbar, PageHeader
│   └── modules/            # componentes específicos por módulo de dominio
├── hooks/                  # custom hooks por dominio (useDashboard, useLeads, etc.)
├── services/
│   ├── api/                # cliente Axios y endpoints centralizados
│   ├── mock/               # data falsa por módulo
│   └── modules/            # servicios que conmutan mock ↔ API real
├── store/                  # auth.store, ui.store (Zustand)
├── types/                  # interfaces de dominio + enums.ts
├── lib/
│   ├── constants/          # routes.ts, queryKeys.ts, config.ts
│   ├── utils/              # date, format, validation, csv
│   └── validators/         # schemas Zod por módulo
├── styles/                 # globals.css, themes
└── middleware.ts           # guards de sesión y rol
```

---

## Convenciones críticas

> Detalle completo en [`AGENTS.md §14`](./AGENTS.md). Resumen:

- ❌ Nada de `fetch` o `axios` directo en componentes o páginas — siempre vía `services/`.
- ❌ Sin URLs hardcodeadas fuera de `services/api/endpoints.ts`.
- ❌ Sin rutas hardcodeadas fuera de `lib/constants/routes.ts`.
- ❌ Sin ENUMs redefinidos fuera de `types/enums.ts`.
- ❌ Sin `any` sin justificación.
- ❌ Sin imports relativos largos (`../../../`); usar alias `@/`.
- ❌ Sin lógica de negocio en `components/ui/`.
- ❌ Sin borrado físico de organizaciones, contactos, leads ni cotizaciones (RN-003).

---

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript 5** + **Tailwind CSS 4**
- **Zustand** (estado global) + **TanStack React Query 5** (server state)
- **Axios** (HTTP) + **React Hook Form 7** + **Zod 4** (formularios y validación)
- **Recharts** (gráficas del dashboard)
- **@dnd-kit** (Kanban del pipeline)
- **Lucide React** (iconos)

---

## Deploy

El frontend está contenerizado con el `Dockerfile` incluido. La estrategia de despliegue contempla 4 contenedores (frontend Next.js, backend NestJS, PostgreSQL, Redis) conectados por red interna. Detalles en el §11.3 del documento oficial de Análisis y Diseño.

El prototipo de referencia está desplegado en Vercel: <https://a-frontend-bioactiva-73nc.vercel.app/>.
