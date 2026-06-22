import { render, screen, waitFor } from '@testing-library/react'
import { SeguimientoForm } from '@/components/modules/notificaciones/SeguimientoForm'

jest.mock('@/hooks/pipeline/useLeads', () => ({
  useLeads: () => ({
    data: {
      data: [{
        id: 1,
        id_contacto: 10,
        servicio_interes: 'Seguimiento comercial',
        organizacion_nombre: 'Empresa SAC',
        encargado_nombre: 'Usuario encargado',
      }],
    },
  }),
}))

jest.mock('@/hooks/pipeline/useActividades', () => ({
  useActividades: () => ({
    data: [{
      id: 20,
      estado: 'Pendiente',
      nombre_actividad: 'Revisar propuesta',
      fecha_fin: '2099-06-20T18:00:00.000Z',
      responsable_nombre: 'Usuario encargado',
    }],
    isLoading: false,
  }),
}))

jest.mock('@/hooks/contactos/useContactos', () => ({
  useContacto: () => ({
    data: {
      id: 10,
      correo: 'contacto@example.com',
      correo2: null,
    },
  }),
}))

jest.mock('@/hooks/plantillas/usePlantillas', () => ({
  usePlantillasActivas: () => ({ data: [], isLoading: false }),
}))

jest.mock('@/hooks/notificaciones/useNotificaciones', () => ({
  useNotificacionesProgramadas: () => ({
    data: { data: [] },
    isLoading: false,
  }),
}))

describe('modules/notificaciones/SeguimientoForm', () => {
  it('shows only date and time fields for both follow-up emails', async () => {
    render(
      <SeguimientoForm
        onSubmit={jest.fn().mockResolvedValue(undefined)}
        isLoading={false}
        leadIdInicial={1}
      />
    )

    expect(screen.getAllByText('Anticipación al fin de la actividad')).toHaveLength(2)
    expect(screen.getAllByLabelText('Fecha de envío')).toHaveLength(2)
    expect(screen.getAllByLabelText('Hora de envío')).toHaveLength(2)
    expect(screen.queryByText('15 min')).not.toBeInTheDocument()
    expect(screen.queryByText('30 min')).not.toBeInTheDocument()
    expect(screen.queryByText('1 hora')).not.toBeInTheDocument()
    expect(screen.queryByText(/Envío estimado:/)).not.toBeInTheDocument()

    await waitFor(() => {
      const dates = screen.getAllByLabelText('Fecha de envío') as HTMLInputElement[]
      const times = screen.getAllByLabelText('Hora de envío') as HTMLInputElement[]
      expect(dates.every((input) => input.value !== '')).toBe(true)
      expect(times.every((input) => input.value !== '')).toBe(true)
      expect(
        Date.parse(`${dates[0].value}T${times[0].value}`)
      ).toBeLessThan(
        Date.parse(`${dates[1].value}T${times[1].value}`)
      )
    })
  })
})
