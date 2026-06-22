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
  vocativo: 'SR' as any,
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
    expect(screen.getAllByText('JP').length).toBeGreaterThan(0)
  })

  it('renders full name with vocativo', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getAllByText('Sr. Juan Pérez').length).toBeGreaterThan(0)
  })

  it('renders full name without vocativo', () => {
    const c: Contacto = { ...baseContacto, vocativo: undefined }
    render(<ContactoCard contacto={c} />)
    expect(screen.getAllByText('Juan Pérez').length).toBeGreaterThan(0)
  })

  it('renders cargo', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getAllByText('Gerente General').length).toBeGreaterThan(0)
  })

  it('renders organizacion_nombre', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getAllByText('Empresa SAC').length).toBeGreaterThan(0)
  })

  it('renders correo', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getAllByText('jperez@empresa.com').length).toBeGreaterThan(0)
  })

  it('renders telefono', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getAllByText('999888777').length).toBeGreaterThan(0)
  })

  it('renders fallback for missing telefono', () => {
    const c: Contacto = { ...baseContacto, telefono: null }
    render(<ContactoCard contacto={c} />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('shows Vigente badge for VIGENTE estado_correo', () => {
    render(<ContactoCard contacto={baseContacto} />)
    expect(screen.getAllByText('Vigente').length).toBeGreaterThan(0)
  })

  it('shows Vencido badge for VENCIDO estado_correo', () => {
    const c: Contacto = { ...baseContacto, estado_correo: 'VENCIDO' }
    render(<ContactoCard contacto={c} />)
    expect(screen.getAllByText('Vencido').length).toBeGreaterThan(0)
  })

  it('calls router.push when clicked', async () => {
    render(<ContactoCard contacto={baseContacto} />)
    const row = screen.getAllByText('JP')[0].closest('tr')
    expect(row).toBeInTheDocument()
    if (row) {
      await userEvent.click(row)
      expect(mockRouterPush).toHaveBeenCalledWith('/contactos/1')
    }
  })
})
