# Front-Bioactiva

Proyecto principal de un CRM desarrollado en Next.js para la plataforma Bioactiva.

## Descripción

Front-Bioactiva es una aplicación web de gestión comercial que agrupa módulos clave para administración de clientes, cotizaciones, organización interna y seguimiento de leads.

La aplicación principal se encuentra en la carpeta `bioactiva-crm` y está construida con Next.js, TypeScript, Tailwind CSS y una arquitectura basada en módulos y hooks personalizados.

## Funcionalidades principales

- Autenticación y acceso:
  - Login
  - Activación de cuenta
  - Recuperación y restablecimiento de contraseña
- Panel principal (`dashboard`)
- Gestión de contactos (`contactos`)
- Gestión de organizaciones y clientes (`organizaciones`)
- Administración de cotizaciones (`cotizaciones`)
- Pipeline comercial y seguimiento de leads (`pipeline`)
- Control de acceso y permisos (`control-acceso`)
- Gestión de notificaciones (`notificaciones`)
- Administración de datos y reportes (`datos`)
- Uso de plantillas para eventos o comunicaciones (`plantillas`)

## Estructura del proyecto

- `bioactiva-crm/`
  - `src/app/` - rutas y páginas de la aplicación
    - `(dashboard)/` - área protegida del CRM con sus módulos
    - `(auth)/` - páginas de autenticación y recuperación
  - `src/components/` - componentes reutilizables de UI y layout
  - `src/hooks/` - hooks personalizados por dominio
  - `src/lib/` - utilidades, constantes y validaciones
  - `src/services/` - integración con API y servicios internos
  - `src/store/` - estado global con Zustand
  - `src/styles/` - estilos globales y temas
  - `src/types/` - tipos TypeScript para entidades y datos

## Tecnologías usadas

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- React Query (`@tanstack/react-query`)
- Axios
- React Hook Form
- Zod
- Recharts
- DnD Kit

## Scripts disponibles

Desde la carpeta `bioactiva-crm`:

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## Cómo iniciar el proyecto

1. Abrir terminal en `bioactiva-crm`
2. Ejecutar `npm install`
3. Ejecutar `npm run dev`
4. Abrir `http://localhost:3000`

## Notas

- El proyecto usa el App Router de Next.js.
- La estructura está diseñada para escalar con módulos separados por dominio.
- Si deseas desplegar, puedes usar cualquier plataforma compatible con Next.js.
