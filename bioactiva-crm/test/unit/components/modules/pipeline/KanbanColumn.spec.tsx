import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KanbanColumn } from '@/components/modules/pipeline/KanbanColumn'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ isOver: false, setNodeRef: jest.fn() }),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    isDragging: false,
  }),
}))
jest.mock('@dnd-kit/utilities', () => ({ CSS: { Translate: { toString: () => '' } } }))
jest.mock('lucide-react', () => new Proxy({}, { get: () => () => null }))

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
  titulo: 'En prospecto',
  estado: LeadState.Prospecto,
  color: 'bg-gray-400',
  onClickLead: jest.fn(),
}

describe('modules/pipeline/KanbanColumn', () => {
  it('shows the total count from meta (not the loaded length)', () => {
    render(<KanbanColumn {...baseProps} leads={[makeLead(1)]} total={23} />)
    expect(screen.getByText('En prospecto')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
  })

  it('renders the empty state', () => {
    render(<KanbanColumn {...baseProps} leads={[]} total={0} />)
    expect(screen.getByText('Sin leads')).toBeInTheDocument()
  })

  it('renders a "Cargar más" button and calls onCargarMas', async () => {
    const onCargarMas = jest.fn()
    render(
      <KanbanColumn
        {...baseProps}
        leads={[makeLead(1)]}
        total={10}
        hasMore
        onCargarMas={onCargarMas}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /Cargar más/i }))
    expect(onCargarMas).toHaveBeenCalled()
  })

  it('does not render "Cargar más" when there are no more pages', () => {
    render(<KanbanColumn {...baseProps} leads={[makeLead(1)]} total={1} hasMore={false} />)
    expect(screen.queryByText(/Cargar más/i)).not.toBeInTheDocument()
  })
})
