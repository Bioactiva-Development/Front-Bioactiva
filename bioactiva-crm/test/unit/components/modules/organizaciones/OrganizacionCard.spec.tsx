import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrganizacionCard } from '@/components/modules/organizaciones/OrganizacionCard'
import { Organizacion } from '@/types/organizacion.types'
import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'

const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('lucide-react', () => ({
  ExternalLink: () => <span data-testid="external-link-icon" />,
}))

jest.mock('@/lib/constants/routes', () => ({
  ROUTES: { organizacion: (id: string) => `/organizaciones/${id}` },
}))

jest.mock('@/lib/utils/organizacion.utils', () => ({
  formatSector: (s: unknown) => s,
  formatTamano: (t: unknown) => t,
}))

const baseOrg: Organizacion = {
  id: '1',
  codigo_cliente: 'CLI-001',
  nombre: 'Empresa SAC',
  nombre_comercial: 'Empresa SAC',
  sub_area: 'Lima',
  ruc: '20123456789',
  tipo: TipoEmpresa.Privada,
  sector: Sector.TECNOLOGIA,
  tamano: TamanoEmpresa.Mediana,
  actividad_economica: 'Software',
  id_author: 1,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('modules/organizaciones/OrganizacionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nombre "Empresa SAC"', () => {
    render(<OrganizacionCard organizacion={baseOrg} />)
    expect(screen.getByText('Empresa SAC')).toBeInTheDocument()
  })

  it('renders initial letter in circle (E)', () => {
    render(<OrganizacionCard organizacion={baseOrg} />)
    expect(screen.getByText('E')).toBeInTheDocument()
  })

  it('renders RUC', () => {
    render(<OrganizacionCard organizacion={baseOrg} />)
    expect(screen.getByText('20123456789')).toBeInTheDocument()
  })

  it('renders "Sin RUC" when ruc is null', () => {
    const org: Organizacion = { ...baseOrg, ruc: null as unknown as string | undefined }
    render(<OrganizacionCard organizacion={org} />)
    expect(screen.getByText('Sin RUC')).toBeInTheDocument()
  })

  it('renders sector', () => {
    render(<OrganizacionCard organizacion={baseOrg} />)
    expect(screen.getByText('TECNOLOGIA')).toBeInTheDocument()
  })

  it('renders actividad_economica', () => {
    render(<OrganizacionCard organizacion={baseOrg} />)
    expect(screen.getByText(/Software/)).toBeInTheDocument()
  })

  it('renders tamano badge with formatTamano', () => {
    render(<OrganizacionCard organizacion={baseOrg} />)
    expect(screen.getByText('Mediana')).toBeInTheDocument()
  })

  it('renders sub_area', () => {
    render(<OrganizacionCard organizacion={baseOrg} />)
    expect(screen.getByText('Lima')).toBeInTheDocument()
  })

  it('renders ExternalLink button', () => {
    render(<OrganizacionCard organizacion={baseOrg} />)
    expect(screen.getByTestId('external-link-icon')).toBeInTheDocument()
  })

  it('clicking row calls router.push with correct org URL', async () => {
    const user = userEvent.setup()
    render(<OrganizacionCard organizacion={baseOrg} />)
    const row = screen.getByText('E').closest('tr')!
    await user.click(row)
    expect(mockRouterPush).toHaveBeenCalledWith('/organizaciones/1')
  })

  it('clicking external link button does not trigger row click (e.stopPropagation)', async () => {
    const user = userEvent.setup()
    render(<OrganizacionCard organizacion={baseOrg} />)
    const button = screen.getByTestId('external-link-icon').closest('button')!
    await user.click(button)
    // Button click invokes handleVerDetalle once (td's stopPropagation prevents row handler)
    expect(mockRouterPush).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledWith('/organizaciones/1')
  })

  it('does NOT render sub_area paragraph when sub_area is undefined', () => {
    const org: Organizacion = { ...baseOrg, sub_area: undefined }
    render(<OrganizacionCard organizacion={org} />)
    expect(screen.queryByText('Lima')).not.toBeInTheDocument()
  })
})
