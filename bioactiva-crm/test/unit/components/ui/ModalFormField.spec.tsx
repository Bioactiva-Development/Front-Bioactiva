import { render, screen } from '@testing-library/react'
import { ModalFormField, modalInputCn } from '@/components/ui/ModalFormField/ModalFormField'

describe('ui/ModalFormField', () => {
  it('renders label and children', () => {
    render(
      <ModalFormField label="Nombre">
        <input data-testid="input" />
      </ModalFormField>,
    )
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByTestId('input')).toBeInTheDocument()
  })

  it('does not show error when no error prop', () => {
    const { container } = render(
      <ModalFormField label="Email">
        <input />
      </ModalFormField>,
    )
    expect(container.querySelector('.text-red-500')).not.toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(
      <ModalFormField label="Email" error="Campo requerido">
        <input />
      </ModalFormField>,
    )
    expect(screen.getByText('Campo requerido')).toBeInTheDocument()
    expect(screen.getByText('Campo requerido')).toHaveClass('text-red-500')
  })

  it('renders label as uppercase', () => {
    render(
      <ModalFormField label="Correo">
        <input />
      </ModalFormField>,
    )
    expect(screen.getByText('Correo')).toHaveClass('uppercase')
  })
})

describe('ui/modalInputCn', () => {
  it('returns error classes when hasError is true', () => {
    const classes = modalInputCn(true)
    expect(classes).toContain('border-red-400')
    expect(classes).toContain('focus:border-red-500')
  })

  it('returns normal classes when hasError is false', () => {
    const classes = modalInputCn(false)
    expect(classes).toContain('border-gray-200')
    expect(classes).toContain('focus:border-[#1C7E3C]')
  })
})
