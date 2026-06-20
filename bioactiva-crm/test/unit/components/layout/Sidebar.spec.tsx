import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '@/components/layout/Sidebar/Sidebar'
import { RolUsuario } from '@/types/enums'

const mockLogout = jest.fn()
const mockToggleCollapsed = jest.fn()
const mockCloseSidebar = jest.fn()

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

beforeAll(() => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query.includes('min-width: 1024px'),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
})

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
    closeSidebar: mockCloseSidebar,
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
    expect(screen.getAllByText('BioActiva').length).toBeGreaterThan(0)
    expect(screen.getAllByText('CRM').length).toBeGreaterThan(0)
  })

  it('renders hidden overlay when sidebarOpen is false', () => {
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: false,
      toggleCollapsed: mockToggleCollapsed,
      closeSidebar: mockCloseSidebar,
      sidebarOpen: false,
    })
    render(<Sidebar />)
    const overlays = document.querySelectorAll('.fixed')
    const overlay = Array.from(overlays).find(el =>
      el.className.includes('pointer-events-none')
    )
    expect(overlay).toBeTruthy()
    expect(overlay).toHaveClass('opacity-0', 'pointer-events-none')
  })

  it('shows admin-only nav items for admin users', () => {
    render(<Sidebar />)
    expect(screen.getAllByText('Gestión de Usuarios').length).toBeGreaterThan(0)
  })

  it('hides admin-only nav items for non-admin users', () => {
    mockUseAuthStore.mockReturnValue({ usuario: workerUser })
    render(<Sidebar />)
    expect(screen.queryAllByText('Gestión de Usuarios').length).toBe(0)
  })

  it('renders all common nav items', () => {
    render(<Sidebar />)
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Organizaciones').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Contactos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pipeline').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cotizaciones').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Importar / Exportar').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Notificaciones').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Plantillas').length).toBeGreaterThan(0)
  })

  it('highlights active nav item based on pathname', () => {
    mockUsePathname.mockReturnValue('/pipeline')
    render(<Sidebar />)
    const activeLinks = screen.getAllByText('Pipeline')
    activeLinks.forEach(link => {
      const anchor = link.closest('a')
      expect(anchor).toHaveClass('bg-emerald-50', 'text-emerald-700')
    })
  })

  it('does not highlight non-matching nav items', () => {
    mockUsePathname.mockReturnValue('/organizaciones')
    render(<Sidebar />)
    const dashboardLinks = screen.getAllByText('Dashboard')
    dashboardLinks.forEach(link => {
      const anchor = link.closest('a')
      expect(anchor).not.toHaveClass('bg-emerald-50')
    })
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
    expect(screen.getAllByText('Cerrar sesión').length).toBeGreaterThan(0)
  })

  it('calls logout when logout button is clicked', async () => {
    render(<Sidebar />)
    await userEvent.click(screen.getAllByText('Cerrar sesión')[0])
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
