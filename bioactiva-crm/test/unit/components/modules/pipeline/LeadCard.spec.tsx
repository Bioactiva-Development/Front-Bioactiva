import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeadCard } from '@/components/modules/pipeline/LeadCard'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

jest.mock('@dnd-kit/core', () => ({
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

const baseLead: Lead = {
  id: 1,
  codigo: 'LEAD-2026-001',
  id_org: 'org-1',
  estado: LeadState.Prospecto,
  servicio_interes: 'Consultoría I+D',
  id_encargado: 3,
  id_author: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  organizacion_nombre: 'Altomayo',
  contacto_nombre: 'María Gómez',
  encargado_nombre: 'Carlos López',
}

describe('modules/pipeline/LeadCard', () => {
  it('renders the core lead fields', () => {
    render(<LeadCard lead={baseLead} onClick={jest.fn()} />)
    expect(screen.getByText('Altomayo')).toBeInTheDocument()
    expect(screen.getByText('María Gómez')).toBeInTheDocument()
    expect(screen.getByText('Consultoría I+D')).toBeInTheDocument()
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
  })

  it('uses a fixed height for every pipeline card', () => {
    render(<LeadCard lead={baseLead} onClick={jest.fn()} />)
    expect(screen.getByLabelText('Lead - Altomayo')).toHaveClass('h-56')
  })

  it.each([
    ['ROJO', 'Vencida'],
    ['AMARILLO', 'Por vencer'],
    ['VERDE', 'Al día'],
  ] as const)('renders the %s activity semáforo with its label', (alert, label) => {
    render(<LeadCard lead={{ ...baseLead, activity_alert: alert }} onClick={jest.fn()} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('does not render a semáforo when there is no activity_alert', () => {
    render(<LeadCard lead={baseLead} onClick={jest.fn()} />)
    expect(screen.queryByText('Al día')).not.toBeInTheDocument()
    expect(screen.queryByText('Por vencer')).not.toBeInTheDocument()
    expect(screen.queryByText('Vencida')).not.toBeInTheDocument()
  })

  it('calls onClick with the lead when the card is clicked', async () => {
    const onClick = jest.fn()
    render(<LeadCard lead={baseLead} onClick={onClick} />)
    await userEvent.click(screen.getByText('Altomayo'))
    expect(onClick).toHaveBeenCalledWith(baseLead)
  })

  it('emits a quick action without bubbling to the card click', async () => {
    const onClick = jest.fn()
    const onQuickAction = jest.fn()
    render(<LeadCard lead={baseLead} onClick={onClick} onQuickAction={onQuickAction} />)
    await userEvent.click(screen.getByTitle('Crear cotización'))
    expect(onQuickAction).toHaveBeenCalledWith(baseLead, 'cotizacion')
    expect(onClick).not.toHaveBeenCalled()
  })

  it.each([
    ['Ver detalle', 'detalle'],
    ['Editar lead', 'editar'],
    ['Registrar actividad', 'actividad'],
    ['Crear cotización', 'cotizacion'],
  ] as const)('emits the "%s" quick action', async (title, action) => {
    const onQuickAction = jest.fn()
    render(<LeadCard lead={baseLead} onClick={jest.fn()} onQuickAction={onQuickAction} />)
    await userEvent.click(screen.getByTitle(title))
    expect(onQuickAction).toHaveBeenCalledWith(baseLead, action)
  })

  it('does not render the programar seguimiento quick action', () => {
    render(<LeadCard lead={baseLead} onClick={jest.fn()} onQuickAction={jest.fn()} />)
    expect(screen.queryByTitle('Programar seguimiento')).not.toBeInTheDocument()
  })

  it('renders in overlay mode', () => {
    render(<LeadCard lead={baseLead} onClick={jest.fn()} isOverlay />)
    expect(screen.getByText('Altomayo')).toBeInTheDocument()
  })

  it('shows the legacy alert when tiene_alerta is set', () => {
    render(
      <LeadCard
        lead={{ ...baseLead, tiene_alerta: true, alerta_motivo: 'Sin seguimiento' }}
        onClick={jest.fn()}
      />
    )
    expect(screen.getByText('Sin seguimiento')).toBeInTheDocument()
  })
})
