// import { test as setup, expect } from "@playwright/test";
// import dotenv from "dotenv";
// import path from "path";

// dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// const authFile = "test/e2e/.auth/user.json";

// setup("authenticate", async ({ page }) => {
//   setup.setTimeout(120000); // Aumentamos el timeout para dar tiempo a resolver el captcha
//   console.log("🔑 Iniciando autenticación...");

//   // 1. Ir a la página de login
//   await page.goto("https://bioactiva.ingsoftware.lat/login", {
//     waitUntil: "networkidle",
//   });

//   // 2. Rellenar las credenciales automáticamente
//   await page
//     .getByRole("textbox", { name: "Correo electrónico" })
//     .fill(process.env.TEST_USER!);
//   await page
//     .getByRole("textbox", { name: "Contraseña" })
//     .fill(process.env.TEST_PASS!);

//   console.log("\n🟡 === ACCIÓN MANUAL REQUERIDA ===");
//   console.log("1. Resuelve el reCAPTCHA en la ventana del navegador.");
//   console.log('2. Haz clic en el botón "Ingresar".');
//   console.log(
//     "Playwright detectará automáticamente cuando entres y guardará la sesión.\n",
//   );

//   // 3. TRUCO: En lugar de pausar, esperamos a que la URL cambie a una ruta logueada.
//   // Le damos un tiempo generoso (ej. 60 segundos) para que te dé tiempo de resolver el captcha.
//   await expect(page).toHaveURL(/.*(dashboard|home|organizations|inicio)/i, {
//     timeout: 1000000,
//   });

//   // 4. Guardar el estado de la sesión
//   await page.context().storageState({ path: authFile });
//   console.log("✅ Sesión guardada correctamente en:", authFile);
// });

// version antigua de cpatacha arriba. Esta me permitio tener el user.json

import { test as setup, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Asegúrate de que esta ruta sea EXACTAMENTE la misma que pusiste en tu playwright.config.ts
const authFile = "test/e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  setup.setTimeout(120000); // 45 segsminutos de tiempo total para este setup

  await page.goto("https://bioactiva.ingsoftware.lat/login", {
    waitUntil: "networkidle",
  });

  await page
    .getByRole("textbox", { name: "Correo electrónico" })
    .fill(process.env.TEST_USER!);
  await page
    .getByRole("textbox", { name: "Contraseña" })
    .fill(process.env.TEST_PASS!);

  console.log(
    "🟡 POR FAVOR RESUELVE EL CAPTCHA Y HAZ CLIC EN INGRESAR EN LA VENTANA... 🟡",
  );

  // El script se detiene aquí esperando que tú resuelvas el captcha.
  // Avanzará SOLO cuando detecte que la URL cambió porque tuviste éxito.
  await expect(page).toHaveURL(/.*(dashboard|home|organizations|inicio)/i, {
    timeout: 90000,
  });

  // Aquí se crea el archivo con tus cookies frescas
  await page.context().storageState({ path: authFile });
});
