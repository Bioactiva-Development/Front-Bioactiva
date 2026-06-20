import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeadFiltros } from '@/components/modules/pipeline/LeadFiltros'
import { LeadState } from '@/types/enums'

jest.mock('lucide-react', () => new Proxy({}, { get: () => () => null }))

jest.mock('@/hooks/organizaciones/useOrganizaciones', () => ({
  useOrganizaciones: () => ({ data: { data: [{ id: 'org-1', nombre: 'Altomayo' }] } }),
  useOrganizacion: () => ({ data: undefined }),
}))

const getUsuarios = jest.fn().mockResolvedValue({
  usuarios: [{ id: 3, nombres: 'Carlos', apellidos: 'López', correo: 'c@x.com' }],
})
jest.mock('@/services/modules/usuarios.service', () => ({
  usuariosService: { getUsuarios: (...args: unknown[]) => getUsuarios(...args) },
}))

// El panel de filtros está colapsado por defecto; lo abrimos antes de aseverar.
async function abrirPanel() {
  await userEvent.click(screen.getByText('Filtros'))
}

describe('modules/pipeline/LeadFiltros', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the semáforo segmented options (alertaActividad)', async () => {
    render(<LeadFiltros filtros={{}} onChange={jest.fn()} onLimpiar={jest.fn()} />)
    await abrirPanel()
    expect(screen.getByText('Todas')).toBeInTheDocument()
    expect(screen.getByText('Sin actividades')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('En riesgo')).toBeInTheDocument()
    expect(screen.getByText('Por vencer')).toBeInTheDocument()
  })

  it('emits alerta_actividad when a semáforo option is clicked', async () => {
    const onChange = jest.fn()
    render(<LeadFiltros filtros={{}} onChange={onChange} onLimpiar={jest.fn()} />)
    await abrirPanel()
    await userEvent.click(screen.getByText('Por vencer'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ alerta_actividad: 'POR_VENCER' })
    )
  })

  it('selects an organization from the buscador and maps idOrg', async () => {
    const onChange = jest.fn()
    render(<LeadFiltros filtros={{}} onChange={onChange} onLimpiar={jest.fn()} />)
    await abrirPanel()
    await userEvent.click(screen.getByPlaceholderText(/seleccionar organización/i))
    await userEvent.click(screen.getByText('Altomayo'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id_org: 'org-1' })
    )
  })

  it('emits a sector change', async () => {
    const onChange = jest.fn()
    render(<LeadFiltros filtros={{}} onChange={onChange} onLimpiar={jest.fn()} />)
    await abrirPanel()
    const sectorSelect = screen.getByLabelText('Sector')
    await userEvent.selectOptions(sectorSelect, 'TECNOLOGIA')
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sector: 'TECNOLOGIA' })
    )
  })

  it('loads responsables and emits an estado change', async () => {
    const onChange = jest.fn()
    render(<LeadFiltros filtros={{}} onChange={onChange} onLimpiar={jest.fn()} />)
    await abrirPanel()
    await waitFor(() => expect(getUsuarios).toHaveBeenCalled())

    const estadoSelect = screen.getByLabelText('Estado')
    await userEvent.selectOptions(estadoSelect, LeadState.Ofertado)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ estado: LeadState.Ofertado })
    )
  })

  it('shows a validation error when fechaHasta is earlier than fechaDesde', async () => {
    render(<LeadFiltros filtros={{}} onChange={jest.fn()} onLimpiar={jest.fn()} />)
    await abrirPanel()
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

  it('shows a "Limpiar" button that calls onLimpiar when there are active filters', async () => {
    const onLimpiar = jest.fn()
    render(
      <LeadFiltros
        filtros={{ estado: LeadState.Ofertado }}
        onChange={jest.fn()}
        onLimpiar={onLimpiar}
      />
    )
    await abrirPanel()
    await userEvent.click(screen.getByRole('button', { name: /Limpiar/i }))
    expect(onLimpiar).toHaveBeenCalled()
  })
})
