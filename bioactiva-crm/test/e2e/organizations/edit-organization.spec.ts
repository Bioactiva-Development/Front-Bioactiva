import { test, expect, type Page, type Locator } from '@playwright/test'

// ---------------------------------------------------------------------------
// Mock data — mismo formato que detail-organization
// ---------------------------------------------------------------------------
const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001'

const ORG_BASE = {
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
]

const MOCK_LEADS = [
  { id: 101, servicioInteres: 'Consultoría Técnica', estado: 'CIERRE_SIN_VENTA', createdAt: '2026-06-19T00:00:00.000Z', encargadoName: 'Joseph Anderson Cose Rojas', idOrg: MOCK_ORG_ID, organizationName: 'TECSUP MOCK', idEncargado: 1, idAuthor: 1, updatedAt: '2026-06-19T00:00:00.000Z', ultimoCambioEstado: '2026-06-19T00:00:00.000Z', comentarios: null, desafioOportunidad: null, canalCaptacion: null, idContacto: null, contactName: null, fechaCierre: null, fechaCierreEstimada: null, fecha_cierre: null, activityAlert: null },
]

const MOCK_COTIZACIONES = [
  { id: 201, nombreServicio: 'Formulación de Proyecto', monto: '0.00', tipo: 'PEN', estado: 'ENVIADA', fechaCot: '2026-06-19T00:00:00.000Z', dirigido: 'Carlos Perez', nombreRemitente: 'Fabricio Alonso Lanche Pacsi', cliente: null, producto: null, observacion: null, linkPropuesta: null, idLead: 101, leadServicioInteres: 'Consultoría Técnica', leadEstado: 'CIERRE_SIN_VENTA', contactName: null, idRemitente: 1, remitenteName: 'Fabricio Alonso Lanche Pacsi', idAuthor: 1, createdAt: '2026-06-19T00:00:00.000Z', updatedAt: '2026-06-19T00:00:00.000Z' },
]

// ---------------------------------------------------------------------------
// Route interceptors — estado mutable para reflejar cambios del PATCH
// ---------------------------------------------------------------------------
async function setupEditMocks(page: Page) {
  // El sector se actualiza vía PATCH para que GET posterior lo refleje
  let currentSector = ORG_BASE.sector

  // GET / PATCH /organizations/:id
  await page.route(`**/organizations/${MOCK_ORG_ID}`, async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...ORG_BASE, sector: currentSector }),
      })
    } else if (method === 'PATCH') {
      const body = route.request().postDataJSON()
      if (body.sector) currentSector = body.sector
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...ORG_BASE, sector: currentSector }),
      })
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
class EditOrganizacionPage {
  constructor(readonly page: Page) {}

  async gotoDetail(id: string = MOCK_ORG_ID) {
    await this.page.goto(`https://bioactiva.ingsoftware.lat/organizaciones/${id}`)
    await expect(
      this.page.getByRole('heading', { level: 1 }),
    ).toBeVisible({ timeout: 15000 })
  }

  get editarBtn() {
    return this.page.getByRole('button', { name: 'Editar organización' })
  }

  async clickEditar() {
    await this.editarBtn.click()
    await expect(
      this.page.getByRole('button', { name: 'Guardar cambios' }),
    ).toBeVisible({ timeout: 10000 })
  }

  // Getters del formulario de edición
  get codigoInput() {
    return this.page.locator('#of-codigo')
  }

  get nombreInput() {
    return this.page.locator('#of-nombre')
  }

  get nombreComercialInput() {
    return this.page.locator('#of-nombre-comercial')
  }

  get tipoSelect() {
    return this.page.locator('#of-tipo')
  }

  get tamanoSelect() {
    return this.page.locator('#of-tamano')
  }

  get sectorSelect() {
    return this.page.locator('#of-sector')
  }

  get guardarCambiosBtn() {
    return this.page.getByRole('button', { name: 'Guardar cambios' })
  }

  get cancelarBtn() {
    return this.page.getByRole('button', { name: 'Cancelar', exact: true })
  }

  async cambiarSector(valor: string) {
    await this.sectorSelect.selectOption(valor)
  }

  async guardarCambios() {
    await this.guardarCambiosBtn.click()
  }

  // Detalle — sector visible
  get badgeSector() {
    return this.page.getByText('Manufactura')
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.describe('Módulo de Organizaciones — Edición', () => {
  let editPage: EditOrganizacionPage

  test.beforeEach(async ({ page }) => {
    await setupEditMocks(page)
    editPage = new EditOrganizacionPage(page)
    await editPage.gotoDetail()
  })

  test.afterEach(async ({ page }) => {
    await cleanupMocks(page)
  })

  test('Debería mostrar el formulario de edición con datos precargados', async () => {
    await editPage.clickEditar()

    await expect(editPage.codigoInput).toHaveValue('TEC-MOCK-001')
    await expect(editPage.codigoInput).toHaveAttribute('readonly', '')
    await expect(editPage.nombreInput).toHaveValue('TECSUP MOCK')
    await expect(editPage.nombreComercialInput).toHaveValue('TECSUP SEDE LIMA MOCK')
    await expect(editPage.tipoSelect).toHaveValue('Privada')
    await expect(editPage.tamanoSelect).toHaveValue('Mediana')
    await expect(editPage.sectorSelect).toHaveValue('EDUCACION')

    await expect(editPage.guardarCambiosBtn).toBeVisible()
    await expect(editPage.cancelarBtn).toBeVisible()
  })

  test('Debería actualizar el sector y mostrar el cambio en el detalle', async () => {
    await editPage.clickEditar()

    await editPage.cambiarSector('MANUFACTURA')
    await editPage.guardarCambios()

    await expect(
      editPage.page.getByRole('heading', { level: 1, name: 'TECSUP MOCK' }),
    ).toBeVisible({ timeout: 10000 })

    await expect(editPage.page.getByText('Manufactura')).toBeVisible()
  })
})
