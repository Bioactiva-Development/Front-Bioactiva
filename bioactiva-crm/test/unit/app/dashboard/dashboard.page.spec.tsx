import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockUseLeads = jest.fn()
const mockUseCotizaciones = jest.fn()
const mockUseDashboardMetrics = jest.fn()

jest.mock('@/hooks/pipeline/useLeads', () => ({
  useLeads: (...args: unknown[]) => mockUseLeads(...args),
}))

jest.mock('@/hooks/cotizaciones/useCotizaciones', () => ({
  useCotizaciones: (...args: unknown[]) => mockUseCotizaciones(...args),
}))

jest.mock('@/hooks/dashboard/useDashboardMetrics', () => ({
  useDashboardMetrics: (...args: unknown[]) => mockUseDashboardMetrics(...args),
}))

jest.mock('@phosphor-icons/react/dist/csr/Target', () => ({ TargetIcon: () => null }), { virtual: true })
jest.mock('@phosphor-icons/react/dist/csr/Percent', () => ({ PercentIcon: () => null }), { virtual: true })
jest.mock('@phosphor-icons/react/dist/csr/Clock', () => ({ ClockIcon: () => null }), { virtual: true })
jest.mock('@phosphor-icons/react/dist/csr/Hourglass', () => ({ HourglassIcon: () => null }), { virtual: true })
jest.mock('@phosphor-icons/react/dist/csr/Pulse', () => ({ PulseIcon: () => null }), { virtual: true })
jest.mock('@phosphor-icons/react/dist/csr/CurrencyDollar', () => ({ CurrencyDollarIcon: () => null }), { virtual: true })
jest.mock('@phosphor-icons/react/dist/csr/TrendUp', () => ({ TrendUpIcon: () => null }), { virtual: true })
jest.mock('@phosphor-icons/react/dist/csr/CalendarX', () => ({ CalendarXIcon: () => null }), { virtual: true })
jest.mock('@phosphor-icons/react/dist/csr/ChartLineUp', () => ({ ChartLineUpIcon: () => null }), { virtual: true })

jest.mock('lucide-react', () => {
  const icons = {
    RefreshCw: 'refresh-cw',
    ChevronDown: 'chevron-down',
    ChevronUp: 'chevron-up',
    Filter: 'filter',
    Calendar: 'calendar',
    Loader2: 'loader-2',
  }
  const result: Record<string, React.FC> = {}
  for (const [name] of Object.entries(icons)) {
    result[name] = () => <svg />
  }
  return result
})

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Legend: () => null,
}))

import DashboardPage from '@/app/(dashboard)/dashboard/page'

const mockMetrics = {
  totalLeads: 42,
  averageTicketAmount: { pen: 15500.5, usd: 4200.0 },
  conversionRate: 25.5,
  avgClosingTimeDays: 15.3,
  proposalToCloseRate: 60.0,
  avgProposalStageDays: 7.2,
  avgActivitiesPerLead: 3.5,
  pipelineTotalAmount: { pen: 250000.0, usd: 64000.0 },
  closedRevenue: { pen: 180000.0, usd: 48000.0 },
  stalledLeadPercentage: 12.8,
  periodStart: '2026-01-01',
  periodEnd: '2026-12-31',
}

const defaultLead = {
  id: 1,
  estado: 'En prospecto',
  created_at: '2026-02-15T00:00:00Z',
}

