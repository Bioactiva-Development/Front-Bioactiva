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
    expect(screen.getByText('Notificación de Seguimiento')).toBeInTheDocument()
  })

  it('renders truncated asunto when longer than 60 chars', () => {
    const long: Plantilla = {
      ...basePlantilla,
      asunto: 'A'.repeat(70),
    }
    render(<PlantillaCard plantilla={long} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getByText(`${'A'.repeat(60)}...`)).toBeInTheDocument()
  })

  it('renders asunto directly when 60 chars or less', () => {
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getByText(basePlantilla.asunto)).toBeInTheDocument()
  })

  it('shows Activa badge when plantilla is active', () => {
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getByText('Activa')).toBeInTheDocument()
  })

  it('shows Inactiva badge when plantilla is inactive', () => {
    const inactive: Plantilla = { ...basePlantilla, activo: false }
    render(<PlantillaCard plantilla={inactive} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getByText('Inactiva')).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    expect(screen.getByText(/15 mar/i)).toBeInTheDocument()
  })

  it('calls onVer when nombre is clicked', async () => {
    const onVer = jest.fn()
    render(<PlantillaCard plantilla={basePlantilla} onVer={onVer} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    await userEvent.click(screen.getByText('Notificación de Seguimiento'))
    expect(onVer).toHaveBeenCalledWith(basePlantilla)
  })

  it('calls onVer when eye button is clicked', async () => {
    const onVer = jest.fn()
    render(<PlantillaCard plantilla={basePlantilla} onVer={onVer} onEditar={jest.fn()} onEliminar={jest.fn()} />)
    const verBtn = screen.getByTitle('Ver detalle')
    await userEvent.click(verBtn)
    expect(onVer).toHaveBeenCalledWith(basePlantilla)
  })

  it('calls onEditar when edit button is clicked', async () => {
    const onEditar = jest.fn()
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={onEditar} onEliminar={jest.fn()} />)
    await userEvent.click(screen.getByTitle('Editar'))
    expect(onEditar).toHaveBeenCalledWith(basePlantilla)
  })

  it('calls onEliminar when delete button is clicked', async () => {
    const onEliminar = jest.fn()
    render(<PlantillaCard plantilla={basePlantilla} onVer={jest.fn()} onEditar={jest.fn()} onEliminar={onEliminar} />)
    await userEvent.click(screen.getByTitle('Eliminar'))
    expect(onEliminar).toHaveBeenCalledWith(basePlantilla)
  })
})
