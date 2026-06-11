import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/ui/SearchBar/SearchBar'

const mockUseDebounce = jest.fn((value: string) => value)
jest.mock('@/hooks/shared/useDebounce', () => ({
  useDebounce: (...args: unknown[]) => mockUseDebounce(...args),
}))

describe('ui/SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders input with placeholder', () => {
    render(<SearchBar placeholder="Buscar..." value="" onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('renders the current value', () => {
    render(<SearchBar placeholder="Buscar" value="test" onChange={jest.fn()} />)
    expect(screen.getByDisplayValue('test')).toBeInTheDocument()
  })

  it('renders search icon', () => {
    const { container } = render(<SearchBar placeholder="Buscar" value="" onChange={jest.fn()} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const onChange = jest.fn()
    render(<SearchBar placeholder="Buscar" value="" onChange={onChange} />)

    const input = screen.getByPlaceholderText('Buscar')
    await userEvent.type(input, 'a')

    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('calls useDebounce with value and delay', () => {
    render(<SearchBar placeholder="Buscar" value="test" onChange={jest.fn()} debounceDelay={300} />)
    expect(mockUseDebounce).toHaveBeenCalledWith('test', 300)
  })
})
