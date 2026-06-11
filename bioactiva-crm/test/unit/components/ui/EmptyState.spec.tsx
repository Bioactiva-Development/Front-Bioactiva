import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'

describe('ui/EmptyState', () => {
  it('renders default title and description', () => {
    render(<EmptyState />)
    expect(screen.getByText('No hay resultados')).toBeInTheDocument()
    expect(screen.getByText('No se encontraron datos para mostrar.')).toBeInTheDocument()
  })

  it('renders custom title', () => {
    render(<EmptyState title="Sin leads" />)
    expect(screen.getByText('Sin leads')).toBeInTheDocument()
  })

  it('renders custom description', () => {
    render(<EmptyState description="No hay leads activos" />)
    expect(screen.getByText('No hay leads activos')).toBeInTheDocument()
  })

  it('renders action node', () => {
    render(<EmptyState action={<button>Crear</button>} />)
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })

  it('does not render action div when no action provided', () => {
    const { container } = render(<EmptyState />)
    expect(container.querySelector('.mt-2')).not.toBeInTheDocument()
  })

  it('renders Building2 icon', () => {
    const { container } = render(<EmptyState />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
