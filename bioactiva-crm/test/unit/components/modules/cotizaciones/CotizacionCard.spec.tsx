import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CotizacionCard } from '@/components/modules/cotizaciones/CotizacionCard'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'

const mockRouterPush = jest.fn()
const mockEnviar = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/hooks/cotizaciones/useCotizaciones', () => ({
  useEnviarCotizacion: () => ({ mutateAsync: mockEnviar, isPending: false }),
}))

const baseCotizacion: Cotizacion = {
  id: 1,
  codigo: 'COT-001',
  id_lead: 1,
  id_remitente: 1,
  fecha_cot: '2025-03-01',
  contacto_nombre: 'Juan Pérez',
  dirigido: 'Juan Pérez',
  nombre_servicio: 'Consultoría I+D',
  monto: 15000,
  tipo: TipoMoneda.Soles,
  estado: EstadoCot.Pendiente,
  id_author: 1,
  created_at: '2025-03-01T00:00:00Z',
  updated_at: '2025-03-01T00:00:00Z',
  lead_codigo: 'LEAD-001',
  periodo: 'Q1 2025',
  organizacion_nombre: 'Empresa SAC',
}

describe('modules/cotizaciones/CotizacionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderCard = (cotizacion: Cotizacion) =>
    render(<table><tbody><CotizacionCard cotizacion={cotizacion} /></tbody></table>)

  it('renders codigo', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('COT-001').length).toBeGreaterThan(0)
  })

  it('renders lead_codigo', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('LEAD-001').length).toBeGreaterThan(0)
  })

  it('renders periodo', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Q1 2025').length).toBeGreaterThan(0)
  })

  it('renders dirigido', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Juan Pérez').length).toBeGreaterThan(0)
  })

  it('renders organizacion_nombre', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Empresa SAC').length).toBeGreaterThan(0)
  })

  it('renders nombre_servicio', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Consultoría I+D').length).toBeGreaterThan(0)
  })

  it('formats monto with S/ symbol for Soles', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText(/S\/ 15,000/).length).toBeGreaterThan(0)
  })

  it('formats monto with $ symbol for Dolares', () => {
    const dolares: Cotizacion = { ...baseCotizacion, tipo: TipoMoneda.Dolares }
    renderCard(dolares)
    expect(screen.getAllByText(/\$ 15,000/).length).toBeGreaterThan(0)
  })

  it('renders estado badge', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
  })

  it('renders send button for Pendiente estado', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByTitle('Marcar como enviada').length).toBeGreaterThan(0)
  })

  it('hides send button for non-Pendiente estado', () => {
    const enviada: Cotizacion = { ...baseCotizacion, estado: EstadoCot.Enviada }
    renderCard(enviada)
    expect(screen.queryByTitle('Marcar como enviada')).not.toBeInTheDocument()
  })

  it('calls enviar when send button is clicked', async () => {
    renderCard(baseCotizacion)
    await userEvent.click(screen.getAllByTitle('Marcar como enviada')[0])
    expect(mockEnviar).toHaveBeenCalledWith(1)
  })

  it('calls router.push when row is clicked', async () => {
    renderCard(baseCotizacion)
    const row = screen.getAllByText('COT-001')[0].closest('tr')
    expect(row).toBeInTheDocument()
    if (row) {
      await userEvent.click(row)
      expect(mockRouterPush).toHaveBeenCalledWith('/cotizaciones/1')
    }
  })

  it('renders lead id fallback when lead_codigo is missing', () => {
    const sinCodigo: Cotizacion = { ...baseCotizacion, lead_codigo: undefined }
    renderCard(sinCodigo)
    expect(screen.getAllByText('#1').length).toBeGreaterThan(0)
  })
})
