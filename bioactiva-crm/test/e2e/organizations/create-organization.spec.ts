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

async function setupCreateMock(
  page: Page,
  options: { shouldFail?: boolean; errorMessage?: string; status?: number } = {},
) {
  const { shouldFail = false, errorMessage = 'El RUC ya se encuentra registrado.', status = 409 } = options

  await page.route('**/organizations', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback()
      return
    }

    if (shouldFail) {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ message: errorMessage }),
      })
      return
    }

    const body = route.request().postDataJSON()
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: `org-mock-${Date.now()}`,
        codigoCliente: body.codigoCliente ?? 'MOCK-001',
        nombre: body.nombre,
        nombreComercial: body.nombreComercial,
        subArea: body.subArea ?? null,
        ruc: body.ruc ?? null,
        tipo: body.tipo,
        tamano: body.tamano,
        sector: body.sector ?? null,
        ubicacion: body.ubicacion ?? null,
        actividadEconomica: body.actividadEconomica ?? null,
        alianzasEstrategicas: body.alianzasEstrategicas ?? null,
        linkedin: body.linkedin ?? null,
        idContactoActivo: null,
        idAuthor: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    })
  })
}

async function cleanupMocks(page: Page) {
  await page.unrouteAll({ behavior: 'wait' })
}

// ---------------------------------------------------------------------------
// Page Object: Formulario de nueva organización
// ---------------------------------------------------------------------------
class NuevaOrganizacionPage {
  constructor(readonly page: Page) {}

  get codigoInput(): Locator {
    return this.page.locator('#of-codigo')
  }

  get rucInput(): Locator {
    return this.page.locator('#of-ruc')
  }

  get nombreInput(): Locator {
    return this.page.locator('#of-nombre')
  }

  get nombreComercialInput(): Locator {
    return this.page.locator('#of-nombre-comercial')
  }

  get subAreaInput(): Locator {
    return this.page.locator('#of-sub-area')
  }

  get tipoSelect(): Locator {
    return this.page.locator('#of-tipo')
  }

  get tamanoSelect(): Locator {
    return this.page.locator('#of-tamano')
  }

  get sectorSelect(): Locator {
    return this.page.locator('#of-sector')
  }

  get ubicacionInput(): Locator {
    return this.page.locator('#of-ubicacion')
  }

  get actividadInput(): Locator {
    return this.page.locator('#of-actividad')
  }

  get guardarBtn(): Locator {
    return this.page.getByRole('button', { name: /Guardar organización/ })
  }

  get bannerError(): Locator {
    return this.page.locator('.bg-red-50.border-red-200')
  }

  async abrirSunat() {
    await this.page.getByRole('button', { name: 'Validador SUNAT' }).click()
    await expect(
      this.page.getByRole('heading', { name: 'Validador SUNAT' }),
    ).toBeVisible()
  }

  get sunatTabRuc(): Locator {
    return this.page.getByRole('button', { name: 'RUC', exact: true })
  }

  get sunatTabRazonSocial(): Locator {
    return this.page.getByRole('button', { name: 'Razón social', exact: true })
  }

  get sunatInputBusqueda(): Locator {
    return this.page.getByPlaceholder(/Ej: (20464993879|Altomayo)/)
  }

  get sunatBtnUsarDatos(): Locator {
    return this.page.getByRole('button', { name: 'Usar estos datos' })
  }

  async buscarSunatPorRuc(ruc: string) {
    await this.sunatTabRuc.click()
    await this.sunatInputBusqueda.fill(ruc)
    await this.page.waitForTimeout(200)
    await this.sunatInputBusqueda.press('Enter')
  }

  async usarDatosSunat() {
    await expect(this.sunatBtnUsarDatos).toBeVisible()
    await this.sunatBtnUsarDatos.click()
  }

  async llenarFormulario(data: {
    codigo_cliente?: string
    ruc?: string
    nombre: string
    nombre_comercial: string
    sub_area?: string
    tipo: string
    tamano: string
    sector: string
    ubicacion?: string
    actividad_economica?: string
    linkedin?: string
    alianzas_estrategicas?: string
  }) {
    if (data.codigo_cliente !== undefined) {
      await this.codigoInput.fill(data.codigo_cliente)
    }
    if (data.ruc !== undefined) {
      await this.rucInput.fill(data.ruc)
    }
    await this.nombreInput.fill(data.nombre)
    await this.nombreComercialInput.fill(data.nombre_comercial)
    if (data.sub_area) await this.subAreaInput.fill(data.sub_area)
    await this.tipoSelect.selectOption(data.tipo)
    await this.tamanoSelect.selectOption(data.tamano)
    await this.sectorSelect.selectOption(data.sector)
    if (data.ubicacion) await this.ubicacionInput.fill(data.ubicacion)
    if (data.actividad_economica) await this.actividadInput.fill(data.actividad_economica)
  }

