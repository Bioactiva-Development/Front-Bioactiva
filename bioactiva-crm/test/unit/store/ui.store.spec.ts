import { useUIStore } from '@/store/ui.store'

describe('ui.store', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarOpen: true,
      sidebarCollapsed: false,
      globalLoading: false,
      notificacionesPendientes: 0,
    })
  })

  it('toggles sidebar open/close', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true)

    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)

    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('closes sidebar', () => {
    useUIStore.getState().closeSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })

  it('opens sidebar', () => {
    useUIStore.getState().closeSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)

    useUIStore.getState().openSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('toggles collapsed state', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)

    useUIStore.getState().toggleCollapsed()
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)

    useUIStore.getState().toggleCollapsed()
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })

  it('sets global loading state', () => {
    expect(useUIStore.getState().globalLoading).toBe(false)

    useUIStore.getState().setGlobalLoading(true)
    expect(useUIStore.getState().globalLoading).toBe(true)

    useUIStore.getState().setGlobalLoading(false)
    expect(useUIStore.getState().globalLoading).toBe(false)
  })

  it('sets notificaciones pendientes count', () => {
    expect(useUIStore.getState().notificacionesPendientes).toBe(0)

    useUIStore.getState().setNotificacionesPendientes(5)
    expect(useUIStore.getState().notificacionesPendientes).toBe(5)

    useUIStore.getState().setNotificacionesPendientes(0)
    expect(useUIStore.getState().notificacionesPendientes).toBe(0)
  })
})
