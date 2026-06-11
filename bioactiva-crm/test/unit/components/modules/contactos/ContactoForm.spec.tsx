import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactoForm } from '@/components/modules/contactos/ContactoForm'
import { Contacto } from '@/types/contacto.types'
import { Vocativo } from '@/types/enums'

const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

const mockRegister = jest.fn(() => ({}))
const mockHandleSubmit = jest.fn((fn) => () => fn({}))

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    formState: { errors: {} },
  }),
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}))

jest.mock('@/hooks/organizaciones/useOrganizaciones', () => ({
  useOrganizaciones: jest.fn(() => ({
    data: { data: [{ id: '1', nombre: 'Org A' }, { id: '2', nombre: 'Org B' }] },
  })),
}))

jest.mock('@/lib/constants/routes', () => ({
  ROUTES: { contactos: '/contactos' },
}))

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader" />,
  Save: () => <div data-testid="save" />,
  ArrowLeft: () => <div data-testid="arrow-left" />,
}))

const baseContacto: Contacto = {
  id: 1,
  nombres: 'Juan',
  apellidos: 'Pérez',
  vocativo: Vocativo.Sr,
  cargo: 'Gerente General',
  correo: 'jperez@empresa.com',
  telefono: '999888777',
  idOrganizacion: 'org-1',
  idAuthor: 1,
  estado_correo: 'VIGENTE',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  organizacion_nombre: 'Empresa SAC',
}

const defaultProps = {
  onSubmit: jest.fn(),
  isLoading: false,
}

describe('modules/contactos/ContactoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('creation mode', () => {
    beforeEach(() => {
      render(<ContactoForm {...defaultProps} />)
    })

    it('renders organization select with default option', () => {
      expect(screen.getByLabelText('Organización *')).toBeInTheDocument()
      expect(screen.getByText('Seleccionar organización...')).toBeInTheDocument()
    })

    it('renders organization options from useOrganizaciones data', () => {
      expect(screen.getByText('Org A')).toBeInTheDocument()
      expect(screen.getByText('Org B')).toBeInTheDocument()
    })

    it('renders vocativo select with enum options', () => {
      expect(screen.getByLabelText('Vocativo')).toBeInTheDocument()
      const vocativoOptions = Object.values(Vocativo).map((v) => `${v}.`)
      vocativoOptions.forEach((opt) => {
        expect(screen.getByText(opt)).toBeInTheDocument()
      })
    })

    it('renders nombres input', () => {
      const input = screen.getByLabelText('Nombres *')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('placeholder', 'Nombres del contacto')
    })

    it('renders apellidos input', () => {
      const input = screen.getByLabelText('Apellidos *')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('placeholder', 'Apellidos del contacto')
    })

    it('renders cargo input', () => {
      const input = screen.getByLabelText('Cargo Opcional')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('placeholder', 'Ej: Gerente de Proyectos')
    })

    it('renders correo input', () => {
      const input = screen.getByLabelText('Correo electrónico *')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveAttribute('placeholder', 'correo@empresa.com')
    })

    it('renders correo2 input', () => {
      const input = screen.getByLabelText('Correo secundario Opcional')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveAttribute('placeholder', 'correo.alternativo@empresa.com')
    })

    it('renders telefono input', () => {
      const input = screen.getByLabelText('Teléfono Opcional')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('placeholder', 'Ej: +51987654321')
    })

    it('renders comentarios textarea', () => {
      const textarea = screen.getByLabelText('Comentarios Opcional')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('placeholder', 'Notas o comentarios adicionales sobre el contacto...')
    })

    it('renders all form sections/labels', () => {
      expect(screen.getByText('Organización')).toBeInTheDocument()
      expect(screen.getByText('Vocativo')).toBeInTheDocument()
      expect(screen.getByText('Nombres')).toBeInTheDocument()
      expect(screen.getByText('Apellidos')).toBeInTheDocument()
      expect(screen.getByText('Cargo')).toBeInTheDocument()
      expect(screen.getByText('Correo electrónico')).toBeInTheDocument()
      expect(screen.getByText('Correo secundario')).toBeInTheDocument()
      expect(screen.getByText('Teléfono')).toBeInTheDocument()
      expect(screen.getByText('Comentarios')).toBeInTheDocument()
    })

    it('renders "Guardar contacto" text in creation mode', () => {
      expect(screen.getByText('Guardar contacto')).toBeInTheDocument()
      expect(screen.queryByText('Guardar cambios')).not.toBeInTheDocument()
    })

    it('does not render edit-only sections', () => {
      expect(screen.queryByText('Estado del contacto')).not.toBeInTheDocument()
      expect(screen.queryByText('La organización no puede modificarse una vez creado el contacto.')).not.toBeInTheDocument()
      expect(screen.queryByText('Un contacto inactivo no puede asociarse a nuevos leads.')).not.toBeInTheDocument()
    })

    it('renders "Cancelar" button', () => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })

    it('calls router.push with ROUTES.contactos on Cancelar click', async () => {
      await userEvent.click(screen.getByText('Cancelar'))
      expect(mockRouterPush).toHaveBeenCalledWith('/contactos')
    })

    it('renders organization select as enabled (not disabled) in creation mode', () => {
      const select = screen.getByLabelText('Organización *')
      expect(select).not.toBeDisabled()
    })
  })

  describe('edit mode', () => {
    beforeEach(() => {
      render(<ContactoForm {...defaultProps} contacto={baseContacto} />)
    })

    it('renders "Guardar cambios" text in edit mode', () => {
      expect(screen.getByText('Guardar cambios')).toBeInTheDocument()
      expect(screen.queryByText('Guardar contacto')).not.toBeInTheDocument()
    })

    it('allows changing the organization in edit mode (mover contacto)', () => {
      // PR #121: PATCH /contacts/:id ahora reasigna el contacto a otra
      // organización, así que el selector queda habilitado en edición.
      const select = screen.getByLabelText('Organización *')
      expect(select).not.toBeDisabled()
    })

    it('shows the move-organization hint in edit mode', () => {
      expect(
        screen.getByText(/Cambiar la organización moverá el contacto/i)
      ).toBeInTheDocument()
    })

    it('shows estado_correo select with Activo/Inactivo options', () => {
      expect(screen.getByLabelText('Estado del contacto')).toBeInTheDocument()
      expect(screen.getByText('Activo')).toBeInTheDocument()
      expect(screen.getByText('Inactivo')).toBeInTheDocument()
    })

    it('shows warning about inactive contacts', () => {
      expect(screen.getByText('Un contacto inactivo no puede asociarse a nuevos leads.')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('renders Loader2 and "Guardando..." when isLoading is true', () => {
      render(<ContactoForm {...defaultProps} isLoading />)
      expect(screen.getByTestId('loader')).toBeInTheDocument()
      expect(screen.getByText('Guardando...')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error banner when error prop is passed', () => {
      render(<ContactoForm {...defaultProps} error="Error al guardar" />)
      expect(screen.getByText('Error al guardar')).toBeInTheDocument()
    })

    it('surfaces the destination-organization 404 (mover contacto) on the org field', () => {
      // PR #121: el 404 de organización destino inexistente/desactivada se
      // muestra junto al campo de organización, no como banner genérico.
      render(
        <ContactoForm
          {...defaultProps}
          contacto={baseContacto}
          error="Organización con id 99 no encontrada o desactivada"
        />
      )
      expect(
        screen.getByText('Organización con id 99 no encontrada o desactivada')
      ).toBeInTheDocument()
    })
  })
})
