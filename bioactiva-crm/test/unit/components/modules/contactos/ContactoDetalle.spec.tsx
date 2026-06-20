import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactoDetalle } from '@/components/modules/contactos/ContactoDetalle'
import { Contacto } from '@/types/contacto.types'
import { Lead } from '@/types/lead.types'

const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), prefetch: jest.fn() }),
}))

jest.mock('@/lib/constants/routes', () => ({
  ROUTES: {
    contactos: '/contactos',
    pipeline: '/pipeline',
    lead: (id: number) => `/pipeline/${id}`,
  },
}))

jest.mock('lucide-react', () => ({
  ArrowLeft: () => null,
  Pencil: () => null,
  Mail: () => null,
  Phone: () => null,
  Building2: () => null,
  FileText: () => null,
  Loader2: () => null,
}))

const baseContacto: Contacto = {
  id: 1,
  nombres: 'Juan',
  apellidos: 'Pérez',
  vocativo: 'Sr',
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

const mockLead: Lead = {
  id: 1,
  codigo: 'L-001',
  id_org: 'org-1',
  estado: 'En prospecto' as Lead['estado'],
  servicio_interes: 'Servicio de consultoría',
  id_encargado: 1,
  id_author: 1,
  created_at: '2025-01-15T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
  encargado_nombre: 'Carlos López',
}

const defaultProps = {
  contacto: baseContacto,
  leads: [],
  onEditar: jest.fn(),
  onCambiarEstado: jest.fn(),
  isCambiandoEstado: false,
}

describe('modules/contactos/ContactoDetalle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nombres and apellidos in header', () => {
    render(<ContactoDetalle {...defaultProps} />)
    expect(screen.getByText('Sr. Juan Pérez')).toBeInTheDocument()
  })

  it('renders initial circle with correct letters', () => {
    render(<ContactoDetalle {...defaultProps} />)
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('renders Vigente badge when estado_correo is VIGENTE', () => {
    render(<ContactoDetalle {...defaultProps} />)
    expect(screen.getByText('Vigente')).toBeInTheDocument()
  })

  it('renders Vencido badge when estado_correo is VENCIDO', () => {
    const c: Contacto = { ...baseContacto, estado_correo: 'VENCIDO' }
    render(<ContactoDetalle {...defaultProps} contacto={c} />)
    expect(screen.getByText('Vencido')).toBeInTheDocument()
  })

  it('renders Volver button that navigates to contactos route', async () => {
    render(<ContactoDetalle {...defaultProps} />)
    await userEvent.click(screen.getByText('Volver a Contactos'))
    expect(mockRouterPush).toHaveBeenCalledWith('/contactos')
  })

  it('renders Editar button that calls onEditar', async () => {
    const onEditar = jest.fn()
    render(<ContactoDetalle {...defaultProps} onEditar={onEditar} />)
    await userEvent.click(screen.getByText('Editar'))
    expect(onEditar).toHaveBeenCalled()
  })

  it('renders Marcar como Vencido when estado is VIGENTE', () => {
    render(<ContactoDetalle {...defaultProps} />)
    expect(screen.getByText('Marcar como Vencido')).toBeInTheDocument()
  })

  it('renders Marcar como Vigente when estado is VENCIDO', () => {
    const c: Contacto = { ...baseContacto, estado_correo: 'VENCIDO' }
    render(<ContactoDetalle {...defaultProps} contacto={c} />)
    expect(screen.getByText('Marcar como Vigente')).toBeInTheDocument()
  })

  it('clicking onCambiarEstado button calls onCambiarEstado', async () => {
    const onCambiarEstado = jest.fn()
    render(<ContactoDetalle {...defaultProps} onCambiarEstado={onCambiarEstado} />)
    await userEvent.click(screen.getByText('Marcar como Vencido'))
    expect(onCambiarEstado).toHaveBeenCalled()
  })

  it('shows loader when isCambiandoEstado is true', () => {
    render(<ContactoDetalle {...defaultProps} isCambiandoEstado={true} />)
    expect(screen.getByRole('button', { name: /marcar como vencido/i })).toBeDisabled()
  })

  it('renders organizacion_nombre', () => {
    render(<ContactoDetalle {...defaultProps} />)
    expect(screen.getByText('Empresa SAC')).toBeInTheDocument()
  })

  it('renders correo', () => {
    render(<ContactoDetalle {...defaultProps} />)
    expect(screen.getByText('jperez@empresa.com')).toBeInTheDocument()
  })

  it('renders Sin leads asociados when leads is empty', () => {
    render(<ContactoDetalle {...defaultProps} />)
    expect(screen.getByText('Sin leads asociados.')).toBeInTheDocument()
  })

  it('renders leads with servicio_interes and estado when leads is not empty', () => {
    render(<ContactoDetalle {...defaultProps} leads={[mockLead]} />)
    expect(screen.getByText('Servicio de consultoría')).toBeInTheDocument()
    expect(screen.getByText('En prospecto')).toBeInTheDocument()
  })

  it('renders InfoItem only when valor is provided (not null/undefined)', () => {
    const cSinOrg: Contacto = { ...baseContacto, organizacion_nombre: undefined }
    render(<ContactoDetalle {...defaultProps} contacto={cSinOrg} />)
    expect(screen.queryByText('Organización')).not.toBeInTheDocument()
  })

  it('navigates to lead route when a lead is clicked', async () => {
    render(<ContactoDetalle {...defaultProps} leads={[mockLead]} />)
    await userEvent.click(screen.getByText('Servicio de consultoría'))
    expect(mockRouterPush).toHaveBeenCalledWith('/pipeline/1')
  })
})
