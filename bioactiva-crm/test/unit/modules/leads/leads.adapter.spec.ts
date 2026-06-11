import {
  mapBackendLead,
  mapBackendLeadsResponse,
  mapLeadFormToBackend,
  mapEstadoToBackend,
  BackendLead,
  BackendLeadsResponse,
} from '@/services/modules/leads.adapter'
import { LeadFormData } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

describe('leads.adapter', () => {
  const mockBackend: BackendLead = {
    id: 7,
    codigo: 'LEAD-2026-007',
    estado: 'OFERTADO',
    servicioInteres: 'Ley 30309',
    comentarios: 'Cliente interesado',
    desafioOportunidad: 'Optimizar I+D+i',
    notasContacto: null,
    canalCaptacion: 'Referido',
    idOrg: '123e4567-e89b-12d3-a456-426614174000',
    organizationName: 'Altomayo',
    idContacto: 4,
    contactName: 'Patricia Ccopa Mamani',
    idEncargado: 3,
    encargadoName: 'Administración',
    idAuthor: 1,
    createdAt: '2026-06-02T10:00:00.000Z',
    updatedAt: '2026-06-02T11:00:00.000Z',
    ultimoCambioEstado: '2026-06-02T12:00:00.000Z',
    tieneAlerta: true,
  }

  describe('mapBackendLead', () => {
    it('converts BackendLead to Lead correctly', () => {
      const result = mapBackendLead(mockBackend)

      expect(result).toMatchObject({
        id: 7,
        codigo: 'LEAD-2026-007',
        id_org: '123e4567-e89b-12d3-a456-426614174000',
        id_contacto: 4,
        estado: LeadState.Ofertado,
        servicio_interes: 'Ley 30309',
        comentarios: 'Cliente interesado',
        desafio_oportunidad: 'Optimizar I+D+i',
        notas_contacto: undefined,
        id_encargado: 3,
        canal_captacion: 'Referido',
        id_author: 1,
        created_at: '2026-06-02T10:00:00.000Z',
        updated_at: '2026-06-02T11:00:00.000Z',
        organizacion_nombre: 'Altomayo',
        contacto_nombre: 'Patricia Ccopa Mamani',
        encargado_nombre: 'Administración',
        tiene_alerta: true,
      })
    })

    it('uses LEAD-{id} as codigo fallback when codigo is undefined', () => {
      const { codigo, ...withoutCodigo } = mockBackend
      const result = mapBackendLead(withoutCodigo as BackendLead)
      expect(result.codigo).toBe('LEAD-7')
    })

    it('falls back to LeadState.Prospecto for unknown estado', () => {
      const result = mapBackendLead({ ...mockBackend, estado: 'FAKE_STATE' })
      expect(result.estado).toBe(LeadState.Prospecto)
    })
  })

  describe('mapBackendLeadsResponse', () => {
    it('maps paginated response correctly', () => {
      const backendResponse: BackendLeadsResponse = {
        data: [mockBackend],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      }

      const result = mapBackendLeadsResponse(backendResponse)

      expect(result).toEqual({
        data: [expect.objectContaining({ id: 7, codigo: 'LEAD-2026-007' })],
        total: 1,
        page: 1,
        limit: 20,
      })
    })
  })

  describe('mapLeadFormToBackend', () => {
    it('returns correct shape', () => {
      const formData: LeadFormData = {
        id_org: '123e4567-e89b-12d3-a456-426614174000',
        id_contacto: 4,
        servicio_interes: 'Ley 30309',
        comentarios: 'Cliente interesado',
        desafio_oportunidad: 'Optimizar I+D+i',
        notas_contacto: 'Llamar en una semana',
        id_encargado: 3,
        canal_captacion: 'Referido',
      }

      const result = mapLeadFormToBackend(formData)

      expect(result).toEqual({
        idOrg: '123e4567-e89b-12d3-a456-426614174000',
        idContacto: 4,
        servicioInteres: 'Ley 30309',
        comentarios: 'Cliente interesado',
        desafioOportunidad: 'Optimizar I+D+i',
        notasContacto: 'Llamar en una semana',
        idEncargado: 3,
        canalCaptacion: 'Referido',
      })
    })

    it('only includes defined fields', () => {
      const result = mapLeadFormToBackend({
        id_org: 'abc',
        id_encargado: 3,
      })

      expect(result).toEqual({
        idOrg: 'abc',
        idEncargado: 3,
      })
    })

    it('sets idContacto to null explicitly when provided', () => {
      const result = mapLeadFormToBackend({
        id_org: 'abc',
        id_contacto: null as unknown as undefined,
        id_encargado: 3,
      })

      expect(result).toEqual({
        idOrg: 'abc',
        idContacto: null,
        idEncargado: 3,
      })
    })
  })

  describe('mapEstadoToBackend', () => {
    it('maps each LeadState correctly', () => {
      expect(mapEstadoToBackend(LeadState.Prospecto)).toBe('EN_PROSPECTO')
      expect(mapEstadoToBackend(LeadState.Ofertado)).toBe('OFERTADO')
      expect(mapEstadoToBackend(LeadState.CierreVenta)).toBe('CIERRE_CON_VENTA')
      expect(mapEstadoToBackend(LeadState.CierreSinVenta)).toBe('CIERRE_SIN_VENTA')
    })
  })
})
