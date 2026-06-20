import { render, screen } from '@testing-library/react'
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

// Stub any icon the page imports (lucide-react) without enumerating them, so
// adding/removing icons in the page never breaks this suite.
jest.mock('lucide-react', () =>
  new Proxy({}, { get: () => () => <svg /> })
)

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
  periodEnd: '2027-01-01',
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
    if (btn.className.includes('bg-emerald-700')) {
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

  it('renders subtitle "BioActiva CRM"', () => {
    renderPage()
    expect(screen.getByText('BioActiva CRM')).toBeInTheDocument()
  })

  it('renders year selector with 2024, 2025, 2026 options', () => {
    renderPage()
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveValue('2024')
    expect(options[1]).toHaveValue('2025')
    expect(options[2]).toHaveValue('2026')
  })

  it('renders period tabs', () => {
    renderPage()
    expect(screen.getByText('AÑO COMPLETO')).toBeInTheDocument()
    expect(screen.getByText('1ER TRIMESTRE')).toBeInTheDocument()
    expect(screen.getByText('2DO TRIMESTRE')).toBeInTheDocument()
    expect(screen.getByText('3ER TRIMESTRE')).toBeInTheDocument()
    expect(screen.getByText('4TO TRIMESTRE')).toBeInTheDocument()
  })

  it('renders "Reiniciar" button', () => {
    renderPage()
    expect(screen.getByText('Reiniciar')).toBeInTheDocument()
  })

  it('renders all KPI cards with labels when metrics are loaded', () => {
    mockUseDashboardMetrics.mockReturnValue({ data: mockMetrics, isLoading: false, isError: false })
    renderPage()
    expect(screen.getByText('Leads generados')).toBeInTheDocument()
    expect(screen.getByText('Tasa de conversión')).toBeInTheDocument()
    expect(screen.getByText('Propuesta → Venta')).toBeInTheDocument()
    expect(screen.getByText('Ticket promedio')).toBeInTheDocument()
    expect(screen.getByText('Tiempo promedio de cierre')).toBeInTheDocument()
    expect(screen.getByText('Tiempo en etapa propuesta')).toBeInTheDocument()
    expect(screen.getByText('Seguimientos por lead')).toBeInTheDocument()
    expect(screen.getByText('Leads sin avance')).toBeInTheDocument()
    expect(screen.getByText('Monto en pipeline')).toBeInTheDocument()
    expect(screen.getByText('Ingresos cerrados')).toBeInTheDocument()
  })

  it('shows "..." for KPI values when metrics are loading', () => {
    mockUseDashboardMetrics.mockReturnValue({ data: null, isLoading: true, isError: false })
    renderPage()
    const kpiValues = screen.getAllByText('...')
    expect(kpiValues.length).toBeGreaterThanOrEqual(10)
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
    mockUseLeads.mockReturnValue({
      data: { data: [defaultLead] },
      isLoading: false,
      isError: false,
    })
    renderPage()
    expect(screen.getByText('Pipeline por etapa')).toBeInTheDocument()
  })

  it('renders cotizaciones section', () => {
    mockUseCotizaciones.mockReturnValue({
      data: { data: [defaultCotizacion] },
      isLoading: false,
      isError: false,
    })
    renderPage()
    expect(screen.getByText('Estado de cotizaciones')).toBeInTheDocument()
  })

  it('shows loading message "Cargando pipeline..." when leads loading', () => {
    mockUseLeads.mockReturnValue({ data: { data: [] }, isLoading: true, isError: false })
    renderPage()
    expect(screen.getByText('Cargando pipeline...')).toBeInTheDocument()
  })

  it('shows loading message "Cargando cotizaciones..." when cotizaciones loading', () => {
    mockUseCotizaciones.mockReturnValue({ data: { data: [] }, isLoading: true, isError: false })
    renderPage()
    expect(screen.getByText('Cargando cotizaciones...')).toBeInTheDocument()
  })

  it('shows error message when metrics error', () => {
    mockUseDashboardMetrics.mockReturnValue({ data: null, isLoading: false, isError: true })
    renderPage()
    expect(
      screen.getByText('No se pudieron cargar las métricas del dashboard.')
    ).toBeInTheDocument()
  })

  it('shows empty state when cotizaciones is empty', () => {
    mockUseCotizaciones.mockReturnValue({ data: { data: [] }, isLoading: false, isError: false })
    renderPage()
    expect(
      screen.getByText('Sin cotizaciones en el periodo seleccionado.')
    ).toBeInTheDocument()
  })

  it('clicking period tab triggers state change', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(getActiveTabText()).toContain('AÑO COMPLETO')
    await user.click(screen.getByText('1ER TRIMESTRE'))
    expect(getActiveTabText()).toContain('1ER TRIMESTRE')
  })

  it('clicking Reiniciar button resets period to anio', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(getActiveTabText()).toContain('AÑO COMPLETO')
    await user.click(screen.getByText('1ER TRIMESTRE'))
    expect(getActiveTabText()).toContain('1ER TRIMESTRE')
    await user.click(screen.getByText('Reiniciar'))
    expect(getActiveTabText()).toContain('AÑO COMPLETO')
  })
})
