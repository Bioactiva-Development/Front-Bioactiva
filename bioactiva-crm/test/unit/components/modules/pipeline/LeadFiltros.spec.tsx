import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeadFiltros } from '@/components/modules/pipeline/LeadFiltros'
import { LeadState } from '@/types/enums'

jest.mock('lucide-react', () => new Proxy({}, { get: () => () => null }))

jest.mock('@/hooks/organizaciones/useOrganizaciones', () => ({
  useOrganizaciones: () => ({ data: { data: [{ id: 'org-1', nombre: 'Altomayo' }] } }),
  useOrganizacion: () => ({ data: undefined }),
}))

const getAssignables = jest.fn().mockResolvedValue([
  { id: 3, nombres: 'Carlos', apellidos: 'López', correo: 'c@x.com' },
])
jest.mock('@/services/modules/usuarios.service', () => ({
  usuariosService: { getAssignables: (...args: unknown[]) => getAssignables(...args) },
}))

// El panel de filtros está colapsado por defecto; lo abrimos antes de aseverar.
async function abrirPanel() {
  await userEvent.click(screen.getByText('Filtros'))
}

describe('modules/pipeline/LeadFiltros', () => {
  beforeEach(() => jest.clearAllMocks())

  async function abrirFiltros() {
    const filtrosBtn = screen.getByText('Filtros')
    await userEvent.click(filtrosBtn)
  }

  it('renders the semáforo segmented options', async () => {
    render(<LeadFiltros filtros={{}} onChange={jest.fn()} onLimpiar={jest.fn()} />)
    await abrirFiltros()
    expect(screen.getByText('Todas')).toBeInTheDocument()
    expect(screen.getByText('Sin actividades')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Por vencer')).toBeInTheDocument()
    expect(screen.queryByText('En riesgo')).not.toBeInTheDocument()
  })

  it('emits alerta_actividad when a semáforo option is clicked', async () => {
    const onChange = jest.fn()
    render(<LeadFiltros filtros={{}} onChange={onChange} onLimpiar={jest.fn()} />)
    await abrirFiltros()
    await userEvent.click(screen.getByText('Por vencer'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ alerta_actividad: 'POR_VENCER' })
    )
  })

  it('renders organization options from the hook', async () => {
    render(<LeadFiltros filtros={{}} onChange={jest.fn()} onLimpiar={jest.fn()} />)
    await abrirFiltros()
    const orgInput = screen.getByPlaceholderText('Buscar y seleccionar organización...')
    await userEvent.click(orgInput)
    expect(screen.getByText('Altomayo')).toBeInTheDocument()
  })

  it('loads responsables and emits an estado change', async () => {
    const onChange = jest.fn()
    render(<LeadFiltros filtros={{}} onChange={onChange} onLimpiar={jest.fn()} />)
    await abrirFiltros()
    await waitFor(() => expect(getAssignables).toHaveBeenCalled())

    const estadoSelect = screen.getByLabelText('Estado')
    await userEvent.selectOptions(estadoSelect, LeadState.Ofertado)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ estado: LeadState.Ofertado })
    )
  })

  it('shows a validation error when fechaHasta is earlier than fechaDesde', async () => {
    render(<LeadFiltros filtros={{}} onChange={jest.fn()} onLimpiar={jest.fn()} />)
    await abrirFiltros()
    fireEvent.change(screen.getByLabelText('Creados desde'), {
      target: { value: '2026-06-10' },
    })
    fireEvent.change(screen.getByLabelText('Creados hasta'), {
      target: { value: '2026-06-01' },
    })
    expect(screen.getByText(/debe ser igual o posterior/i)).toBeInTheDocument()
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
    await abrirFiltros()
    await userEvent.click(screen.getByRole('button', { name: /Limpiar/i }))
    expect(onLimpiar).toHaveBeenCalled()
  })
})
