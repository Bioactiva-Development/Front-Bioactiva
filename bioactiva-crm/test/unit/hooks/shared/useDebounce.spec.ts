import { act, renderHook } from '@testing-library/react'
import { useDebounce } from '@/hooks/shared/useDebounce'

describe('shared/useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello'))
    expect(result.current).toBe('hello')
  })

  it('does not update debounced value before delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } },
    )

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')
  })

  it('updates debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } },
    )

    rerender({ value: 'updated' })
    act(() => { jest.advanceTimersByTime(500) })
    expect(result.current).toBe('updated')
  })

  it('cancels previous timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'b' })
    act(() => { jest.advanceTimersByTime(300) })
    rerender({ value: 'c' })
    act(() => { jest.advanceTimersByTime(300) })
    expect(result.current).toBe('a')

    act(() => { jest.advanceTimersByTime(200) })
    expect(result.current).toBe('c')
  })

  it('uses default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'first' } },
    )

    rerender({ value: 'second' })
    act(() => { jest.advanceTimersByTime(499) })
    expect(result.current).toBe('first')

    act(() => { jest.advanceTimersByTime(1) })
    expect(result.current).toBe('second')
  })

  it('works with numbers', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } },
    )

    rerender({ value: 42 })
    act(() => { jest.advanceTimersByTime(100) })
    expect(result.current).toBe(42)
  })
})
