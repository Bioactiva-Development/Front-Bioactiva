import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KanbanColumn } from '@/components/modules/pipeline/KanbanColumn'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

jest.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable:             jest.fn(() => jest.fn()),
  dropTargetForElements: jest.fn(() => jest.fn()),
  monitorForElements:    jest.fn(() => jest.fn()),
}))
jest.mock('lucide-react', () => new Proxy({}, { get: () => () => null }))
jest.mock('@/hooks/cotizaciones/useCotizaciones', () => ({
  useCotizacionesPorLead: () => ({ data: [] }),
}))

const makeLead = (id: number): Lead => ({
  id,
  codigo: `L-${id}`,
  id_org: 'o',
  estado: LeadState.Prospecto,
  servicio_interes: `Servicio ${id}`,
  id_encargado: 1,
  id_author: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  organizacion_nombre: `Org ${id}`,
})

const baseProps = {
  titulo:      'En prospecto',
  estado:      LeadState.Prospecto,
  color:       'bg-gray-400',
  overClasses: 'bg-gray-50 border-gray-300 ring-gray-200',
  onClickLead: jest.fn(),
}

describe('modules/pipeline/KanbanColumn', () => {
  it('renders the column title', () => {
    render(<KanbanColumn {...baseProps} leads={[makeLead(1)]} />)
    expect(screen.getByText('En prospecto')).toBeInTheDocument()
  })

  it('does not render a per-state lead counter', () => {
    render(<KanbanColumn {...baseProps} leads={[makeLead(1), makeLead(2)]} />)
    // El badge de conteo por estado se removió (no mapeado en backend).
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  it('renders the empty state', () => {
    render(<KanbanColumn {...baseProps} leads={[]} />)
    expect(screen.getByText('Sin leads')).toBeInTheDocument()
  })

  it('renders a "Cargar más" button and calls onCargarMas', async () => {
    const onCargarMas = jest.fn()
    render(
      <KanbanColumn
        {...baseProps}
        leads={[makeLead(1)]}
        hasMore
        onCargarMas={onCargarMas}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /Cargar más/i }))
    expect(onCargarMas).toHaveBeenCalled()
  })

  it('does not render "Cargar más" when there are no more pages', () => {
    render(<KanbanColumn {...baseProps} leads={[makeLead(1)]} hasMore={false} />)
    expect(screen.queryByText(/Cargar más/i)).not.toBeInTheDocument()
  })
})
