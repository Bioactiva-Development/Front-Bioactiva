import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CotizacionForm } from '@/components/modules/cotizaciones/CotizacionForm'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'

jest.mock('next/navigation', () => {
  const mockPush = jest.fn()
  return {
    useRouter: jest.fn(() => ({ push: mockPush })),
    __mockPush: mockPush,
  }
})

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(() => ({})),
    handleSubmit: jest.fn((fn) => () => fn({})),
    setValue: jest.fn(),
    control: {},
    formState: { errors: {} },
    reset: jest.fn(),
  }),
  useWatch: jest.fn(() => ''),
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}))

jest.mock('@/store', () => ({
  useAuthStore: () => ({ usuario: { id: 1, nombres: 'Admin', apellidos: 'User', correo: 'admin@test.com' } }),
}))

jest.mock('@/services/modules/usuarios.service', () => ({
  usuariosService: {
    getUsuarios: jest.fn().mockResolvedValue({
      usuarios: [
        { id: 1, nombres: 'Admin', apellidos: 'User', correo: 'admin@test.com' },
        { id: 2, nombres: 'Juan', apellidos: 'Perez', correo: 'juan@test.com' },
      ],
    }),
  },
}))

jest.mock('@/hooks/pipeline/useLeads', () => ({
  useLead: jest.fn(() => ({ data: null, isLoading: false })),
}))

jest.mock('@/lib/constants/routes', () => ({
  ROUTES: { cotizaciones: '/cotizaciones' },
}))

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="icon-loader" />,
  Save: () => <div data-testid="icon-save" />,
  ArrowLeft: () => <div data-testid="icon-arrow-left" />,
  FileText: () => <div data-testid="icon-file-text" />,
  User: () => <div data-testid="icon-user" />,
  DollarSign: () => <div data-testid="icon-dollar" />,
  StickyNote: () => <div data-testid="icon-sticky-note" />,
}))

const baseCotizacion: Cotizacion = {
  id: 1,
  codigo: 'COT-001',
  id_lead: 1,
  id_remitente: 2,
  fecha_cot: '2025-03-01T00:00:00Z',
  dirigido: 'Juan Pérez',
  nombre_servicio: 'Consultoría I+D',
  monto: 15000,
  tipo: TipoMoneda.Soles,
  estado: EstadoCot.Pendiente,
  id_author: 1,
  created_at: '2025-03-01T00:00:00Z',
  updated_at: '2025-03-01T00:00:00Z',
  nombre_remitente: 'Juan Perez',
}

