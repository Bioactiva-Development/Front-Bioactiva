import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactoCard } from '@/components/modules/contactos/ContactoCard'
import { Contacto } from '@/types/contacto.types'

const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}))

const baseContacto: Contacto = {
  id: 1,
  nombres: 'Juan',
  apellidos: 'Pérez',
  vocativo: 'Sr' as any,
  cargo: 'Gerente General',
  correo: 'jperez@empresa.com',
  telefono: '999888777',
  idOrganizacion: 'org-1',
  idAuthor: 1,
  estado_correo: 'VIGENTE',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  organizacion_nombre: 'Empresa SAC',
}

describe('modules/contactos/ContactoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders initials', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('renders full name with vocativo', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getByText('Sr. Juan Pérez')).toBeInTheDocument()
  })

  it('renders full name without vocativo', () => {
    const c: Contacto = { ...baseContacto, vocativo: undefined }
    render(<ContactoCard contacto={c} />)
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('renders cargo', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getByText('Gerente General')).toBeInTheDocument()
  })

  it('renders organizacion_nombre', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getByText('Empresa SAC')).toBeInTheDocument()
  })

  it('renders correo', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getByText('jperez@empresa.com')).toBeInTheDocument()
  })

  it('renders telefono', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getByText('999888777')).toBeInTheDocument()
  })

  it('renders fallback for missing telefono', () => {
    const c: Contacto = { ...baseContacto, telefono: null }
    render(<ContactoCard contacto={c} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows Activo badge for VIGENTE estado_correo', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('shows Inactivo badge for VENCIDO estado_correo', () => {
    const c: Contacto = { ...baseContacto, estado_correo: 'VENCIDO' }
    render(<ContactoCard contacto={c} />)
    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('calls router.push when clicked', async () => {
    render(<ContactoCard contacto={baseContacto} />)
    const row = screen.getByText('JP').closest('tr')
    expect(row).toBeInTheDocument()
    if (row) {
      await userEvent.click(row)
      expect(mockRouterPush).toHaveBeenCalledWith('/contactos/1')
    }
  })
})
