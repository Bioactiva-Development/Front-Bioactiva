import { render, screen } from '@testing-library/react'
import { KanbanBoard, PipelineColumns } from '@/components/modules/pipeline/KanbanBoard'
import { PipelineColumn } from '@/hooks/pipeline/useLeads'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

// Capturamos el handler onDragEnd para probar la lógica de mover sin un drag real.
const mockDnd: { onDragEnd?: (event: unknown) => void } = {}

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: unknown) => void }) => {
    mockDnd.onDragEnd = onDragEnd
    return <div>{children}</div>
  },
  PointerSensor: jest.fn(),
  pointerWithin: jest.fn(),
  useSensor: jest.fn(),
  useSensors: () => [],
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

const col = (total: number): PipelineColumn => ({
  leads: [],
  total,
  isLoading: false,
  isError: false,
  hasMore: false,
  loadingMore: false,
  cargarMas: jest.fn(),
})

const columnas: PipelineColumns = {
  prospecto: col(2),
  ofertado: col(1),
  cierreVenta: col(0),
  cierreSinVenta: col(0),
}

describe('modules/pipeline/KanbanBoard', () => {
  it('renders the four pipeline columns in order', () => {
    render(
      <KanbanBoard
        columnas={columnas}
        onClickLead={jest.fn()}
        onMoveLead={jest.fn()}
      />
    )

    const titulos = ['En prospecto', 'Ofertado', 'Cierre con venta', 'Cierre sin venta']
    titulos.forEach((t) => expect(screen.getByText(t)).toBeInTheDocument())
  })

  it('calls onMoveLead when a lead is dropped on a different column', () => {
    const onMoveLead = jest.fn()
    render(<KanbanBoard columnas={columnas} onClickLead={jest.fn()} onMoveLead={onMoveLead} />)

    const lead = { id: 1, estado: LeadState.Prospecto } as Lead
    mockDnd.onDragEnd?.({
      active: { data: { current: { lead } } },
      over: { data: { current: { estado: LeadState.Ofertado } } },
    })

    expect(onMoveLead).toHaveBeenCalledWith(lead, LeadState.Ofertado)
  })

  it('ignores a drop on the same column', () => {
    const onMoveLead = jest.fn()
    render(<KanbanBoard columnas={columnas} onClickLead={jest.fn()} onMoveLead={onMoveLead} />)

    const lead = { id: 1, estado: LeadState.Prospecto } as Lead
    mockDnd.onDragEnd?.({
      active: { data: { current: { lead } } },
      over: { data: { current: { estado: LeadState.Prospecto } } },
    })

    expect(onMoveLead).not.toHaveBeenCalled()
  })
})
