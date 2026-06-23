import { test, expect, type Page, type Locator } from '@playwright/test'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001'

const MOCK_ORG = {
  id: MOCK_ORG_ID,
  codigoCliente: 'TEC-MOCK-001',
  nombre: 'TECSUP MOCK',
  nombreComercial: 'TECSUP SEDE LIMA MOCK',
  subArea: null,
  ruc: '20117592899',
  tipo: 'EMPRESA_NACIONAL',
  linkedin: null,
  ubicacion: 'LIMA',
  sector: 'EDUCACION',
  tamano: 'MEDIANO',
  actividadEconomica: null,
  alianzasEstrategicas: null,
  idContactoActivo: null,
  idAuthor: 1,
  createdAt: '2026-06-19T00:00:00Z',
  updatedAt: '2026-06-19T00:00:00Z',
}

const MOCK_CONTACTOS: Record<string, unknown>[] = [
  { id: 1, nombres: 'Carlos', apellidos: 'Perez', vocativo: 'SR.', cargo: 'Gerente General', correo: 'carlos@tecsup.pe', telefono: '+51999000001' },
  { id: 2, nombres: 'Maria', apellidos: 'Lopez', vocativo: 'SRA.', cargo: 'Directora', correo: 'maria@tecsup.pe' },
]

const MOCK_LEADS = [
  { id: 101, servicioInteres: 'Consultoría Técnica', estado: 'CIERRE_SIN_VENTA', createdAt: '2026-06-19T00:00:00.000Z', encargadoName: 'Joseph Anderson Cose Rojas', idOrg: MOCK_ORG_ID, organizationName: 'TECSUP MOCK', idEncargado: 1, idAuthor: 1, updatedAt: '2026-06-19T00:00:00.000Z', ultimoCambioEstado: '2026-06-19T00:00:00.000Z', comentarios: null, desafioOportunidad: null, canalCaptacion: null, idContacto: null, contactName: null, fechaCierre: null, fechaCierreEstimada: null, fecha_cierre: null, activityAlert: null },
]

const MOCK_COTIZACIONES = [
  { id: 201, nombreServicio: 'Formulación de Proyecto', monto: '0.00', tipo: 'PEN', estado: 'ENVIADA', fechaCot: '2026-06-19T00:00:00.000Z', dirigido: 'Carlos Perez', nombreRemitente: 'Fabricio Alonso Lanche Pacsi', cliente: null, producto: null, observacion: null, linkPropuesta: null, idLead: 101, leadServicioInteres: 'Consultoría Técnica', leadEstado: 'CIERRE_SIN_VENTA', contactName: null, idRemitente: 1, remitenteName: 'Fabricio Alonso Lanche Pacsi', idAuthor: 1, createdAt: '2026-06-19T00:00:00.000Z', updatedAt: '2026-06-19T00:00:00.000Z' },
]

// ---------------------------------------------------------------------------
// Route interceptors
// ---------------------------------------------------------------------------
async function setupDeactivateMocks(page: Page) {
  // GET + DELETE /organizations/:id
  await page.route(`**/organizations/${MOCK_ORG_ID}`, async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ORG) })
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    } else {
      await route.fallback()
    }
  })

  // GET /contacts/organization/:id
  await page.route(`**/contacts/organization/${MOCK_ORG_ID}`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CONTACTOS) })
  })

  // GET /leads?idOrg=:id&limit=100
  await page.route('**/leads', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback()
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LEADS) })
  })

  // GET /quotations?idOrg=:id&limit=100
  await page.route('**/quotations', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback()
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_COTIZACIONES) })
  })
}

async function cleanupMocks(page: Page) {
  await page.unrouteAll({ behavior: 'wait' })
}

// ---------------------------------------------------------------------------
// Page Object
// ---------------------------------------------------------------------------
class DesactivarOrganizacionPage {
  constructor(readonly page: Page) {}

  async gotoDetail(id: string = MOCK_ORG_ID) {
    await this.page.goto(`https://bioactiva.ingsoftware.lat/organizaciones/${id}`)
    await expect(
      this.page.getByRole('heading', { level: 1 }),
    ).toBeVisible({ timeout: 15000 })
  }

  get desactivarHeaderBtn() {
    // Botón en la cabecera del detalle (fuera del modal)
    return this.page.getByRole('button', { name: 'Desactivar' }).first()
  }

  get modalHeading() {
    return this.page.getByRole('heading', { name: 'Desactivar organización' })
  }

  get modalCancelarBtn() {
    // Botón "Cancelar" dentro del modal
    return this.modalHeading.locator('..').getByRole('button', { name: 'Cancelar' })
  }

  get modalConfirmarBtn() {
    // Botón "Desactivar" dentro del modal (confirmación)
    return this.modalHeading.locator('..').getByRole('button', { name: 'Desactivar' })
  }

  async clickDesactivarHeader() {
    await this.desactivarHeaderBtn.click()
  }

  async clickCancelarModal() {
    await this.modalCancelarBtn.click()
  }

  async clickConfirmarDesactivar() {
    await this.modalConfirmarBtn.click()
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.describe('Módulo de Organizaciones — Desactivación', () => {
  let pageObj: DesactivarOrganizacionPage

  test.beforeEach(async ({ page }) => {
    await setupDeactivateMocks(page)
    pageObj = new DesactivarOrganizacionPage(page)
    await pageObj.gotoDetail()
  })

  test.afterEach(async ({ page }) => {
    await cleanupMocks(page)
  })

  test('Debería mostrar el modal de confirmación al hacer clic en Desactivar', async () => {
    await pageObj.clickDesactivarHeader()

    await expect(pageObj.modalHeading).toBeVisible()
    await expect(pageObj.modalCancelarBtn).toBeVisible()
    await expect(pageObj.modalConfirmarBtn).toBeVisible()

    // Verificar texto sobre contactos VENCIDOS
    await expect(
      pageObj.page.getByText('VENCIDOS'),
    ).toBeVisible()
  })

  test('Debería cerrar el modal al hacer clic en Cancelar', async () => {
    await pageObj.clickDesactivarHeader()
    await expect(pageObj.modalHeading).toBeVisible()

    await pageObj.clickCancelarModal()
    await expect(pageObj.modalHeading).not.toBeVisible()
  })

  test('Debería desactivar la organización al confirmar', async () => {
    await pageObj.clickDesactivarHeader()
    await expect(pageObj.modalHeading).toBeVisible()

    await pageObj.clickConfirmarDesactivar()

    // La redirección post-eliminación va a /organizaciones
    await expect(pageObj.page).toHaveURL(/\/organizaciones$/, { timeout: 15000 })
  })
})
