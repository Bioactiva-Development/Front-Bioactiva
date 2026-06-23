import { test, expect, type Page, type Locator } from "@playwright/test";

// variable backend url
const BACKEND_URL =
  process.env.BACKEND_URL || "https://backend-bioactiva.ingsoftware.lat";

// ---------------------------------------------------------------------------
// Mock data SUNAT
// ---------------------------------------------------------------------------
const MOCK_SUNAT_RUC = {
  ruc: "20601258529",
  razonSocial: "ALTOMAYO PERU S.A.C.",
  nombreComercial: "Altomayo",
  ubicacion: "AV. REPUBLICA DE PANAMA NRO. 3565 LIMA - LIMA - SAN ISIDRO",
  actividadEconomica: "ELABORACION DE CAFE",
};

const MOCK_SUNAT_NOMBRE_RESULTS = [
  {
    ruc: "20601258529",
    razonSocial: "ALTOMAYO PERU S.A.C.",
    ubicacion: "LIMA",
    estado: "ACTIVO",
  },
  {
    ruc: "20524967627",
    razonSocial: "CACAO DE AROMA S.A.C.",
    ubicacion: "SAN MARTIN",
    estado: "ACTIVO",
  },
];

// Listado de organizaciones base para que las tablas no dependan de la base de datos viva
const MOCK_LISTADO_ORGANIZACIONES = [
  {
    id: "7f93c302-9d93-4889-9eb5-8036bd779b27",
    codigoCliente: "WM-177",
    nombre: "TECSUP S.A.",
    nombreComercial: "TECSUP",
    ruc: "20117592899",
    tipo: "PRIVADA",
    sector: "EDUCACION",
    tamano: "MEDIANA",
    ubicacion: "JR. MEDRANO SILVA NRO. 165 LIMA - LIMA - BARRANCO",
  },
  {
    id: "8c93c302-9d93-4889-9eb5-8036bd779b28",
    codigoCliente: "WM-178",
    nombre: "SAN LUIS S.A.C.",
    nombreComercial: "SAN LUIS",
    ruc: "20611777559",
    tipo: "PRIVADA",
    sector: "EDUCACION",
    tamano: "MEDIANA",
    ubicacion: "CAL. AUGUSTO ANGULO NRO. 130 LIMA - LIMA - MIRAFLORES",
  },
];
async function setupSunatMocks(page: Page) {
  await page.route(`${BACKEND_URL}/organizations/sunat*`, async (route) => {
    const url = new URL(route.request().url());

    // 2. Leemos la consulta y usamos decodeURIComponent para transformar "yuri+abel" en "yuri abel"
    const queryRaw = url.searchParams.get("query") ?? "";
    const query = decodeURIComponent(queryRaw.trim());

    //escenario A:
    if (/^\d{11}$/.test(query)) {
      //verificamos que lo que se envia por la query cumpal con lo regex expresion de 11 decimales
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SUNAT_RUC),
      });
      return;
    }

    // escenario B: busqueda por nombre

    const q = query.toLowerCase();
    const filtrados = MOCK_SUNAT_NOMBRE_RESULTS.filter((r) =>
      r.razonSocial.toLowerCase().includes(q),
    );

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(filtrados),
    });
  });
}

async function setupOrganizacionesMocks(page: Page, mockData: any[]) {
  await page.route(`${BACKEND_URL}/organizations*`, async (route) => {
    // Si la llamada va dirigida al sub-endpoint de la SUNAT, la dejamos pasar para que la controle su respectivo mock
    if (route.request().url().includes("/sunat")) {
      return route.fallback();
    }

    const url = new URL(route.request().url());
    const searchRaw =
      url.searchParams.get("search") ?? url.searchParams.get("query") ?? "";
    const search = decodeURIComponent(searchRaw.trim()).toLowerCase();

    if (search) {
      // Si el frontend está pidiendo un filtrado dinámico al backend
      const filtradas = mockData.filter(
        (org) =>
          org.nombre.toLowerCase().includes(search) || org.ruc.includes(search),
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(filtradas),
      });
    } else {
      // Respuesta por defecto con los datos mock controlados
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockData),
      });
    }
  });
}

async function cleanupMocks(page: Page) {
  await page.unrouteAll({ behavior: "wait" });
}

