import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactoFiltros } from '@/components/modules/contactos/ContactoFiltros'
import { ContactoFiltros as FiltrosType } from '@/types/contacto.types'

jest.mock('@/hooks/shared/useDebounce', () => ({
  useDebounce: jest.fn((v: unknown) => v),
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
      screen.getByPlaceholderText('Buscar por nombre de contacto...')
    ).toBeInTheDocument()
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
      'Buscar por nombre de contacto...'
    )
    await userEvent.type(input, 'test')
    expect(input).toHaveValue('test')
  })
})
