url:https://bioactiva.ingsoftware.lat/cotizaciones/13

Seccion: edicion de cotizacion

```html
<main class="flex-1 p-4 sm:p-6 print:p-6">
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <button
        class="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
      >
        ← Cancelar edición
      </button>
    </div>
    <div class="max-w-2xl mx-auto">
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <input type="hidden" name="id_lead" value="6" />
        <div
          class="px-8 py-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3"
        >
          <div
            class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-file-text text-emerald-700"
              aria-hidden="true"
            >
              <path
                d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
              ></path>
              <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
              <path d="M10 9H8"></path>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-bold text-gray-800">Editar cotización</h2>
            <p class="text-xs text-gray-400">
              Actualiza los datos de la propuesta
            </p>
          </div>
        </div>
        <div class="p-8 space-y-6">
          <div class="space-y-4">
            <p
              class="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-user text-gray-400"
                aria-hidden="true"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle></svg
              >Destinatario
            </p>
            <div class="space-y-1.5">
              <label
                for="cot-fecha"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >Fecha cotización <span class="text-red-500">*</span></label
              ><input
                id="cot-fecha"
                readonly=""
                class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white bg-gray-50 text-gray-500 cursor-default focus:border-gray-200"
                type="date"
                name="fecha_cot"
              />
            </div>
            <div class="space-y-1.5">
              <label
                for="cot-cliente"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >Cliente</label
              ><input
                id="cot-cliente"
                placeholder="Razón social o empresa"
                readonly=""
                class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white bg-gray-50 text-gray-500 cursor-default focus:border-gray-200"
                type="text"
                name="cliente"
              />
            </div>
          </div>
          <div class="space-y-4">
            <p
              class="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-file-text text-gray-400"
                aria-hidden="true"
              >
                <path
                  d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
                ></path>
                <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                <path d="M10 9H8"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path></svg
              >Propuesta comercial
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label
                  for="cot-producto"
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >Producto</label
                ><input
                  id="cot-producto"
                  placeholder="Ej: Consultoría, Formulación"
                  class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
                  type="text"
                  name="producto"
                />
              </div>
              <div class="space-y-1.5">
                <label
                  for="cot-remitente"
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >Remitente <span class="text-red-500">*</span></label
                ><input type="hidden" name="id_remitente" value="6" /><input
                  id="cot-remitente"
                  readonly=""
                  class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white bg-gray-50 text-gray-500 cursor-default focus:border-gray-200"
                  type="text"
                  value="Joseph Anderson Cose Rojas"
                />
                <p class="text-xs text-gray-400">
                  El remitente queda fijado al crear la cotización.
                </p>
              </div>
            </div>
            <div class="space-y-1.5">
              <label
                for="cot-servicio"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >Nombre del servicio <span class="text-red-500">*</span></label
              ><input
                id="cot-servicio"
                placeholder="Descripción del servicio ofertado"
                class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
                type="text"
                name="nombre_servicio"
              />
            </div>
          </div>
          <div class="space-y-4">
            <p
              class="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-dollar-sign text-gray-400"
                aria-hidden="true"
              >
                <line x1="12" x2="12" y1="2" y2="22"></line>
                <path
                  d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                ></path></svg
              >Valor económico
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label
                  for="cot-monto"
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >Monto <span class="text-red-500">*</span></label
                ><input
                  id="cot-monto"
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
                  type="number"
                  name="monto"
                />
              </div>
              <div class="space-y-1.5">
                <label
                  for="cot-moneda"
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >Moneda <span class="text-red-500">*</span></label
                ><select
                  id="cot-moneda"
                  name="tipo"
                  class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white cursor-pointer"
                >
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <p
              class="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-sticky-note text-gray-400"
                aria-hidden="true"
              >
                <path
                  d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"
                ></path>
                <path d="M15 3v5a1 1 0 0 0 1 1h5"></path></svg
              >Detalles adicionales
            </p>
            <div class="space-y-1.5">
              <label
                for="cot-observacion"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >Observación</label
              ><textarea
                id="cot-observacion"
                rows="3"
                placeholder="Notas adicionales sobre la propuesta"
                name="observacion"
                class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white resize-none"
              ></textarea>
            </div>
            <div class="space-y-1.5">
              <label
                for="cot-link"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >Link de propuesta</label
              ><input
                id="cot-link"
                placeholder="https://drive.google.com/..."
                class="w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    border-gray-200 focus:border-emerald-400 bg-white"
                type="url"
                name="link_propuesta"
              />
            </div>
          </div>
          <div
            class="flex items-center justify-between pt-2 border-t border-gray-100"
          >
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
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
                class="lucide lucide-arrow-left"
                aria-hidden="true"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path></svg
              >Volver</button
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
                <path d="M7 3v4a1 1 0 0 0 1 1h7"></path>
              </svg>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
```
