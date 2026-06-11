import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModalHeader } from '@/components/ui/ModalHeader/ModalHeader'

describe('ui/ModalHeader', () => {
  const defaultProps = {
    icon: <span data-testid="custom-icon">★</span>,
    iconBg: 'bg-green-100',
    title: 'Mi Modal',
    onClose: jest.fn(),
  }

  it('renders title', () => {
    render(<ModalHeader {...defaultProps} />)
    expect(screen.getByText('Mi Modal')).toBeInTheDocument()
  })

  it('renders custom icon', () => {
    render(<ModalHeader {...defaultProps} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('applies icon background class', () => {
    const { container } = render(<ModalHeader {...defaultProps} />)
    const iconContainer = container.querySelector('.bg-green-100')
    expect(iconContainer).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    render(<ModalHeader {...defaultProps} />)
    expect(screen.queryByText(/subtle/i)).not.toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<ModalHeader {...defaultProps} subtitle="Descripción adicional" />)
    expect(screen.getByText('Descripción adicional')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn()
    render(<ModalHeader {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByRole('button')
    await userEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