describe('modules/cotizaciones/CotizacionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering (creation mode)', () => {
    it('renders form labels', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      expect(screen.getByLabelText(/fecha cotización/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cliente/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/producto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/remitente/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre del servicio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/monto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/moneda/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/observación/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/link de propuesta/i)).toBeInTheDocument()
    })

    it('renders submit button with "Guardar cotización" text', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      expect(screen.getByText('Guardar cotización')).toBeInTheDocument()
    })

    it('renders "Volver a Cotizaciones" button', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      expect(screen.getByText('Volver a Cotizaciones')).toBeInTheDocument()
    })

    it('renders fecha_cot input as readOnly', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      const fechaInput = screen.getByLabelText(/fecha cotización/i)
      expect(fechaInput).toHaveAttribute('readOnly')
    })

    it('renders monto input as type number', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      const montoInput = screen.getByLabelText(/monto/i)
      expect(montoInput).toHaveAttribute('type', 'number')
    })

    it('renders tipo select with Soles and Dolares options', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      expect(screen.getByLabelText(/moneda/i)).toBeInTheDocument()
      expect(screen.getByText('Soles (PEN)')).toBeInTheDocument()
      expect(screen.getByText('Dólares (USD)')).toBeInTheDocument()
    })

    it('renders observacion textarea', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      const textarea = screen.getByLabelText(/observación/i)
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('renders link_propuesta input with type url', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      const linkInput = screen.getByLabelText(/link de propuesta/i)
      expect(linkInput).toHaveAttribute('type', 'url')
    })

    it('renders hidden id_lead input', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      const hiddenInput = document.querySelector('input[type="hidden"]')
      expect(hiddenInput).toBeInTheDocument()
    })
  })

  describe('rendering (edit mode)', () => {
    it('renders submit button with "Guardar cambios" text', () => {
      render(
        <CotizacionForm cotizacion={baseCotizacion} onSubmit={jest.fn()} isLoading={false} />
      )

      expect(screen.getByText('Guardar cambios')).toBeInTheDocument()
    })

    it('shows "El remitente queda fijado" message', () => {
      render(
        <CotizacionForm cotizacion={baseCotizacion} onSubmit={jest.fn()} isLoading={false} />
      )

      expect(
        screen.getByText('El remitente queda fijado al crear la cotización.')
      ).toBeInTheDocument()
    })

    it('cliente input is readOnly when editing', () => {
      render(
        <CotizacionForm cotizacion={baseCotizacion} onSubmit={jest.fn()} isLoading={false} />
      )

      const clienteInput = screen.getByLabelText(/cliente/i)
      expect(clienteInput).toHaveAttribute('readOnly')
    })

    it('renders nombre_servicio input when editing', () => {
      render(
        <CotizacionForm cotizacion={baseCotizacion} onSubmit={jest.fn()} isLoading={false} />
      )

      expect(screen.getByLabelText(/nombre del servicio/i)).toBeInTheDocument()
    })

    it('renders remitente as read-only text input in edit mode', () => {
      render(
        <CotizacionForm cotizacion={baseCotizacion} onSubmit={jest.fn()} isLoading={false} />
      )

      const remitenteInput = screen.getByLabelText(/remitente/i)
      expect(remitenteInput).toHaveAttribute('readOnly')
    })

  })

  describe('interactions', () => {
    it('clicking "Volver a Cotizaciones" calls router.push with cotizaciones route', async () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} />
      )

      await userEvent.click(screen.getByText('Volver a Cotizaciones'))

      const navModule = jest.requireMock('next/navigation') as {
        useRouter: jest.Mock
        __mockPush: jest.Mock
      }
      expect(navModule.__mockPush).toHaveBeenCalledWith('/cotizaciones')
    })

    it('clicking save button calls onSubmit via handleSubmit', async () => {
      const onSubmit = jest.fn()
      render(
        <CotizacionForm onSubmit={onSubmit} isLoading={false} />
      )

      await userEvent.click(screen.getByText('Guardar cotización'))
      expect(onSubmit).toHaveBeenCalled()
    })

    it('clicking "Guardar cambios" calls onSubmit via handleSubmit', async () => {
      const onSubmit = jest.fn()
      render(
        <CotizacionForm cotizacion={baseCotizacion} onSubmit={onSubmit} isLoading={false} />
      )

      await userEvent.click(screen.getByText('Guardar cambios'))
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('shows Loader2 icon and "Guardando..." text when isLoading is true', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={true} />
      )

      expect(screen.getByText('Guardando...')).toBeInTheDocument()
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument()
    })

    it('hides submit button text when loading', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={true} />
      )

      expect(screen.queryByText('Guardar cotización')).not.toBeInTheDocument()
      expect(screen.queryByText('Guardar cambios')).not.toBeInTheDocument()
    })

    it('disables submit button when loading', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={true} />
      )

      const button = screen.getByText('Guardando...').closest('button')
      expect(button).toBeDisabled()
    })
  })

  describe('error state', () => {
    it('renders error banner when error prop is passed', () => {
      const errorMsg = 'Error al guardar la cotización'
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} error={errorMsg} />
      )

      expect(screen.getByText(errorMsg)).toBeInTheDocument()
    })

    it('does not render error banner when error is null', () => {
      render(
        <CotizacionForm onSubmit={jest.fn()} isLoading={false} error={null} />
      )

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
