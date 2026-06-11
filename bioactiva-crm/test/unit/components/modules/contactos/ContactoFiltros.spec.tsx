import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactoFiltros } from '@/components/modules/contactos/ContactoFiltros'
import { ContactoFiltros as FiltrosType } from '@/types/contacto.types'

jest.mock('@/hooks/shared/useDebounce', () => ({
  useDebounce: jest.fn((v: unknown) => v),
}))

jest.mock('@/hooks/organizaciones/useOrganizaciones', () => ({
  useOrganizaciones: jest.fn(() => ({
    data: {
      data: [
        { id: '1', nombre: 'Org A' },
        { id: '2', nombre: 'Org B' },
      ],
    },
  })),
}))

jest.mock('lucide-react', () => ({
  Search: jest.fn(() => <svg data-testid="search-icon" />),
  X: jest.fn(() => <svg data-testid="x-icon" />),
}))

const defaultFiltros: FiltrosType = {}

describe('modules/contactos/ContactoFiltros', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input with placeholder', () => {
    render(
      <ContactoFiltros
        filtros={defaultFiltros}
        onChange={jest.fn()}
        onLimpiar={jest.fn()}
      />
    )
    expect(
      screen.getByPlaceholderText(
        'Buscar por nombre, email, cargo, organización...'
      )
    ).toBeInTheDocument()
  })

  it('renders organization dropdown with "Todas las organizaciones" option', () => {
    render(
      <ContactoFiltros
        filtros={defaultFiltros}
        onChange={jest.fn()}
        onLimpiar={jest.fn()}
      />
    )
    expect(
      screen.getByRole('option', { name: 'Todas las organizaciones' })
    ).toBeInTheDocument()
  })

  it('renders organization options from useOrganizaciones', () => {
    render(
      <ContactoFiltros
        filtros={defaultFiltros}
        onChange={jest.fn()}
        onLimpiar={jest.fn()}
      />
    )
    expect(screen.getByRole('option', { name: 'Org A' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Org B' })).toBeInTheDocument()
  })

  it('selecting an organization calls onChange with idOrganizacion', async () => {
    const onChange = jest.fn()
    render(
      <ContactoFiltros
        filtros={defaultFiltros}
        onChange={onChange}
        onLimpiar={jest.fn()}
      />
    )
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, '1')
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ idOrganizacion: '1', page: 1 })
    )
  })

  it('shows "Limpiar filtros" button when filtros.search has value', () => {
    render(
      <ContactoFiltros
        filtros={{ search: 'algo' }}
        onChange={jest.fn()}
        onLimpiar={jest.fn()}
      />
    )
    expect(
      screen.getByRole('button', { name: /limpiar filtros/i })
    ).toBeInTheDocument()
  })

  it('shows "Limpiar filtros" button when filtros.idOrganizacion has value', () => {
    render(
      <ContactoFiltros
        filtros={{ idOrganizacion: '1' }}
        onChange={jest.fn()}
        onLimpiar={jest.fn()}
      />
    )
    expect(
      screen.getByRole('button', { name: /limpiar filtros/i })
    ).toBeInTheDocument()
  })

  it('clicking "Limpiar filtros" calls onLimpiar', async () => {
    const onLimpiar = jest.fn()
    render(
      <ContactoFiltros
        filtros={{ search: 'algo' }}
        onChange={jest.fn()}
        onLimpiar={onLimpiar}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: /limpiar filtros/i })
    )
    expect(onLimpiar).toHaveBeenCalledTimes(1)
  })

  it('does NOT show "Limpiar filtros" when no filters active', () => {
    render(
      <ContactoFiltros
        filtros={defaultFiltros}
        onChange={jest.fn()}
        onLimpiar={jest.fn()}
      />
    )
    expect(
      screen.queryByRole('button', { name: /limpiar filtros/i })
    ).not.toBeInTheDocument()
  })

  it('renders Search icon', () => {
    render(
      <ContactoFiltros
        filtros={defaultFiltros}
        onChange={jest.fn()}
        onLimpiar={jest.fn()}
      />
    )
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('typing in search updates the value', async () => {
    render(
      <ContactoFiltros
        filtros={defaultFiltros}
        onChange={jest.fn()}
        onLimpiar={jest.fn()}
      />
    )
    const input = screen.getByPlaceholderText(
      'Buscar por nombre, email, cargo, organización...'
    )
    await userEvent.type(input, 'test')
    expect(input).toHaveValue('test')
  })
})
