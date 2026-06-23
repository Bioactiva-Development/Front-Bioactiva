import { test, expect, type Page, type Locator } from "@playwright/test";

// ---------------------------------------------------------------------------
// Mock data — OrganizacionDtoOut (backend camelCase)
// ---------------------------------------------------------------------------
const MOCK_ORG_ID = "00000000-0000-0000-0000-000000000001";

const MOCK_ORG = {
  id: MOCK_ORG_ID,
  codigoCliente: "TEC-MOCK-001",
  nombre: "TECSUP MOCK",
  nombreComercial: "TECSUP SEDE LIMA MOCK",
  subArea: null,
  ruc: "20117592899",
  tipo: "EMPRESA_NACIONAL",
  linkedin: null,
  ubicacion: "LIMA",
  sector: "EDUCACION",
  tamano: "MEDIANO",
  actividadEconomica: "Elaboracion de productos educativos",
  alianzasEstrategicas: null,
  idContactoActivo: null,
  idAuthor: 1,
  createdAt: "2026-06-19T00:00:00Z",
  updatedAt: "2026-06-19T00:00:00Z",
};

const MOCK_CONTACTOS = [
  {
    id: 1,
    nombres: "Carlos",
    apellidos: "Perez",
    vocativo: "SR.",
    cargo: "Gerente General",
    correo: "carlos@tecsup.pe",
    telefono: "+51999000001",
  },
  {
    id: 2,
    nombres: "Maria",
    apellidos: "Lopez",
    vocativo: "SRA.",
    cargo: "Directora de Operaciones",
    correo: "maria@tecsup.pe",
  },
];

const MOCK_LEADS = [
  {
    id: 101,
    servicioInteres: "Consultoría Técnica",
    estado: "CIERRE_SIN_VENTA",
    createdAt: "2026-06-19T00:00:00.000Z",
    encargadoName: "Joseph Anderson Cose Rojas",
    idOrg: MOCK_ORG_ID,
    organizationName: "TECSUP MOCK",
    idEncargado: 1,
    idAuthor: 1,
    updatedAt: "2026-06-19T00:00:00.000Z",
    ultimoCambioEstado: "2026-06-19T00:00:00.000Z",
    comentarios: null,
    desafioOportunidad: null,
    canalCaptacion: null,
    idContacto: null,
    contactName: null,
    fechaCierre: null,
    fechaCierreEstimada: null,
    fecha_cierre: null,
    activityAlert: null,
  },
];

