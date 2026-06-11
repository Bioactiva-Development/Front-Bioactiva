import { render, screen } from '@testing-library/react'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'

describe('layout/PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader titulo="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<PageHeader titulo="Dashboard" descripcion="Resumen del sistema" />)
    expect(screen.getByText('Resumen del sistema')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<PageHeader titulo="Dashboard" />)
    expect(container.querySelector('.text-gray-500')).not.toBeInTheDocument()
  })

  it('renders acciones when provided', () => {
    render(<PageHeader titulo="Dashboard" acciones={<button>Crear</button>} />)
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })

  it('does not render acciones container when not provided', () => {
    const { container } = render(<PageHeader titulo="Dashboard" />)
    expect(container.querySelector('.shrink-0')).not.toBeInTheDocument()
  })

  it('renders titulo as h1', () => {
    render(<PageHeader titulo="Pipeline" />)
    const heading = screen.getByText('Pipeline')
    expect(heading.tagName).toBe('H1')
    expect(heading).toHaveClass('text-xl', 'font-bold', 'text-gray-900')
  })
})