// ---------------------------------------------------------------------------
// Page Object: Listado de organizaciones
// ---------------------------------------------------------------------------
class OrganizacionesListPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("https://bioactiva.ingsoftware.lat");
    await this.page.getByRole("link", { name: "Organizaciones" }).click();
    await this.page.waitForURL("**/organizaciones");
  }

  get searchInput(): Locator {
    return this.page.getByPlaceholder(
      "Buscar por nombre, sector, tamaño o tipo...",
    );
  }

  get columnHeaders(): Locator {
    return this.page.getByRole("columnheader");
  }

  get filas(): Locator {
    return this.page.locator("table tbody tr");
  }

  get sectorSelect(): Locator {
    return this.page.getByRole("combobox").first();
  }

  get nuevaOrganizacionBtn(): Locator {
    return this.page.getByRole("button", { name: "Nueva Organización" });
  }

  get validadorSunatBtn(): Locator {
    return this.page.getByRole("button", { name: "Validador SUNAT" });
  }

  async buscar(texto: string) {
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.fill(texto);
    await this.page.waitForTimeout(1000);
  }

  async clickNuevaOrganizacion() {
    await this.nuevaOrganizacionBtn.click();
    await this.page.waitForURL("**/organizations/nueva");
  }

  async clickValidadorSunat() {
    await this.validadorSunatBtn.click();
  }

  async esperarResultados() {
    await expect(this.filas.first()).toBeVisible({ timeout: 10000 });
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.describe("Módulo de Organizaciones — Listado", () => {
  let listPage: OrganizacionesListPage; // listPage es una pagina que esta en la direcicon /organizaciones

  test.beforeEach(async ({ page }) => {
    await setupSunatMocks(page);
    listPage = new OrganizacionesListPage(page);
    await listPage.goto();
  });

  test.afterEach(async ({ page }) => {
    await cleanupMocks(page);
  });

  test("Debería visualizar la tabla con sus columnas cuando existen organizaciones registradas", async ({
    page,
  }) => {
    // 1. REGISTRO DE MOCK: Forzamos la presencia de nuestros datos controlados en español
    await setupOrganizacionesMocks(page, MOCK_LISTADO_ORGANIZACIONES);

    // 2. NAVEGACIÓN POST-MOCK
    await listPage.goto();

    // 3. ASERCIONES
    await expect(listPage.columnHeaders.nth(0)).toHaveText("Organización");
    await expect(listPage.columnHeaders.nth(1)).toHaveText("RUC");
    await expect(listPage.columnHeaders.nth(2)).toHaveText("Sector");
    await expect(listPage.columnHeaders.nth(3)).toHaveText("Tamaño");
    await expect(listPage.columnHeaders.nth(4)).toHaveText("Acciones");

    // Validamos que los registros inyectados sean perfectamente visibles
    await expect(page.getByText("TECSUP S.A.")).toBeVisible();
    await expect(page.getByText("SAN LUIS S.A.C.")).toBeVisible();
  });

  test('Debería mostrar el diseño de "Estado Vacío" cuando no hay organizaciones registradas', async ({
    page,
  }) => {
    // 1. REGISTRO DE MOCK: Forzamos que la API devuelva una lista vacía
    await setupOrganizacionesMocks(page, []);

    // 2. NAVEGACIÓN
    await listPage.goto();

    // 3. ASERCIONES: Validamos el contenedor de estado vacío exclusivamente
    await expect(
      page.getByText("No se encontraron organizaciones"),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Intenta con otros filtros o registra una nueva organización",
      ),
    ).toBeVisible();

    // Aseguramos que la tabla no se dibuje bajo este escenario
    await expect(listPage.columnHeaders.first()).not.toBeVisible();
  });

  test("Debería filtrar organizaciones por texto de búsqueda de forma resiliente", async ({
    page,
  }) => {
    // 1. REGISTRO DE MOCK: Inyectamos datos base conocidos
    await setupOrganizacionesMocks(page, MOCK_LISTADO_ORGANIZACIONES);

    // 2. NAVEGACIÓN
    await listPage.goto();
    await listPage.esperarResultados();

    const filasAntes = await listPage.filas.count();
    expect(filasAntes).toBe(2); // Sabemos con certeza que hay exactamente 2 filas por nuestro mock

    // 3. EJECUCIÓN DE BÚSQUEDA
    await listPage.buscar("TECSUP");

    // 4. ASERCIÓN RESILIENTE: Verificamos que el listado se haya reducido
    const filasDespues = await listPage.filas.count();
    expect(filasDespues).toBe(1); // Filtro exitoso: Solo queda TECSUP S.A.
    await expect(page.getByText("TECSUP S.A.")).toBeVisible();
    await expect(page.getByText("SAN LUIS S.A.C.")).not.toBeVisible();
  });

  test("Debería abrir el modal Validador SUNAT desde el listado", async () => {
    await listPage.clickValidadorSunat();
    await expect(
      listPage.page.getByRole("heading", { name: "Validador SUNAT" }),
    ).toBeVisible();
  });

  // completado y pasado:;

  test("Debería navegar a Nueva Organización desde el botón", async () => {
    await listPage.clickNuevaOrganizacion();
    await expect(listPage.page).toHaveURL(/\/organizaciones\/nueva/);
    await expect(
      listPage.page.getByRole("heading", { name: "Nueva Organización" }),
    ).toBeVisible();
  });
});