const MOCK_COTIZACIONES = [
  {
    id: 201,
    nombreServicio: "Formulación de Proyecto",
    monto: "0.00",
    tipo: "PEN",
    estado: "ENVIADA",
    fechaCot: "2026-06-19T00:00:00.000Z",
    dirigido: "Carlos Perez",
    nombreRemitente: "Fabricio Alonso Lanche Pacsi",
    cliente: null,
    producto: null,
    observacion: null,
    linkPropuesta: null,
    idLead: 101,
    leadServicioInteres: "Consultoría Técnica",
    leadEstado: "CIERRE_SIN_VENTA",
    contactName: null,
    idRemitente: 1,
    remitenteName: "Fabricio Alonso Lanche Pacsi",
    idAuthor: 1,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Route interceptors
// ---------------------------------------------------------------------------
async function setupDetailMocks(page: Page) {
  // GET /organizations/:id (detail)
  await page.route(`**/organizations/${MOCK_ORG_ID}`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_ORG),
    });
  });

  // GET /contacts/organization/:id
  await page.route(`**/contacts/organization/${MOCK_ORG_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_CONTACTOS),
    });
  });

  // GET /leads?idOrg=:id&limit=100
  await page.route("**/leads", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_LEADS),
    });
  });

  // GET /quotations?idOrg=:id&limit=100
  await page.route("**/quotations", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_COTIZACIONES),
    });
  });
}

async function cleanupMocks(page: Page) {
  await page.unrouteAll({ behavior: "wait" });
}

// ---------------------------------------------------------------------------
// Page Object
// ---------------------------------------------------------------------------
class OrganizacionDetallePage {
  constructor(readonly page: Page) {}

  async goto(id: string = MOCK_ORG_ID) {
    await this.page.goto(
      `https://bioactiva.ingsoftware.lat/organizaciones/${id}`,
    );
    await expect(this.page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 15000,
    });
  }

  get headingNombre() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get badgeRuc() {
    return this.page.getByText(/^RUC /);
  }

  get badgePrivada() {
    return this.page.getByText("Privada");
  }

  get badgeMediana() {
    return this.page.getByText("Mediana");
  }

  get badgeSector() {
    return this.page.getByText("Educacion");
  }

  get badgeUbicacion() {
    return this.page.getByText("LIMA", { exact: true });
  }

  get contactosHeading() {
    return this.page.getByRole("heading", { name: /Contactos asociados/ });
  }

  get leadsHeading() {
    return this.page.getByRole("heading", { name: /Historial de leads/ });
  }

  get cotizacionesHeading() {
    return this.page.getByRole("heading", {
      name: /Historial de cotizaciones/,
    });
  }

  get contactoCard() {
    return this.page.getByText("Carlos Perez");
  }

  get volverBtn() {
    return this.page.getByRole("button", { name: "Volver a Organizaciones" });
  }

  get editarBtn() {
    return this.page.getByRole("button", { name: "Editar organización" });
  }

  async clickVolver() {
    await this.volverBtn.click();
    await this.page.waitForURL("**/organizaciones$");
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.describe("Módulo de Organizaciones — Detalle", () => {
  let detallePage: OrganizacionDetallePage;
  // detallePage es un objeto de tipo OrganizacionDetallePage que se inicializa antes de cada test en el bloque beforeEach.
  //  Este objeto representa la página de detalle
  // de una organización y proporciona métodos y propiedades para interactuar con los elementos de la página durante las pruebas.

  test.beforeEach(async ({ page }) => {
    await setupDetailMocks(page);
    detallePage = new OrganizacionDetallePage(page);
    await detallePage.goto();
  });

  test.afterEach(async ({ page }) => {
    await cleanupMocks(page);
  });

  test("Debería mostrar la información general de la organización", async () => {
    await expect(detallePage.headingNombre).toHaveText("TECSUP MOCK");
    await expect(detallePage.badgeRuc).toBeVisible();
    await expect(detallePage.badgeRuc).toContainText("20117592899");
    await expect(detallePage.badgePrivada).toBeVisible();
    await expect(detallePage.badgeMediana).toBeVisible();
    await expect(detallePage.badgeSector).toBeVisible();
    await expect(detallePage.badgeUbicacion).toBeVisible();
  });

  test("Debería mostrar la sección de contactos asociados", async () => {
    await expect(detallePage.contactosHeading).toBeVisible();
    await expect(detallePage.contactoCard).toBeVisible();
  });

  // test de leads. Version existen y version no existen
  test("Debería mostrar el estado vacío cuando la organización no tiene leads", async ({
    page,
  }) => {
    // Simulamos que el backend responde un arreglo vacío []
    await page.route("**/api/organizations/*/leads", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await expect(detallePage.leadsHeading).toBeVisible();
    // Aquí SÍ esperas que sea visible el mensaje de vacío de forma segura
    await expect(page.getByText("Sin leads registrados")).toBeVisible();
  });

  test("Debería mostrar la lista de leads cuando la organización sí tiene datos", async ({
    page,
  }) => {
    // Simulamos que el backend responde con un lead falso
    const mockLeads = [{ id: 1, nombre: "Lead de Prueba" }];
    await page.route("**/api/organizations/*/leads", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockLeads),
      });
    });

    await expect(detallePage.leadsHeading).toBeVisible();
    // Verificamos que NO se vea el mensaje de vacío y que SÍ se vea el dato simulado
    await expect(page.getByText("Sin leads registrados")).not.toBeVisible();
    await expect(page.getByText("Lead de Prueba")).toBeVisible();
  });

  test.describe("Historial de Cotizaciones — Escenarios de Datos", () => {
    test("Debería mostrar el estado vacío cuando la organización no registra cotizaciones", async ({
      page,
    }) => {
      // Interceptamos la petición de cotizaciones de la organización y devolvemos un arreglo vacío []
      await page.route("**/api/organizations/*/quotes", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
      });

      await expect(detallePage.cotizacionesHeading).toBeVisible();

      // Aquí SÍ es una buena práctica esperar que el aviso de "Sin cotizaciones" sea visible
      await expect(
        page.getByText("Sin cotizaciones registradas"),
      ).toBeVisible();
    });

    test("Debería listar las cotizaciones correctamente cuando la organización cuenta con historial", async ({
      page,
    }) => {
      // Simulamos un backend que responde exitosamente con una cotización de prueba
      const mockQuotes = [
        {
          id: "q-101",
          codigo: "COT-2026-001",
          monto: 1500,
          estado: "APROBADO",
        },
      ];

      await page.route("**/api/organizations/*/quotes", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockQuotes),
        });
      });

      await expect(detallePage.cotizacionesHeading).toBeVisible();

      // Asertamos de forma segura: NO debe verse el mensaje de vacío y SÍ debe verse el dato simulado
      await expect(
        page.getByText("Sin cotizaciones registradas"),
      ).not.toBeVisible();
      await expect(page.getByText("COT-2026-001")).toBeVisible();
    });
  });

  test("Debería permitir volver al listado de organizaciones", async () => {
    await detallePage.clickVolver();
    await expect(detallePage.page).toHaveURL(/\/organizaciones$/);
  });
});
