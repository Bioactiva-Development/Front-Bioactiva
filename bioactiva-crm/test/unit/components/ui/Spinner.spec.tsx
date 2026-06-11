import { render, screen } from '@testing-library/react'
import { Spinner } from '@/components/ui/Spinner/Spinner'

describe('ui/Spinner', () => {
  it('renders with default md size', () => {
    const { container } = render(<Spinner />)
    expect(screen.getByLabelText('Cargando')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('w-8', 'h-8', 'border-3')
  })

  it('renders with sm size', () => {
    const { container } = render(<Spinner size="sm" />)
    expect(container.firstChild).toHaveClass('w-4', 'h-4', 'border-2')
  })

  it('renders with lg size', () => {
    const { container } = render(<Spinner size="lg" />)
    expect(container.firstChild).toHaveClass('w-12', 'h-12', 'border-4')
  })

  it('applies custom className', () => {
    const { container } = render(<Spinner className="my-custom-class" />)
    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  it('has animate-spin class', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toHaveClass('animate-spin')
  })
})
