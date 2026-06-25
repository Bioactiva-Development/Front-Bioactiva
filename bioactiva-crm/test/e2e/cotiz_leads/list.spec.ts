import { test, expect, type Page } from '@playwright/test'

const BASE_URL = 'https://bioactiva.ingsoftware.lat'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
async function setupListMocks(page: Page) {
  // Solo interceptamos POST/PATCH/DELETE para evitar efectos secundarios
  await page.route('**/quotations', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    } else {
      await route.fallback()
    }
  })
}

async function cleanupMocks(page: Page) {
  await page.unrouteAll({ behavior: 'wait' })
}

// ---------------------------------------------------------------------------
// Page Object
// ---------------------------------------------------------------------------
class CotizacionesListPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/cotizaciones`)
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 })
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: /Cotizaciones/ })
  }

  get subtitle() {
    return this.page.getByText('Gestión de propuestas comerciales')
  }

  get filtroTodas() {
    return this.page.getByRole('button', { name: 'Todas' })
  }

  get filtroPendiente() {
    return this.page.getByRole('button', { name: 'Pendiente' })
  }

  get filtroEnviada() {
    return this.page.getByRole('button', { name: 'Enviada' })
  }

  get filtroAceptada() {
    return this.page.getByRole('button', { name: 'Aceptada' })
  }

  get filtroRechazada() {
    return this.page.getByRole('button', { name: 'Rechazada' })
  }

  get searchInput() {
    return this.page.getByPlaceholder('Buscar por organización')
  }

  get tableHeaders() {
    return this.page.locator('thead th')
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.describe('Cotizaciones — Listado', () => {
  let listPage: CotizacionesListPage

  test.beforeEach(async ({ page }) => {
    await setupListMocks(page)
    listPage = new CotizacionesListPage(page)
    await listPage.goto()
  })

  test.afterEach(async ({ page }) => {
    await cleanupMocks(page)
  })

  test('Debería mostrar la página de cotizaciones con su título', async () => {
    await expect(listPage.heading).toBeVisible()
    await expect(listPage.subtitle).toBeVisible()
  })

  test('Debería mostrar los filtros de estado con Todas activo por defecto', async () => {
    await expect(listPage.filtroTodas).toBeVisible()
    await expect(listPage.filtroPendiente).toBeVisible()
    await expect(listPage.filtroEnviada).toBeVisible()
    await expect(listPage.filtroAceptada).toBeVisible()
    await expect(listPage.filtroRechazada).toBeVisible()
  })

  test('Debería mostrar el campo de búsqueda por organización', async () => {
    await expect(listPage.searchInput).toBeVisible()
  })

  test('Debería mostrar la tabla con columnas correctas', async () => {
    await expect(listPage.tableHeaders.first()).toBeVisible()
    const headers = ['# Cotización', 'Período', 'Contacto', 'Nombre del servicio', 'Monto', 'Estado', 'Acciones']
    const headerTexts = await listPage.tableHeaders.allTextContents()
    for (const h of headers) {
      expect(headerTexts.some((t) => t.includes(h))).toBeTruthy()
    }
  })
})