  async guardar() {
    await this.guardarBtn.click()
  }

  async obtenerError(): Promise<string | null> {
    try {
      return await this.bannerError.textContent()
    } catch {
      return null
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.describe('Módulo de Organizaciones — Creación', () => {
  let nuevaOrgPage: NuevaOrganizacionPage

  test.beforeEach(async ({ page }) => {
    await setupSunatMocks(page)
    nuevaOrgPage = new NuevaOrganizacionPage(page)
    await page.goto('https://bioactiva.ingsoftware.lat/organizaciones/nueva')
    await expect(
      page.getByRole('heading', { name: 'Nueva Organización' }),
    ).toBeVisible()
  })

  test.afterEach(async ({ page }) => {
    await cleanupMocks(page)
  })

  // -----------------------------------------------------------------------
  // Escenario 1 — Camino feliz: SUNAT por RUC → autocompletar → guardar
  // -----------------------------------------------------------------------
  test('Debería crear una organización usando datos de SUNAT por RUC', async ({ page }) => {
    await setupCreateMock(page, { shouldFail: false })

    await nuevaOrgPage.abrirSunat()
    await nuevaOrgPage.buscarSunatPorRuc(MOCK_SUNAT_RUC.ruc)

    await expect(page.getByText(MOCK_SUNAT_RUC.razonSocial)).toBeVisible()
    await nuevaOrgPage.usarDatosSunat()

    await expect(nuevaOrgPage.codigoInput).toHaveValue(/^[A-Z-]+/)
    await expect(nuevaOrgPage.nombreInput).toHaveValue(MOCK_SUNAT_RUC.razonSocial)

    await nuevaOrgPage.tipoSelect.selectOption('Privada')
    await nuevaOrgPage.tamanoSelect.selectOption('Mediana')
    await nuevaOrgPage.sectorSelect.selectOption('AGROALIMENTARIA')

    await nuevaOrgPage.guardar()
    await expect(page).toHaveURL(/\/organizaciones$/, { timeout: 10000 })
  })

  // -----------------------------------------------------------------------
  // Escenario 2 — Camino negativo: RUC duplicado → error visible
  // -----------------------------------------------------------------------
  test('Debería mostrar un mensaje de error si el RUC ya está registrado', async ({ page }) => {
    await setupCreateMock(page, {
      shouldFail: true,
      status: 409,
      errorMessage: 'El RUC ya se encuentra registrado.',
    })

    await nuevaOrgPage.llenarFormulario({
      codigo_cliente: `DUP-${Date.now()}`,
      ruc: '20117592899',
      nombre: 'Empresa Test Duplicado',
      nombre_comercial: 'Test Duplicado',
      tipo: 'Privada',
      tamano: 'Mediana',
      sector: 'OTROS',
    })

    await nuevaOrgPage.guardar()
    await page.waitForTimeout(1000)

    const errorText = await nuevaOrgPage.obtenerError()
    expect(errorText).toContain('El RUC ya se encuentra registrado')
  })

  // -----------------------------------------------------------------------
  // Escenario 3 — Flujo alternativo: registro manual sin RUC
  // -----------------------------------------------------------------------
  test('Debería permitir el registro manual mediante Código de Cliente sin RUC', async ({ page }) => {
    await setupCreateMock(page, { shouldFail: false })

    const codigoUnico = `MAN-${Math.floor(Math.random() * 90000) + 10000}`

    await nuevaOrgPage.llenarFormulario({
      codigo_cliente: codigoUnico,
      nombre: 'Empresa Manual Test',
      nombre_comercial: 'Manual Test',
      sub_area: 'Gerencia de Pruebas',
      tipo: 'Privada',
      tamano: 'Micro',
      sector: 'TECNOLOGIA',
      ubicacion: 'Lima, Peru',
      actividad_economica: 'Servicios de prueba automatizada',
    })

    await expect(nuevaOrgPage.guardarBtn).toBeEnabled()
    await nuevaOrgPage.guardar()

    await expect(page).toHaveURL(/\/organizaciones$/, { timeout: 10000 })
  })

  // -----------------------------------------------------------------------
  // Escenario 4 — Validación: formulario vacío
  // -----------------------------------------------------------------------
  test('Debería mostrar errores de validación al enviar formulario vacío', async ({ page }) => {
    await setupCreateMock(page, { shouldFail: false })

    await nuevaOrgPage.guardar()
    await page.waitForTimeout(300)

    await expect(page.getByText('El nombre es obligatorio')).toBeVisible()
    await expect(page.getByText('El nombre comercial es obligatorio')).toBeVisible()
    await expect(page.getByText('El tipo es obligatorio')).toBeVisible()
    await expect(page.getByText('El tamaño es obligatorio')).toBeVisible()
    await expect(page.getByText('El sector es obligatorio')).toBeVisible()
  })
})