const defaultCotizacion = {
  id: 1,
  estado: 'Pendiente',
  fecha_cot: '2026-02-15',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

function renderPage() {
  return render(<DashboardPage />, { wrapper: createWrapper() })
}

function getActiveTabText() {
  const buttons = screen.getAllByRole('button')
  for (const btn of buttons) {
    if (btn.className.includes('bg-emerald-600')) {
      return btn.textContent
    }
  }
  return null
}

describe('dashboard/page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLeads.mockReturnValue({ data: { data: [] }, isLoading: false, isError: false })
    mockUseCotizaciones.mockReturnValue({ data: { data: [] }, isLoading: false, isError: false })
    mockUseDashboardMetrics.mockReturnValue({ data: null, isLoading: false, isError: false })
  })

  it('renders the header "Dashboard comercial"', () => {
    renderPage()
    expect(screen.getByText('Dashboard comercial')).toBeInTheDocument()
  })

  it('renders subtitle "Visión general del rendimiento comercial y seguimiento de KPIs"', () => {
    renderPage()
    expect(
      screen.getByText('Visión general del rendimiento comercial y seguimiento de KPIs')
    ).toBeInTheDocument()
  })

  it('does not render the active status and current date', () => {
    renderPage()
    expect(screen.queryByText(/Activo\s*·/)).not.toBeInTheDocument()
  })

  async function abrirFiltros() {
    const filtrosBtn = screen.getByText('Filtros')
    await userEvent.click(filtrosBtn)
  }

  it('renders years from the current year down to 2020 and selects the current year', async () => {
    renderPage()
    await abrirFiltros()
    const select = screen.getByRole('combobox')
    const currentYear = new Date().getFullYear()
    expect(select).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(currentYear - 2020 + 1)
    expect(options[0]).toHaveValue(String(currentYear))
    expect(options.at(-1)).toHaveValue('2020')
    expect(select).toHaveValue(String(currentYear))
  })

  it('uses the complete current year as the default date range', async () => {
    renderPage()
    await abrirFiltros()
    const currentYear = new Date().getFullYear()
    const inicio = screen.getByLabelText(/fecha inicio/i)
    const fin = screen.getByLabelText(/fecha fin/i)

    expect(inicio).toHaveValue(`01/01/${currentYear}`)
    expect(fin).toHaveValue(`31/12/${currentYear}`)
  })

  it('shows the date format next to each date label', async () => {
    renderPage()
    await abrirFiltros()

    expect(screen.getAllByText('DD/MM/YYYY')).toHaveLength(2)
  })

  it('opens the native date picker from the full calendar icon area', async () => {
    const user = userEvent.setup()
    const showPicker = jest.fn()
    Object.defineProperty(HTMLInputElement.prototype, 'showPicker', {
      configurable: true,
      value: showPicker,
    })

    renderPage()
    await abrirFiltros()
    await user.click(screen.getByRole('button', { name: /abrir calendario inicial/i }))

    expect(showPicker).toHaveBeenCalled()
  })

  it('fills both dates when a predefined quarter is selected', async () => {
    const user = userEvent.setup()
    renderPage()
    await abrirFiltros()
    const currentYear = new Date().getFullYear()
    await user.click(screen.getByText('1ER TRIMESTRE'))
    const inicio = screen.getByLabelText(/fecha inicio/i)
    const fin = screen.getByLabelText(/fecha fin/i)

    expect(inicio).toHaveValue(`01/01/${currentYear}`)
    expect(fin).toHaveValue(`31/03/${currentYear}`)
  })

  it('keeps the start date less than or equal to the end date', async () => {
    const user = userEvent.setup()
    renderPage()
    await abrirFiltros()
    const currentYear = new Date().getFullYear()
    await user.click(screen.getByText('1ER TRIMESTRE'))
    const inicio = screen.getByLabelText(/fecha inicio/i)
    const fin = screen.getByLabelText(/fecha fin/i)

    fireEvent.change(fin, { target: { value: `15/02/${currentYear}` } })
    fireEvent.change(inicio, { target: { value: `01/03/${currentYear}` } })
    expect(screen.getByLabelText(/fecha inicio/i)).toHaveValue(`01/03/${currentYear}`)
    expect(screen.getByLabelText(/fecha fin/i)).toHaveValue(`01/03/${currentYear}`)

    fireEvent.change(screen.getByLabelText(/fecha fin/i), {
      target: { value: `01/01/${currentYear}` },
    })
    expect(screen.getByLabelText(/fecha fin/i)).toHaveValue(`01/03/${currentYear}`)
  })

  it('activates an independent custom range when either date is edited', async () => {
    const user = userEvent.setup()
    renderPage()
    await abrirFiltros()
    const currentYear = new Date().getFullYear()
    await user.click(screen.getByText('1ER TRIMESTRE'))
    const inicio = screen.getByLabelText(/fecha inicio/i)
    const fin = screen.getByLabelText(/fecha fin/i)

    fireEvent.focus(inicio)
    expect(inicio.className).toContain('border-emerald-500')
    expect(fin.className).toContain('border-emerald-500')
    expect(getActiveTabText()).toBeNull()

    fireEvent.change(fin, { target: { value: `01/04/${currentYear}` } })
    expect(inicio).toHaveValue(`01/01/${currentYear}`)
    expect(fin).toHaveValue(`01/04/${currentYear}`)
    expect(screen.getByText(/RANGO PERSONALIZADO/)).toBeInTheDocument()
  })

  it('renders period tabs', async () => {
    renderPage()
    await abrirFiltros()
    expect(screen.getByText('AÑO COMPLETO')).toBeInTheDocument()
    expect(screen.getByText('1ER TRIMESTRE')).toBeInTheDocument()
    expect(screen.getByText('2DO TRIMESTRE')).toBeInTheDocument()
    expect(screen.getByText('3ER TRIMESTRE')).toBeInTheDocument()
    expect(screen.getByText('4TO TRIMESTRE')).toBeInTheDocument()
  })

  it('renders "Reiniciar" button', async () => {
    renderPage()
    await abrirFiltros()
    expect(screen.getByText('Reiniciar')).toBeInTheDocument()
  })

  it('renders all KPI cards with labels when metrics are loaded', () => {
    mockUseDashboardMetrics.mockReturnValue({ data: mockMetrics, isLoading: false, isError: false })
    renderPage()
    expect(screen.getByText('Leads generados')).toBeInTheDocument()
    expect(screen.getByText('Ticket promedio')).toBeInTheDocument()
    expect(screen.getByText('Monto en pipeline')).toBeInTheDocument()
    expect(screen.getByText('Ingresos cerrados')).toBeInTheDocument()
  })

  it('shows "..." for KPI values when metrics are loading', () => {
    mockUseDashboardMetrics.mockReturnValue({ data: null, isLoading: true, isError: false })
    renderPage()
    expect(screen.getByText('Cargando datos del periodo...')).toBeInTheDocument()
  })

  it('shows metrics loaded values through KPI cards', () => {
    mockUseDashboardMetrics.mockReturnValue({ data: mockMetrics, isLoading: false, isError: false })
    renderPage()
    expect(screen.getByText('42')).toBeInTheDocument()
    // Cada divisa se muestra por separado: S/ (PEN) y US$ (USD), sin sumarse.
    expect(screen.getByText(/S\/.*250/)).toBeInTheDocument()
    expect(screen.getByText(/S\/.*180/)).toBeInTheDocument()
    expect(screen.getByText(/US\$.*64,000/)).toBeInTheDocument()
    expect(screen.getByText(/US\$.*48,000/)).toBeInTheDocument()
  })

  it('renders pipeline section', () => {
    mockUseDashboardMetrics.mockReturnValue({
      data: {
        ...mockMetrics,
        distribucionPipeline: [{ estado: 'EN_PROSPECTO', cantidad: 1 }],
      },
      isLoading: false,
      isError: false,
    })
    renderPage()
    expect(screen.getByText('Pipeline por etapa')).toBeInTheDocument()
  })

  it('renders cotizaciones section', () => {
    mockUseDashboardMetrics.mockReturnValue({
      data: {
        ...mockMetrics,
        distribucionCotizaciones: [{ estado: 'PENDIENTE', cantidad: 1 }],
      },
      isLoading: false,
      isError: false,
    })
    renderPage()
    expect(screen.getByText('Estado de cotizaciones')).toBeInTheDocument()
  })

  it('shows loading message "Cargando..." when metrics are loading', () => {
    mockUseDashboardMetrics.mockReturnValue({ data: null, isLoading: true, isError: false })
    renderPage()
    expect(screen.getByText('Cargando datos del periodo...')).toBeInTheDocument()
  })

  it('shows error message when metrics error', () => {
    mockUseDashboardMetrics.mockReturnValue({ data: null, isLoading: false, isError: true })
    renderPage()
    expect(
      screen.getByText('No se pudieron cargar las métricas del dashboard.')
    ).toBeInTheDocument()
  })

  it('shows the dashboard empty state when the selected period has no data', () => {
    mockUseCotizaciones.mockReturnValue({ data: { data: [] }, isLoading: false, isError: false })
    renderPage()
    expect(
      screen.getByText('No hay data para este periodo seleccionado')
    ).toBeInTheDocument()
    expect(screen.queryByText('Resultados comerciales')).not.toBeInTheDocument()
  })

  it('shows the empty state for a valid single-day period with no data', async () => {
    renderPage()
    await abrirFiltros()
    const currentYear = new Date().getFullYear()
    const fin = screen.getByLabelText(/fecha fin/i)

    fireEvent.change(fin, { target: { value: `01/01/${currentYear}` } })

    expect(
      screen.getByText('No hay data para este periodo seleccionado')
    ).toBeInTheDocument()
    expect(mockUseDashboardMetrics).toHaveBeenLastCalledWith({
      startDate: `${currentYear}-01-01T00:00:00.000Z`,
      endDate: `${currentYear}-01-01T23:59:59.999Z`,
    })
  })

  it('clicking period tab triggers state change', async () => {
    const user = userEvent.setup()
    renderPage()
    await abrirFiltros()
    expect(getActiveTabText()).toContain('AÑO COMPLETO')
    await user.click(screen.getByText('1ER TRIMESTRE'))
    expect(getActiveTabText()).toContain('1ER TRIMESTRE')
  })

  it('clicking Reiniciar button resets period to anio', async () => {
    const user = userEvent.setup()
    renderPage()
    await abrirFiltros()
    expect(getActiveTabText()).toContain('AÑO COMPLETO')
    await user.click(screen.getByText('1ER TRIMESTRE'))
    expect(getActiveTabText()).toContain('1ER TRIMESTRE')
    await user.click(screen.getByText('Reiniciar'))
    expect(getActiveTabText()).toContain('AÑO COMPLETO')
  })
})
