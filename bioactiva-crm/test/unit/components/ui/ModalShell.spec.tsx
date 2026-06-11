import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModalShell } from '@/components/ui/ModalShell/ModalShell'

describe('ui/ModalShell', () => {
  it('renders children', () => {
    render(<ModalShell onClose={jest.fn()}><p>Contenido</p></ModalShell>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = jest.fn()
    render(<ModalShell onClose={onClose}><p>Contenido</p></ModalShell>)

    const backdrop = screen.getByLabelText('Cerrar modal')
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses default maxWidth md', () => {
    render(<ModalShell onClose={jest.fn()}><p>Contenido</p></ModalShell>)

    const content = screen.getByText('Contenido').closest('div[class*="max-w-md"]')
    expect(content).toBeInTheDocument()
  })

  it('applies maxWidth sm when specified', () => {
    const { container } = render(
      <ModalShell onClose={jest.fn()} maxWidth="sm"><p>Contenido</p></ModalShell>,
    )
    expect(container.querySelector('.max-w-sm')).toBeInTheDocument()
  })
})
