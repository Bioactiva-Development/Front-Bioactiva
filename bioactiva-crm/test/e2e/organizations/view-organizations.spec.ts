import { test, expect, type Page, type Locator } from '@playwright/test'

// ---------------------------------------------------------------------------
// Mock data SUNAT
// ---------------------------------------------------------------------------
const MOCK_SUNAT_RUC = {
  ruc: '20601258529',
  razonSocial: 'ALTOMAYO PERU S.A.C.',
  nombreComercial: 'Altomayo',
  ubicacion: 'AV. REPUBLICA DE PANAMA NRO. 3565 LIMA - LIMA - SAN ISIDRO',
  actividadEconomica: 'ELABORACION DE CAFE',
}

const MOCK_SUNAT_NOMBRE_RESULTS = [
  { ruc: '20601258529', razonSocial: 'ALTOMAYO PERU S.A.C.', ubicacion: 'LIMA', estado: 'ACTIVO' },
  { ruc: '20524967627', razonSocial: 'CACAO DE AROMA S.A.C.', ubicacion: 'SAN MARTIN', estado: 'ACTIVO' },
]

async function setupSunatMocks(page: Page) {
  await page.route('**/organizations/sunat*', async (route) => {
    const url = new URL(route.request().url())
    const query = url.searchParams.get('query') ?? ''

    if (/^\d{11}$/.test(query)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SUNAT_RUC),
      })
      return
    }

    const q = query.toLowerCase()
    const filtrados = MOCK_SUNAT_NOMBRE_RESULTS.filter((r) =>
      r.razonSocial.toLowerCase().includes(q),
    )
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(filtrados),
    })
  })
}

async function cleanupMocks(page: Page) {
  await page.unrouteAll({ behavior: 'wait' })
}

// ---------------------------------------------------------------------------
// Page Object: Listado de organizaciones
// ---------------------------------------------------------------------------
class OrganizacionesListPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('https://bioactiva.ingsoftware.lat')
    await this.page.getByRole('link', { name: 'Organizaciones' }).click()
    await this.page.waitForURL('**/organizaciones')
  }

  get searchInput(): Locator {
    return this.page.getByPlaceholder('Buscar por nombre, sector, tamaño o tipo...')
  }

  get columnHeaders(): Locator {
    return this.page.getByRole('columnheader')
  }

  get filas(): Locator {
    return this.page.locator('table tbody tr')
  }

  get sectorSelect(): Locator {
    return this.page.getByRole('combobox').first()
  }

  get nuevaOrganizacionBtn(): Locator {
    return this.page.getByRole('button', { name: 'Nueva Organización' })
  }

  get validadorSunatBtn(): Locator {
    return this.page.getByRole('button', { name: 'Validador SUNAT' })
  }

  async buscar(texto: string) {
    await expect(this.searchInput).toBeVisible({ timeout: 10000 })
    await this.searchInput.fill(texto)
    await this.page.waitForTimeout(600)
  }

  async clickNuevaOrganizacion() {
    await this.nuevaOrganizacionBtn.click()
    await this.page.waitForURL('**/organizaciones/nueva')
  }

  async clickValidadorSunat() {
    await this.validadorSunatBtn.click()
  }

  async esperarResultados() {
    await expect(this.filas.first()).toBeVisible({ timeout: 10000 })
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.describe('Módulo de Organizaciones — Listado', () => {
  let listPage: OrganizacionesListPage

  test.beforeEach(async ({ page }) => {
    await setupSunatMocks(page)
    listPage = new OrganizacionesListPage(page)
    await listPage.goto()
  })

  test.afterEach(async ({ page }) => {
    await cleanupMocks(page)
  })

  test('Debería visualizar la tabla con columnas y filtros principales', async () => {
    await expect(listPage.columnHeaders.nth(0)).toHaveText('Organización')
    await expect(listPage.columnHeaders.nth(1)).toHaveText('RUC')
    await expect(listPage.columnHeaders.nth(2)).toHaveText('Sector')
    await expect(listPage.columnHeaders.nth(3)).toHaveText('Tamaño')
    await expect(listPage.columnHeaders.nth(4)).toHaveText('Acciones')

    await expect(listPage.searchInput).toBeVisible()
  })

  test('Debería filtrar organizaciones por texto de búsqueda', async () => {
    await listPage.esperarResultados()

    const filasAntes = await listPage.filas.count()
    expect(filasAntes).toBeGreaterThan(0)

    await listPage.buscar('TECSUP')

    const filasDespues = await listPage.filas.count()
    expect(filasDespues).toBeLessThanOrEqual(filasAntes)
  })

  test('Debería abrir el modal Validador SUNAT desde el listado', async () => {
    await listPage.clickValidadorSunat()
    await expect(
      listPage.page.getByRole('heading', { name: 'Validador SUNAT' }),
    ).toBeVisible()
  })

  test('Debería navegar a Nueva Organización desde el botón', async () => {
    await listPage.clickNuevaOrganizacion()
    await expect(listPage.page).toHaveURL(/\/organizaciones\/nueva/)
    await expect(
      listPage.page.getByRole('heading', { name: 'Nueva Organización' }),
    ).toBeVisible()
  })
})
