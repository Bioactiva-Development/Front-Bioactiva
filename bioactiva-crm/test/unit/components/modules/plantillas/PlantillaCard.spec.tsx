import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlantillaCard } from '@/components/modules/plantillas/PlantillaCard'
import { Plantilla } from '@/types/plantilla.types'

const basePlantilla: Plantilla = {
  id: 1,
  nombre: 'Notificación de Seguimiento',
  asunto: 'Recordatorio de actividad pendiente - {{nombre_contacto}}',
  cuerpo: '<p>Hola {{nombre_contacto}}...</p>',
  activo: true,
  createdAt: '2025-03-15T10:00:00Z',
  updatedAt: '2025-03-15T10:00:00Z',
}

describe('modules/plantillas/PlantillaCard', () => {
  it('renders plantilla nombre', () => {
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getAllByText('Notificación de Seguimiento').length).toBeGreaterThan(0)
  })

  it('renders truncated asunto when longer than 60 chars', () => {
    const long: Plantilla = {
      ...basePlantilla,
      asunto: 'A'.repeat(70),
    }
    render(<PlantillaCard plantilla={long} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getAllByText(`${'A'.repeat(60)}...`).length).toBeGreaterThan(0)
  })

  it('renders asunto directly when 60 chars or less', () => {
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getAllByText(basePlantilla.asunto).length).toBeGreaterThan(0)
  })

  it('shows Activa badge when plantilla is active', () => {
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getAllByText('Activa').length).toBeGreaterThan(0)
  })

  it('shows Inactiva badge when plantilla is inactive', () => {
    const inactive: Plantilla = { ...basePlantilla, activo: false }
    render(<PlantillaCard plantilla={inactive} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getAllByText('Inactiva').length).toBeGreaterThan(0)
  })

  it('renders formatted date', () => {
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getAllByText(/15 mar/i).length).toBeGreaterThan(0)
  })

  it('calls onVer when nombre is clicked', async () => {
    const onVer = jest.fn()
    render(<PlantillaCard plantilla={basePlantilla} onVer={onVer} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    await userEvent.click(screen.getAllByText('Notificación de Seguimiento')[0])
    expect(onVer).toHaveBeenCalledWith(basePlantilla)
  })

  it('calls onVer when eye button is clicked', async () => {
    const onVer = jest.fn()
    render(<PlantillaCard plantilla={basePlantilla} onVer={onVer} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    const verBtns = screen.getAllByRole('button', { name: /ver detalle de/i })
    await userEvent.click(verBtns[0])
    expect(onVer).toHaveBeenCalledWith(basePlantilla)
  })

  it('calls onEditar when edit button is clicked', async () => {
    const onEditar = jest.fn()
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={onEditar} onEliminar={jest.fn()} />)
    await userEvent.click(screen.getAllByRole('button', { name: /editar/i })[0])
    expect(onEditar).toHaveBeenCalledWith(basePlantilla)
  })

  it('calls onEliminar when delete button is clicked', async () => {
    const onEliminar = jest.fn()
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={onEliminar} />)
    await userEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0])
    expect(onEliminar).toHaveBeenCalledWith(basePlantilla)
  })
})
