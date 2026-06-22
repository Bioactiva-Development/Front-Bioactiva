import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from '@/components/layout/Navbar/Navbar'
import { RolUsuario } from '@/types/enums'

const mockLogout = jest.fn()
const mockToggleSidebar = jest.fn()
const mockRouterPush = jest.fn()

const mockUseAuthStore = jest.fn()
const mockUseUIStore = jest.fn()
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
  usePathname: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}))

const testUser = {
  id: 1,
  nombres: 'Karien',
  apellidos: 'Diaz',
  correo: 'kdiaz@bioactiva.pe',
  rol: RolUsuario.Administrador,
}

function defaultMocks(overrides: Record<string, unknown> = {}) {
  mockUseAuthStore.mockReturnValue({ usuario: testUser })
  mockUseUIStore.mockReturnValue({
    toggleSidebar: mockToggleSidebar,
    ...overrides,
  })
  mockUseRouter.mockReturnValue({ push: mockRouterPush, replace: jest.fn(), prefetch: jest.fn() })
}

describe('layout/Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    defaultMocks()
  })

  it('renders user initials', () => {
    render(<Navbar />)
    expect(screen.getByText('KD')).toBeInTheDocument()
  })

  it('renders user full name', () => {
    render(<Navbar />)
    expect(screen.getByText('Karien Diaz')).toBeInTheDocument()
  })

  it('renders role label for admin', () => {
    render(<Navbar />)
    expect(screen.getByText('Administrador')).toBeInTheDocument()
  })

  it('renders role label for worker', () => {
    mockUseAuthStore.mockReturnValue({
      usuario: { ...testUser, rol: RolUsuario.Trabajador },
    })
    render(<Navbar />)
    expect(screen.getByText('Trabajador')).toBeInTheDocument()
  })

  it('renders default initial when usuario is null', () => {
    mockUseAuthStore.mockReturnValue({ usuario: null })
    render(<Navbar />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('toggles sidebar when menu button is clicked', async () => {
    render(<Navbar />)
    const menuBtns = screen.getAllByRole('button')
    const sidebarBtn = menuBtns.find(b => b.querySelector('.lucide-menu'))
    expect(sidebarBtn).toBeInTheDocument()
    if (sidebarBtn) {
      await userEvent.click(sidebarBtn)
      expect(mockToggleSidebar).toHaveBeenCalledTimes(1)
    }
  })

  it('hides notification dot when pendientes is 0', () => {
    const { container } = render(<Navbar />)
    expect(container.querySelector('.bg-red-500')).not.toBeInTheDocument()
  })

  it('opens user menu on click', async () => {
    render(<Navbar />)
    const profileArea = screen.getByText('Karien Diaz').closest('button')
    expect(profileArea).toBeInTheDocument()
    if (profileArea) {
      await userEvent.click(profileArea)
      expect(screen.getByText('Mi perfil')).toBeInTheDocument()
    }
  })

  it('navigates to perfil when Mi perfil is clicked', async () => {
    render(<Navbar />)
    const profileArea = screen.getByText('Karien Diaz').closest('button')
    if (profileArea) {
      await userEvent.click(profileArea)
      await userEvent.click(screen.getByText('Mi perfil'))
      expect(mockRouterPush).toHaveBeenCalledWith('/perfil')
    }
  })

  it('calls logout when Cerrar sesión is clicked', async () => {
    render(<Navbar />)
    const profileArea = screen.getByText('Karien Diaz').closest('button')
    if (profileArea) {
      await userEvent.click(profileArea)
      await userEvent.click(screen.getByText('Cerrar sesión'))
      expect(mockLogout).toHaveBeenCalledTimes(1)
    }
  })

  it('closes menu when clicking outside', async () => {
    render(<Navbar />)
    const profileArea = screen.getByText('Karien Diaz').closest('button')
    if (profileArea) {
      await userEvent.click(profileArea)
      expect(screen.getByText('Mi perfil')).toBeInTheDocument()
      await userEvent.click(document.body)
      expect(screen.queryByText('Mi perfil')).not.toBeInTheDocument()
    }
  })



  it('renders email in user menu when open', async () => {
    render(<Navbar />)
    const profileBtn = screen.getByText('Karien Diaz').closest('button')
    expect(profileBtn).toBeInTheDocument()
    if (profileBtn) {
      await userEvent.click(profileBtn)
      expect(screen.getByText('kdiaz@bioactiva.pe')).toBeInTheDocument()
    }
  })
})
