import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '@/components/ui/Modal/Modal'

describe('ui/Modal', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    )
    expect(container.innerHTML).toBe('')
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })

  it('renders children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    )
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Modal Title">
        <p>Contenido</p>
      </Modal>,
    )
    expect(screen.getByText('Modal Title')).toBeInTheDocument()
  })

  it('does not render title section when no title', () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    )
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', async () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    )

    const backdrop = screen.getByLabelText('Cerrar modal')
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when title close button is clicked', async () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Título">
        <p>Contenido</p>
      </Modal>,
    )

    const closeButtons = screen.getAllByRole('button')
    const titleCloseButton = closeButtons[1]
    await userEvent.click(titleCloseButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('applies default md size class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    )
    expect(container.querySelector('.max-w-2xl')).toBeInTheDocument()
  })

  it('applies custom size class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} size="sm">
        <p>Contenido</p>
      </Modal>,
    )
    expect(container.querySelector('.max-w-md')).toBeInTheDocument()
    expect(container.querySelector('.max-w-xl')).not.toBeInTheDocument()
  })
})
