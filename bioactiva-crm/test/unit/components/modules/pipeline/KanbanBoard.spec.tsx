import { render, screen } from '@testing-library/react'
import { KanbanBoard, PipelineColumns } from '@/components/modules/pipeline/KanbanBoard'
import { PipelineColumn } from '@/hooks/pipeline/useLeads'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

// Capturamos el handler onDrop para probar la lógica de mover sin un drag real.
let capturedOnDrop: ((args: unknown) => void) | undefined

jest.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable:             jest.fn(() => jest.fn()),
  dropTargetForElements: jest.fn(() => jest.fn()),
  monitorForElements:    jest.fn((opts: { onDrop?: (args: unknown) => void }) => {
    capturedOnDrop = opts.onDrop
    return jest.fn()
  }),
}))
jest.mock('lucide-react', () => new Proxy({}, { get: () => () => null }))

const col = (total: number): PipelineColumn => ({
  leads:      [],
  total,
  isLoading:  false,
  isError:    false,
  hasMore:    false,
  loadingMore: false,
  cargarMas:  jest.fn(),
})

const columnas: PipelineColumns = {
  prospecto:      col(2),
  ofertado:       col(1),
  cierreVenta:    col(0),
  cierreSinVenta: col(0),
}

describe('modules/pipeline/KanbanBoard', () => {
  beforeEach(() => { capturedOnDrop = undefined })

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
    capturedOnDrop?.({
      source:   { data: { lead } },
      location: { current: { dropTargets: [{ data: { estado: LeadState.Ofertado } }] } },
    })

    expect(onMoveLead).toHaveBeenCalledWith(lead, LeadState.Ofertado)
  })

  it('ignores a drop on the same column', () => {
    const onMoveLead = jest.fn()
    render(<KanbanBoard columnas={columnas} onClickLead={jest.fn()} onMoveLead={onMoveLead} />)

    const lead = { id: 1, estado: LeadState.Prospecto } as Lead
    capturedOnDrop?.({
      source:   { data: { lead } },
      location: { current: { dropTargets: [{ data: { estado: LeadState.Prospecto } }] } },
    })

    expect(onMoveLead).not.toHaveBeenCalled()
  })

  it('ignores a drop with no drop target', () => {
    const onMoveLead = jest.fn()
    render(<KanbanBoard columnas={columnas} onClickLead={jest.fn()} onMoveLead={onMoveLead} />)

    const lead = { id: 1, estado: LeadState.Prospecto } as Lead
    capturedOnDrop?.({
      source:   { data: { lead } },
      location: { current: { dropTargets: [] } },
    })

    expect(onMoveLead).not.toHaveBeenCalled()
  })
})
