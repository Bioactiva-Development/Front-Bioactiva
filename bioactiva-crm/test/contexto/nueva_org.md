```html
<main class="flex-1 p-4 sm:p-6 print:p-6">
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6"
    >
      <div>
        <h1 class="text-xl font-bold text-gray-900">Nueva Organización</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          Registra una nueva organización en el CRM
        </p>
      </div>
      <div class="flex items-center gap-2 sm:shrink-0 sm:ml-4">
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
            class="lucide lucide-plus"
            aria-hidden="true"
          >
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path></svg
          >Validador SUNAT
        </button>
      </div>
    </div>
    <div class="max-w-2xl mx-auto">
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6"
      >
        <div class="space-y-1.5">
          <label
            for="of-codigo"
            class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >Código de Cliente <span class="text-red-500">*</span></label
          ><input
            id="of-codigo"
            placeholder="Ej: ORG-2026-001"
            aria-readonly="false"
            class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-red-400 bg-red-50"
            type="text"
            name="codigo_cliente"
          />
          <p class="text-red-500 text-xs">
            El código de cliente es obligatorio
          </p>
        </div>
        <div class="space-y-4">
          <div class="flex gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                  bg-emerald-700 text-white"
            >
              Por RUC</button
            ><button
              type="button"
              class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                  bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Por Razón Social
            </button>
          </div>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label
                for="of-ruc"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >RUC</label
              ><span
                class="text-xs font-medium
                    text-gray-400"
                >0/11</span
              >
            </div>
            <input
              id="of-ruc"
              placeholder="Ingresa RUC (11 dígitos)..."
              maxlength="11"
              class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
              type="text"
              name="ruc"
            />
            <p class="text-xs text-gray-400">
              11 dígitos → datos se completan automáticamente desde SUNAT.
            </p>
          </div>
        </div>
        <div class="space-y-1.5">
          <label
            for="of-nombre"
            class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >Nombre / Razón Social <span class="text-red-500">*</span></label
          ><input
            id="of-nombre"
            placeholder="Nombre de la organización..."
            class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white "
            type="text"
            name="nombre"
          />
        </div>
        <div class="space-y-1.5">
          <label
            for="of-nombre-comercial"
            class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >Nombre Comercial <span class="text-red-500">*</span></label
          ><input
            id="of-nombre-comercial"
            placeholder="Nombre comercial o marca..."
            class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-red-400 bg-red-50 "
            type="text"
            name="nombre_comercial"
          />
          <p class="text-red-500 text-xs">El nombre comercial es obligatorio</p>
        </div>
        <div class="space-y-1.5">
          <label
            for="of-sub-area"
            class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >Área / Departamento
            <span class="text-gray-400 normal-case font-normal"
              >Opcional</span
            ></label
          ><input
            id="of-sub-area"
            placeholder="Ej: Área de Innovación, Gerencia de Proyectos"
            class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
            type="text"
            name="sub_area"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label
              for="of-tipo"
              class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >Tipo <span class="text-red-500">*</span></label
            ><select
              id="of-tipo"
              name="tipo"
              class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-red-400 bg-red-50"
            >
              <option value="">Seleccionar...</option>
              <option value="Privada">Privada</option>
              <option value="Publica">Publica</option>
              <option value="ONG">ONG</option>
              <option value="Mixta">Mixta</option>
            </select>
            <p class="text-red-500 text-xs">El tipo es obligatorio</p>
          </div>
          <div class="space-y-1.5">
            <label
              for="of-tamano"
              class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >Tamaño <span class="text-red-500">*</span></label
            ><select
              id="of-tamano"
              name="tamano"
              class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-red-400 bg-red-50"
            >
              <option value="">Seleccionar...</option>
              <option value="Micro">Micro</option>
              <option value="Pequena">Pequeña</option>
              <option value="Mediana">Mediana</option>
              <option value="Grande">Grande</option>
            </select>
            <p class="text-red-500 text-xs">El tamaño es obligatorio</p>
          </div>
        </div>
        <div class="space-y-1.5">
          <label
            for="of-sector"
            class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >Sector <span class="text-red-500">*</span></label
          ><select
            id="of-sector"
            name="sector"
            class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-red-400 bg-red-50"
          >
            <option value="">Seleccionar...</option>
            <option value="ACUICULTURA">Acuicultura</option>
            <option value="ADMINISTRACION_PUBLICA">
              Administracion publica
            </option>
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
            <option value="TURISMO">Turismo</option>
          </select>
          <p class="text-red-500 text-xs">El sector es obligatorio</p>
        </div>
        <div class="space-y-1.5">
          <label
            for="of-ubicacion"
            class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >Ubicación</label
          ><input
            id="of-ubicacion"
            placeholder="Ciudad, Región..."
            class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
            type="text"
            name="ubicacion"
          />
        </div>
        <div class="space-y-1.5">
          <label
            for="of-actividad"
            class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >Actividades Económicas
            <span class="text-gray-400 normal-case font-normal"
              >Opcional — SUNAT lo completa</span
            ></label
          ><input
            id="of-actividad"
            placeholder="Ej: Fabricación de productos orgánicos..."
            class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
            type="text"
            name="actividad_economica"
          />
        </div>
        <div class="space-y-1.5">
          <label
            for="of-linkedin"
            class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >LinkedIn</label
          ><input
            id="of-linkedin"
            placeholder="linkedin.com/company/ejemplo"
            class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
            type="text"
            name="linkedin"
          />
        </div>
        <div class="space-y-1.5">
          <label
            for="of-alianzas"
            class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >Alianzas Estratégicas</label
          ><input
            id="of-alianzas"
            placeholder="Ej: USAID, Rainforest Alliance"
            class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
            type="text"
            name="alianzas_estrategicas"
          />
        </div>
        <div
          class="flex items-center justify-between pt-2 border-t border-gray-100"
        >
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
              text-gray-500 hover:text-gray-700 hover:bg-gray-50
              border border-gray-200 transition-colors"
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
              class="lucide lucide-x"
              aria-hidden="true"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path></svg
            >Cancelar</button
          ><button
            type="button"
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700
              disabled:bg-emerald-400 disabled:cursor-not-allowed text-white
              font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
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
              class="lucide lucide-save"
              aria-hidden="true"
            >
              <path
                d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
              ></path>
              <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path>
              <path d="M7 3v4a1 1 0 0 0 1 1h7"></path></svg
            >Guardar organización
          </button>
        </div>
      </div>
    </div>
  </div>
</main>
```
