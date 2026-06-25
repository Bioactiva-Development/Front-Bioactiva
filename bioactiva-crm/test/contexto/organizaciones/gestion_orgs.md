url: https://bioactiva.ingsoftware.lat/organizaciones

```html
<main class="flex-1 p-4 sm:p-6 print:p-6">
  <div class="space-y-3">
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6"
    >
      <div>
        <h1 class="text-xl font-bold text-gray-900">
          Gestión de Organizaciones
        </h1>
      </div>
      <div class="flex items-center gap-2 sm:shrink-0 sm:ml-4">
        <div class="flex items-center gap-3">
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-xl border-2
                border-emerald-600 text-emerald-600 hover:bg-emerald-50
                text-sm font-semibold transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-search"
              aria-hidden="true"
            >
              <path d="m21 21-4.34-4.34"></path>
              <circle cx="11" cy="11" r="8"></circle></svg
            >Validador SUNAT</button
          ><button
            class="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-emerald-600 hover:bg-emerald-700 text-white
                text-sm font-semibold transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-plus"
              aria-hidden="true"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path></svg
            >Nueva Organización
          </button>
        </div>
      </div>
    </div>
    <div class="space-y-2">
      <div class="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        >
          <path d="m21 21-4.34-4.34"></path>
          <circle cx="11" cy="11" r="8"></circle></svg
        ><input
          placeholder="Buscar por nombre de organización..."
          class="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none focus:border-emerald-400 placeholder:text-gray-400 transition-colors"
          type="text"
          value=""
        />
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <select
          class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400 text-gray-600 transition-colors cursor-pointer"
        >
          <option value="">Todos los sectores</option>
          <option value="ACUICULTURA">Acuicultura</option>
          <option value="ADMINISTRACION_PUBLICA">Administracion publica</option>
          <option value="AGRICOLA">Agricola</option>
          <option value="AGROALIMENTARIA">Agroalimentaria</option>
          <option value="AGROPECUARIO">Agropecuario</option>
          <option value="ALIMENTARIA">Alimentaria</option>
          <option value="ASESORIA">Asesoria</option>
          <option value="BANCA_Y_SEGUROS">Banca y seguros</option>
          <option value="CONSTRUCCION">Construccion</option>
          <option value="CONSULTORIA">Consultoria</option>
          <option value="COOPERACION_TECNICA">Cooperacion tecnica</option>
          <option value="EDUCACION">Educacion</option>
          <option value="ENERGIA">Energia</option>
          <option value="FERRETERIA">Ferreteria</option>
          <option value="FINANZAS">Finanzas</option>
          <option value="FORESTAL">Forestal</option>
          <option value="GANADERIA">Ganaderia</option>
          <option value="INFORMATICA">Informatica</option>
          <option value="MANUFACTURA">Manufactura</option>
          <option value="MINERIA">Mineria</option>
          <option value="OTROS">Otros</option>
          <option value="PESCA">Pesca</option>
          <option value="SALUD">Salud</option>
          <option value="TECNOLOGIA">Tecnologia</option>
          <option value="TEXTIL">Textil</option>
          <option value="TRANSFORMACION">Transformacion</option>
          <option value="TURISMO">Turismo</option></select
        ><select
          class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400 text-gray-600 transition-colors cursor-pointer"
        >
          <option value="">Todos los tamaños</option>
          <option value="Micro">Micro</option>
          <option value="Pequena">Pequeña</option>
          <option value="Mediana">Mediana</option>
          <option value="Grande">Grande</option></select
        ><select
          class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400 text-gray-600 transition-colors cursor-pointer"
        >
          <option value="">Todos los tipos</option>
          <option value="Privada">Privada</option>
          <option value="Publica">Publica</option>
          <option value="ONG">ONG</option>
          <option value="Mixta">Mixta</option>
        </select>
      </div>
    </div>
    <div
      class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-emerald-700 text-white">
              <th
                class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
              >
                Organización
              </th>
              <th
                class="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
              >
                RUC
              </th>
              <th
                class="hidden md:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
              >
                Sector
              </th>
              <th
                class="hidden md:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
              >
                Tamaño
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors cursor-pointer"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center
            justify-center shrink-0"
                  >
                    <span class="text-sm font-bold text-emerald-700">S</span>
                  </div>
                  <div>
                    <p
                      class="text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      SAN LUIS
                    </p>
                    <p class="text-xs text-gray-400 sm:hidden">20611777559</p>
                  </div>
                </div>
              </td>
              <td class="hidden sm:table-cell px-4 py-3">
                <span class="text-sm text-gray-600">20611777559</span>
              </td>
              <td class="hidden md:table-cell px-4 py-3">
                <span class="text-sm text-gray-600">Educacion</span>
              </td>
              <td class="hidden md:table-cell px-4 py-3">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs
          font-bold uppercase tracking-wide
          bg-amber-50 text-amber-600"
                  >Mediana</span
                >
              </td>
              <td class="px-4 py-3">
                <button
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-external-link"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                    ></path>
                  </svg>
                </button>
              </td>
            </tr>
            <tr
              class="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors cursor-pointer"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center
            justify-center shrink-0"
                  >
                    <span class="text-sm font-bold text-emerald-700">T</span>
                  </div>
                  <div>
                    <p
                      class="text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      TECSUP
                    </p>
                    <p class="text-xs text-gray-400 sm:hidden">20117592899</p>
                  </div>
                </div>
              </td>
              <td class="hidden sm:table-cell px-4 py-3">
                <span class="text-sm text-gray-600">20117592899</span>
              </td>
              <td class="hidden md:table-cell px-4 py-3">
                <span class="text-sm text-gray-600">Educacion</span>
              </td>
              <td class="hidden md:table-cell px-4 py-3">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs
          font-bold uppercase tracking-wide
          bg-amber-50 text-amber-600"
                  >Mediana</span
                >
              </td>
              <td class="px-4 py-3">
                <button
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-external-link"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                    ></path>
                  </svg>
                </button>
              </td>
            </tr>
            <tr
              class="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors cursor-pointer"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center
            justify-center shrink-0"
                  >
                    <span class="text-sm font-bold text-emerald-700">U</span>
                  </div>
                  <div>
                    <p
                      class="text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      UNIVERSID.NACIONAL D INGENIER. PETRO-UNI
                    </p>
                    <p class="text-xs text-gray-400 sm:hidden">20111238562</p>
                  </div>
                </div>
              </td>
              <td class="hidden sm:table-cell px-4 py-3">
                <span class="text-sm text-gray-600">20111238562</span>
              </td>
              <td class="hidden md:table-cell px-4 py-3">
                <span class="text-sm text-gray-600">Energia</span>
              </td>
              <td class="hidden md:table-cell px-4 py-3">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs
          font-bold uppercase tracking-wide
          bg-amber-50 text-amber-600"
                  >Mediana</span
                >
              </td>
              <td class="px-4 py-3">
                <button
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-external-link"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                    ></path>
                  </svg>
                </button>
              </td>
            </tr>
            <tr
              class="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors cursor-pointer"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center
            justify-center shrink-0"
                  >
                    <span class="text-sm font-bold text-emerald-700">U</span>
                  </div>
                  <div>
                    <p
                      class="text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      UNIVERSIDAD DE INGENIERIA Y TECNOLOGIA
                    </p>
                    <p class="text-xs text-gray-400 sm:hidden">20545990998</p>
                  </div>
                </div>
              </td>
              <td class="hidden sm:table-cell px-4 py-3">
                <span class="text-sm text-gray-600">20545990998</span>
              </td>
              <td class="hidden md:table-cell px-4 py-3">
                <span class="text-sm text-gray-600"
                  >Educacion<span class="text-gray-400">
                    / Principal - 8530 - ENSEÑANZA SUPERIOR</span
                  ></span
                >
              </td>
              <td class="hidden md:table-cell px-4 py-3">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs
          font-bold uppercase tracking-wide
          bg-gray-100 text-gray-600"
                  >Micro</span
                >
              </td>
              <td class="px-4 py-3">
                <button
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-external-link"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                    ></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        class="flex items-center justify-between px-6 py-4 border-t border-gray-50"
      >
        <p class="text-sm text-gray-500">Mostrando 1–4 de 4</p>
      </div>
    </div>
  </div>
</main>
```
