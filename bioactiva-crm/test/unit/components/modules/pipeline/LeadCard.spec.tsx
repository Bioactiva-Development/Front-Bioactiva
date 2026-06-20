import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeadCard } from '@/components/modules/pipeline/LeadCard'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

jest.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable:             jest.fn(() => jest.fn()),
  dropTargetForElements: jest.fn(() => jest.fn()),
  monitorForElements:    jest.fn(() => jest.fn()),
}))
jest.mock('@/hooks/cotizaciones/useCotizaciones', () => ({
  useCotizacionesPorLead: jest.fn(() => ({ data: [] })),
}))
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
    expect(screen.getByText('Consultoría I+D')).toBeInTheDocument()
    expect(screen.getByText('María Gómez')).toBeInTheDocument()
    expect(screen.getByText('· Contacto')).toBeInTheDocument()
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
    expect(screen.getByText('Encargado')).toBeInTheDocument()
  })

  it('renders encargado initials in the avatar', () => {
    render(<LeadCard lead={baseLead} onClick={jest.fn()} />)
    expect(screen.getByText('CL')).toBeInTheDocument()
    expect(screen.getByTitle('Carlos López')).toBeInTheDocument()
  })

  it('shows "Por cotizar" badge only for EN_PROSPECTO leads', () => {
    render(<LeadCard lead={baseLead} onClick={jest.fn()} />)
    expect(screen.getByText('Por cotizar')).toBeInTheDocument()
  })

  it('does not show "Por cotizar" for non-prospecto leads', () => {
    render(<LeadCard lead={{ ...baseLead, estado: LeadState.Ofertado }} onClick={jest.fn()} />)
    expect(screen.queryByText('Por cotizar')).not.toBeInTheDocument()
  })

  it.each([
    ['SIN_ACTIVIDADES', 'Sin actividades'],
    ['PENDIENTE',       'Pendiente'],
    ['EN_RIESGO',       'En riesgo'],
    ['POR_VENCER',      'Por vencer'],
  ] as const)('renders the %s semáforo badge', (alert, label) => {
    render(<LeadCard lead={{ ...baseLead, activity_alert: alert }} onClick={jest.fn()} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('does not render a semáforo badge without activity_alert', () => {
    render(<LeadCard lead={baseLead} onClick={jest.fn()} />)
    expect(screen.queryByText('Sin actividades')).not.toBeInTheDocument()
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument()
    expect(screen.queryByText('En riesgo')).not.toBeInTheDocument()
    expect(screen.queryByText('Por vencer')).not.toBeInTheDocument()
  })

  it('calls onClick with the lead when the card is clicked', async () => {
    const onClick = jest.fn()
    render(<LeadCard lead={baseLead} onClick={onClick} />)
    await userEvent.click(screen.getByText('Altomayo'))
    expect(onClick).toHaveBeenCalledWith(baseLead)
  })

  it('calls onQuickAction "detalle" without bubbling to card click', async () => {
    const onClick       = jest.fn()
    const onQuickAction = jest.fn()
    render(<LeadCard lead={baseLead} onClick={onClick} onQuickAction={onQuickAction} />)
    await userEvent.click(screen.getByTitle('Ver detalle completo'))
    expect(onQuickAction).toHaveBeenCalledWith(baseLead, 'detalle')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders in overlay mode', () => {
    render(<LeadCard lead={baseLead} onClick={jest.fn()} isOverlay />)
    expect(screen.getByText('Altomayo')).toBeInTheDocument()
  })

  it('shows the tiene_alerta badge with the alert message', () => {
    render(
      <LeadCard
        lead={{ ...baseLead, tiene_alerta: true, alerta_motivo: '+30 días' }}
        onClick={jest.fn()}
      />
    )
    expect(screen.getByText('+30 días')).toBeInTheDocument()
  })
})
