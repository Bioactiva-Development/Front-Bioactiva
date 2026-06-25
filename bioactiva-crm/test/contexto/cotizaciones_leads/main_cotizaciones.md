url:

```html
<div class="space-y-3">
  <div>
    <h1 class="text-xl font-bold text-gray-900">Cotizaciones</h1>
    <p class="text-sm text-gray-400 mt-0.5">
      Gestión de propuestas comerciales
    </p>
  </div>
  <div class="space-y-2">
    <div
      class="flex items-center gap-0.5 sm:gap-1 bg-white border border-gray-100
        rounded-xl px-1 sm:px-1.5 py-1 sm:py-1.5 shadow-sm w-full"
    >
      <button
        class="flex-1 text-center py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer
                bg-emerald-50 text-emerald-700"
      >
        Todas</button
      ><button
        class="flex-1 text-center py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer
                text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      >
        Pendiente</button
      ><button
        class="flex-1 text-center py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer
                text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      >
        Enviada</button
      ><button
        class="flex-1 text-center py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer
                text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      >
        Aceptada</button
      ><button
        class="flex-1 text-center py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer
                text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      >
        Rechazada
      </button>
    </div>
    <div class="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-building2 lucide-building-2 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      >
        <path d="M10 12h4"></path>
        <path d="M10 8h4"></path>
        <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
        <path
          d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"
        ></path>
        <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path></svg
      ><input
        placeholder="Buscar por organización"
        class="w-full pl-8 pr-10 py-2 rounded-xl border border-gray-200
  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
  placeholder:text-gray-400"
        type="text"
        value=""
      />
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
              # Cotización
            </th>
            <th
              class="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
            >
              Período
            </th>
            <th
              class="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
            >
              Contacto
            </th>
            <th
              class="hidden md:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
            >
              Nombre del servicio
            </th>
            <th
              class="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
            >
              Monto
            </th>
            <th
              class="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
            >
              Estado
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
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-blue-50/40"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-blue-600">COT-2026-013</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 0.00</p>
                <p class="text-xs text-gray-400 truncate">Fabricio Lanche</p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-blue-50 text-blue-700"
                  >Enviada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">Fabricio Lanche</p>
              <p class="text-xs text-gray-400 mt-0.5">
                UNIVERSIDAD DE INGENIERIA Y TECNOLOGIA
              </p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">
                Formulación del banco de juegos
              </p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 0.00</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-blue-50 text-blue-700"
                >Enviada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
          <tr
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-red-50/40"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-red-600">COT-2026-012</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 5,000.00</p>
                <p class="text-xs text-gray-400 truncate">Andrés Neely</p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-red-50 text-red-600"
                  >Rechazada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">Andrés Neely</p>
              <p class="text-xs text-gray-400 mt-0.5">
                CENCOSUD RETAIL PERU S.A.
              </p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">
                Inversiones en nuevas tecnologías retail
              </p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 5,000.00</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-red-50 text-red-600"
                >Rechazada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
          <tr
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-blue-50/40"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-blue-600">COT-2026-011</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 1,000.00</p>
                <p class="text-xs text-gray-400 truncate">
                  Mercedes Torres Cáceres
                </p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-blue-50 text-blue-700"
                  >Enviada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">
                Mercedes Torres Cáceres
              </p>
              <p class="text-xs text-gray-400 mt-0.5">VERDUM PERÚ S.A.C.</p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">Consultoría Técnica</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 1,000.00</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-blue-50 text-blue-700"
                >Enviada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
          <tr
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-blue-50/40"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-blue-600">COT-2026-010</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 1,000.00</p>
                <p class="text-xs text-gray-400 truncate">
                  Mercedes Torres Cáceres
                </p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-blue-50 text-blue-700"
                  >Enviada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">
                Mercedes Torres Cáceres
              </p>
              <p class="text-xs text-gray-400 mt-0.5">VERDUM PERÚ S.A.C.</p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">
                Formulación de Proyecto de Innovación
              </p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 1,000.00</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-blue-50 text-blue-700"
                >Enviada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
          <tr
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-emerald-50/30"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-emerald-600">COT-2026-009</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 23,400.00</p>
                <p class="text-xs text-gray-400 truncate">
                  Carlos Heeren Ramos
                </p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-emerald-50 text-emerald-700"
                  >Aceptada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">
                Carlos Heeren Ramos
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                UNIVERSIDAD DE INGENIERIA Y TECNOLOGIA
              </p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">
                Formulación del banco de juegos
              </p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 23,400.00</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-emerald-50 text-emerald-700"
                >Aceptada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
          <tr
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-emerald-50/30"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-emerald-600">COT-2026-008</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 10,000.00</p>
                <p class="text-xs text-gray-400 truncate">Andrés Neely</p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-emerald-50 text-emerald-700"
                  >Aceptada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">Andrés Neely</p>
              <p class="text-xs text-gray-400 mt-0.5">
                CENCOSUD RETAIL PERU S.A.
              </p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">
                Formulación de Proyecto de Innovación
              </p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 10,000.00</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-emerald-50 text-emerald-700"
                >Aceptada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
          <tr
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-emerald-50/30"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-emerald-600">COT-2026-007</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 0.00</p>
                <p class="text-xs text-gray-400 truncate">
                  Carlos Heeren Ramos
                </p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-emerald-50 text-emerald-700"
                  >Aceptada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">
                Carlos Heeren Ramos
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                UNIVERSIDAD DE INGENIERIA Y TECNOLOGIA
              </p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">dasdasd</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 0.00</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-emerald-50 text-emerald-700"
                >Aceptada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
          <tr
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-emerald-50/30"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-emerald-600">COT-2026-006</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 0.00</p>
                <p class="text-xs text-gray-400 truncate">Fabricio Lanche</p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-emerald-50 text-emerald-700"
                  >Aceptada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">Fabricio Lanche</p>
              <p class="text-xs text-gray-400 mt-0.5">
                UNIVERSIDAD DE INGENIERIA Y TECNOLOGIA
              </p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">
                Formulación del banco de juegos
              </p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 0.00</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-emerald-50 text-emerald-700"
                >Aceptada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
          <tr
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-blue-50/40"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-blue-600">COT-2026-005</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 0.00</p>
                <p class="text-xs text-gray-400 truncate">
                  Diego Cavero Belaunde
                </p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-blue-50 text-blue-700"
                  >Enviada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">
                Diego Cavero Belaunde
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                BANCO DE CREDITO DEL PERU
              </p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">Nombre del servicio</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 0.00</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-blue-50 text-blue-700"
                >Enviada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
          <tr
            class="border-b border-gray-50 transition-colors cursor-pointer
        hover:bg-emerald-50/30"
          >
            <td class="px-4 py-3">
              <p class="text-sm font-bold text-emerald-600">COT-2026-004</p>
              <div class="sm:hidden mt-1 space-y-0.5">
                <p class="text-xs text-gray-500">jun. 2026</p>
                <p class="text-xs font-semibold text-gray-700">S/ 999.99</p>
                <p class="text-xs text-gray-400 truncate">Andrés Neely</p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
            bg-emerald-50 text-emerald-700"
                  >Aceptada</span
                >
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm text-gray-600">jun. 2026</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">Andrés Neely</p>
              <p class="text-xs text-gray-400 mt-0.5">
                CENCOSUD RETAIL PERU S.A.
              </p>
            </td>
            <td class="hidden md:table-cell px-4 py-3 max-w-xs">
              <p class="text-sm text-gray-700 truncate">Consultoría Técnica</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <p class="text-sm font-bold text-gray-900">S/ 999.99</p>
            </td>
            <td class="hidden sm:table-cell px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          bg-emerald-50 text-emerald-700"
                >Aceptada</span
              >
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  title="Ver detalle"
                  class="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
                >
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
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="flex items-center justify-between px-6 py-4 border-t border-gray-50"
    >
      <p class="text-sm text-gray-500">Mostrando 1–10 de 13</p>
      <div class="flex items-center gap-2">
        <button
          disabled=""
          class="p-2 rounded-lg text-gray-400 hover:text-gray-600
                    hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹</button
        ><button
          class="w-8 h-8 rounded-lg text-sm font-semibold transition-colors
                      bg-emerald-600 text-white"
        >
          1</button
        ><button
          class="w-8 h-8 rounded-lg text-sm font-semibold transition-colors
                      text-gray-500 hover:bg-gray-50"
        >
          2</button
        ><button
          class="p-2 rounded-lg text-gray-400 hover:text-gray-600
                    hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</div>
```
