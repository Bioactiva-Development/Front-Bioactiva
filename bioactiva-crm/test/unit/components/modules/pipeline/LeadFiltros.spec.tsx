import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeadFiltros } from '@/components/modules/pipeline/LeadFiltros'
import { LeadState } from '@/types/enums'

jest.mock('lucide-react', () => new Proxy({}, { get: () => () => null }))

jest.mock('@/hooks/organizaciones/useOrganizaciones', () => ({
  useOrganizaciones: () => ({ data: { data: [{ id: 'org-1', nombre: 'Altomayo' }] } }),
}))

const getUsuarios = jest.fn().mockResolvedValue({
  usuarios: [{ id: 3, nombres: 'Carlos', apellidos: 'López', correo: 'c@x.com' }],
})
jest.mock('@/services/modules/usuarios.service', () => ({
  usuariosService: { getUsuarios: (...args: unknown[]) => getUsuarios(...args) },
}))

describe('modules/pipeline/LeadFiltros', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the semáforo segmented options', () => {
    render(<LeadFiltros filtros={{}} onChange={jest.fn()} onLimpiar={jest.fn()} />)
    expect(screen.getByText('Todas')).toBeInTheDocument()
    expect(screen.getByText('Por vencer')).toBeInTheDocument()
    expect(screen.getByText('Vencidas')).toBeInTheDocument()
    expect(screen.getByText('Con alerta')).toBeInTheDocument()
  })

  it('emits alerta_actividad when a semáforo option is clicked', async () => {
    const onChange = jest.fn()
    render(<LeadFiltros filtros={{}} onChange={onChange} onLimpiar={jest.fn()} />)
    await userEvent.click(screen.getByText('Vencidas'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ alerta_actividad: 'VENCIDAS' })
    )
  })

  it('renders organization options from the hook', () => {
    render(<LeadFiltros filtros={{}} onChange={jest.fn()} onLimpiar={jest.fn()} />)
    expect(screen.getByText('Altomayo')).toBeInTheDocument()
  })

  it('loads responsables and emits an estado change', async () => {
    const onChange = jest.fn()
    render(<LeadFiltros filtros={{}} onChange={onChange} onLimpiar={jest.fn()} />)
    await waitFor(() => expect(getUsuarios).toHaveBeenCalled())

    const [estadoSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(estadoSelect, LeadState.Ofertado)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ estado: LeadState.Ofertado })
    )
  })

  it('shows a validation error when fechaHasta is earlier than fechaDesde', () => {
    render(<LeadFiltros filtros={{}} onChange={jest.fn()} onLimpiar={jest.fn()} />)
    fireEvent.change(screen.getByLabelText('Creados desde'), {
      target: { value: '2026-06-10' },
    })
    fireEvent.change(screen.getByLabelText('Creados hasta'), {
      target: { value: '2026-06-01' },
    })
    expect(screen.getByText(/debe ser igual o posterior/i)).toBeInTheDocument()
  })

  it('shows the leads total when provided', () => {
    render(<LeadFiltros filtros={{}} onChange={jest.fn()} onLimpiar={jest.fn()} total={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('emits the search term as it is typed', async () => {
    const onChange = jest.fn()
    render(<LeadFiltros filtros={{}} onChange={onChange} onLimpiar={jest.fn()} />)
    const input = screen.getByPlaceholderText(/Buscar por código/i)
    await userEvent.type(input, 'a')
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'a' }))
  })

  it('shows a "Limpiar" button that calls onLimpiar when there are active filters', async () => {
    const onLimpiar = jest.fn()
    render(
      <LeadFiltros
        filtros={{ estado: LeadState.Ofertado }}
        onChange={jest.fn()}
        onLimpiar={onLimpiar}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /Limpiar/i }))
    expect(onLimpiar).toHaveBeenCalled()
  })
})
