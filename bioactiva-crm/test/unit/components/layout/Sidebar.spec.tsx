import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '@/components/layout/Sidebar/Sidebar'
import { RolUsuario } from '@/types/enums'

const mockLogout = jest.fn()
const mockToggleCollapsed = jest.fn()

const mockUseAuthStore = jest.fn()
const mockUseUIStore = jest.fn()
const mockUsePathname = jest.fn()
const mockUseRouter = jest.fn()

jest.mock('@/store', () => ({
  useAuthStore: (...args: unknown[]) => mockUseAuthStore(...args),
  useUIStore: (...args: unknown[]) => mockUseUIStore(...args),
}))

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({ logout: mockLogout }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: (...args: unknown[]) => mockUsePathname(...args),
  useSearchParams: () => new URLSearchParams(),
}))

const adminUser = {
  id: 1,
  nombres: 'Admin',
  apellidos: 'User',
  correo: 'admin@test.com',
  rol: RolUsuario.Administrador,
}

const workerUser = {
  id: 2,
  nombres: 'Worker',
  apellidos: 'User',
  correo: 'worker@test.com',
  rol: RolUsuario.Trabajador,
}

function defaultMocks(overrides: Record<string, unknown> = {}) {
  mockUseAuthStore.mockReturnValue({ usuario: adminUser })
  mockUseUIStore.mockReturnValue({
    sidebarCollapsed: false,
    toggleCollapsed: mockToggleCollapsed,
    sidebarOpen: true,
    ...overrides,
  })
  mockUsePathname.mockReturnValue('/dashboard')
  mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() })
}

describe('layout/Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    defaultMocks()
  })

  it('renders when sidebarOpen is true', () => {
    render(<Sidebar />)
    expect(screen.getByText('BioActiva')).toBeInTheDocument()
    expect(screen.getByText('CRM')).toBeInTheDocument()
  })

  it('returns null when sidebarOpen is false', () => {
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: false,
      toggleCollapsed: mockToggleCollapsed,
      sidebarOpen: false,
    })
    const { container } = render(<Sidebar />)
    expect(container.innerHTML).toBe('')
  })

  it('shows admin-only nav items for admin users', () => {
    render(<Sidebar />)
    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument()
  })

  it('hides admin-only nav items for non-admin users', () => {
    mockUseAuthStore.mockReturnValue({ usuario: workerUser })
    render(<Sidebar />)
    expect(screen.queryByText('Gestión de Usuarios')).not.toBeInTheDocument()
  })

  it('renders all common nav items', () => {
    render(<Sidebar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Organizaciones')).toBeInTheDocument()
    expect(screen.getByText('Contactos')).toBeInTheDocument()
    expect(screen.getByText('Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Cotizaciones')).toBeInTheDocument()
    expect(screen.getByText('Importar / Exportar')).toBeInTheDocument()
    expect(screen.getByText('Notificaciones')).toBeInTheDocument()
    expect(screen.getByText('Plantillas')).toBeInTheDocument()
  })

  it('highlights active nav item based on pathname', () => {
    mockUsePathname.mockReturnValue('/pipeline')
    render(<Sidebar />)
    const activeLink = screen.getByText('Pipeline').closest('a')
    expect(activeLink).toHaveClass('bg-emerald-50', 'text-emerald-700')
  })

  it('does not highlight non-matching nav items', () => {
    mockUsePathname.mockReturnValue('/organizaciones')
    render(<Sidebar />)
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).not.toHaveClass('bg-emerald-50')
  })

  it('renders collapsed sidebar with collapsed class', () => {
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: true,
      toggleCollapsed: mockToggleCollapsed,
      sidebarOpen: true,
    })
    const { container } = render(<Sidebar />)
    expect(container.querySelector('aside')).toHaveClass('w-16')
  })

  it('renders expanded sidebar with expanded class', () => {
    const { container } = render(<Sidebar />)
    expect(container.querySelector('aside')).toHaveClass('w-52')
  })

  it('renders logout button with text when expanded', () => {
    render(<Sidebar />)
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', async () => {
    render(<Sidebar />)
    await userEvent.click(screen.getByText('Cerrar sesión'))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('calls toggleCollapsed when collapse button is clicked', async () => {
    render(<Sidebar />)
    const collapseBtn = document.querySelector('button[class*="rounded-full"]')
    expect(collapseBtn).toBeInTheDocument()
    if (collapseBtn) {
      await userEvent.click(collapseBtn)
      expect(mockToggleCollapsed).toHaveBeenCalledTimes(1)
    }
  })

  it('renders tooltip for nav items in collapsed mode via title attribute', () => {
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: true,
      toggleCollapsed: mockToggleCollapsed,
      sidebarOpen: true,
    })
    const { container } = render(<Sidebar />)
    const tooltips = container.querySelectorAll('[class*="opacity-0 group-hover:opacity-100"]')
    expect(tooltips.length).toBeGreaterThan(0)
  })
})
