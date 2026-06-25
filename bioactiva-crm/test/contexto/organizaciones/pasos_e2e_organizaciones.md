El dia de hoy estamos realizando tests e2e en la pagian web de bioactiva
https://bioactiva.ingsoftware.lat/

Estamos probando el fluj ode usuarios de organizaciones. . Tenemos claro lo pasos que tenemos que hacer. Respecto al html , de cada pagina , yo lo esto y adjuntando dentro de la carpta test/contexto/. Ellos tienen la url de esa html y el html relevante de la pagina. Entonces para cada test que hagamos , podemos usar el html de referencia para hacer comparaciones y validaciones.

Estaremos usando playwright. Sin embargo Tu no vas a ejecutar los test. Yo los hare a futuro.
Quiero que planifiques el como será la elaboracion.Siempre sigueindo las buenas practicas y best practices. Una vez elaborado el plan, me lo presentas y luego yo lo reviso y apruebo. Una vez aprobado, tu me generas el codigo de los test en playwright. y leugo yo verificare si estan adecuadaos.
E ncaso requieras de mas contexto o informacion adicional, no dudes en pedirmela.
Al finalizar elabora un informe de que se hizo, que setructura de archivos se creo, y como se organizaron los test, y la logica de cada uno de los test (proposito de cada test que hiciste).
Antes de iniciar debes analiza el como esta estrucurado el frontend principalemten el conteido de la carpeta src. Una vez hecho ello elabora un informe de como fue elaborado, que estrategias o patrones ha considerado. e informacion clave que sea relevante a considerar en lso tests. Elabora tambien un skill md para que otra IA tenga el contexto claro y pueda seguri trabajando en los test en cualquier momento.

Todos los informes o ducmentos que generaras lo haras en formato markdown en test/outputs/ y segmentaras por tipo de informe. Por ejemplo, el informe de estructura del frontend se guardará en test/outputs/estructura_frontend.md , el plan de elaboración de los test se guardará en test/outputs/plan_elaboracion.md y el informe final de los test se guardará en test/outputs/informe_final.md . El skill md se guardará en test/outputs/skill.md .

Asumirás que el usuario ya esta logueado y que ya se encuentra en la pagina https://bioactiva.ingsoftware.lat/ .

los pasos de flujo a testear por ahora son los sigueintes:

1. El usuario accede a la opción Organizaciones desde el menú principal del CRM BioActiva.
2. El sistema muestra el listado de organizaciones registradas.
3. El usuario puede filtrar organizaciones con respecto al nombre de organización, sector, tamaño y tipo.
4. El usuario puede seleccionar una de las siguientes acciones:  
   a. Registrar nueva organización.  
   b. Visualizar una organización existente.
5. Si el usuario selecciona la opción "Nueva organización", el sistema muestra la pantalla de registro de organización.
6. El usuario puede realizar una consulta mediante SUNAT utilizando el RUC o la razón social de la organización.
7. El sistema procesa la consulta y muestra la información disponible obtenida desde SUNAT.
8. El sistema valida que la organización no se encuentre registrada previamente mediante RUC, razón social o código interno.
9. En caso de que la organización no cuente con RUC o no se encuentre registrada en SUNAT, el usuario puede registrar un código interno para identificarla dentro del CRM.

Respecto al paso 6 y 7. Analiza la viabilidade realizar lo siguietn:
""
Uso de Mocks de Red (La opción más madura): En lugar de pegarle a la SUNAT real (que se cae a menudo), usas page.route() de Playwright para interceptar la petición de red. Tú le dices a Playwright: "Cuando la web pregunte por el RUC XXXXX, simula que la SUNAT respondió de inmediato con éxito y devuelve este JSON de mentira". Esto independiza tu test de la velocidad de la SUNAT.
""

Respecto al paso 8 debemos partir el camino feliz y el alternativo:
""
Criterio de Ingeniería (Best Practice): Para probar que el sistema bloquea los duplicados, necesitas un Escenario Negativo. En testing automatizado, los escenarios positivos (caminos felices) y negativos se separan en bloques test() diferentes para no mezclar lógicas.

Crea un test específico llamado "Debería mostrar un mensaje de error si el RUC ya está registrado".

Cómo se formula: Aquí haces exactamente lo contrario al camino feliz. Utilizas un RUC que tengas la absoluta certeza de que ya existe en la base de datos de QA (por ejemplo, el RUC de TECSUP (20117592899) o SAN LUIS (20611777559) que vimos en el listado de tu tabla).

Flujo del test: Ingresas ese RUC existente, ejecutas la búsqueda, e inmediatamente haces una aserción esperando ver la alerta de error o el bloqueo del sistema (ej. await expect(page.getByText('Esta organización ya se encuentra registrada')).toBeVisible()).

""
}
Respecto al paso 9:
""
Paso 9: Flujo Alternativo sin RUC (Código Interno)Tu análisis de la UI: Mencionas que el formulario tiene las secciones: Código de Cliente, Por RUC, Por Razón Social, RUC (0/11), Nombre/Razón Social.Criterio de Ingeniería (Best Practice): Aquí lo que queremos probar es una regla de exclusión mutua. Si el usuario no tiene un RUC válido de la SUNAT, el sistema debe permitirle identificar la cuenta mediante un "Código de Cliente" manual. 🛠️ La Estrategia que debes elegir:Debes crear un tercer test llamado "Debería permitir el registro manual mediante Código de Cliente cuando no se cuenta con RUC".Cómo se formula:Ignoras completamente las opciones de "Por RUC" o "Por Razón Social".Vas directo al campo de texto Código de Cliente _. Lo rellenas con un código alfanumérico generado al azar en tu test (por ejemplo, usando Math.random() para asegurar que nunca se repita, ej: CLI-98342).Rellenas manualmente el campo Nombre / Razón Social _ (ya que la SUNAT no lo va a autocompletar). Verificas que el botón de "Registrar" o "Guardar" se habilite.
""


10. El usuario completa o corrige la información de la organización utilizando los campos definidos en la pantalla de registro mostrada en el prototipo del sistema. (¿ aqui tal vez bastaría co n llenar los campos lfatnates lugo de que la info se haya llenado con la data de la sunat que ha retornado la consulta)
    
11. El sistema valida la información ingresada de acuerdo con las reglas de negocio establecidas. (¿ es posible testear esto? ¿ que necesitariamos saber?)
	1. estrategia: - - _Estrategia:_ Intenta guardar el formulario dejando un campo obligatorio vacío y haz un `expect` de que aparezca el mensaje de error (ej: _"El nombre comercial es obligatorio"_ o El código de cliente es obligatorio). (ver nueva_org.md)
    
12. El usuario selecciona la opción "Guardar organización". (apretar un boton)
    
13. El sistema registra la organización y le asigna un identificador único. (no se como validariamos esto)
	1. - - _Estrategia:_ La mejor manera de validarlo en E2E es inspeccionar la URL después de guardar. Deberiamos volver a ingresar a la info de la organizacion desde # Gestión de Organizaciones y verificar que la URL pasa de `/organizations/new` a `/organizations/7f93c302-9d...`, **esa cadena de texto en la URL es el identificador único**. Captúralo usando `page.url()`.
    
14. La organización queda disponible para su utilización en los módulos de Contactos, Leads y Cotizaciones. (verificar que ahora la organizacion registrada ¿ esta presente en la tabla de listado de organizaciones?)
	1. - - _Estrategia:_ La buena práctica dicta que **no debes mezclar flujos de otros módulos en el test de creación**. Lo ideal es que, en el archivo de pruebas del módulo de _Contactos_, tengas un test que abra el formulario de "Nuevo Contacto", despliegue el combo de "Organización" y verifique que la organización que creaste aparezca listada ahí.
    
15. Si el usuario selecciona una organización existente desde el listado, el sistema muestra la pantalla de detalle de la organización. (esto he verificado que si es posible)
	1. - Debes asegurar que al entrar al detalle, los textos que guardaste (Nombre, RUC) sean visibles en las tarjetas de información (`.toBeVisible()`).
    
16. El sistema muestra la información general registrada de la organización según la información disponible en la pantalla de detalle mostrada en el prototipo. (aqui creo que no hacemos nada info_de_org.md)
	1. - Debes asegurar que al entrar al detalle, los textos que guardaste (Nombre, RUC) sean visibles en las tarjetas de información (`.toBeVisible()`).
    
17. El sistema muestra los contactos asociados a la organización. (solo veriiar la lista de contactos info_de_org.md)
	    - - - _Estrategia:_ Lo correcto aquí es validar el "Estado Vacío" (_Empty State_). Haz un assert de que existan las pestañas o secciones de "Leads", "Contactos" y "Cotizaciones" y que muestren un texto como _"No hay leads asociados"_ o que la tabla marque 0 registros.
18. El sistema muestra el historial de leads asociados a la organización.
    (ver info_de_org.md)
19. El sistema muestra el historial de cotizaciones asociadas a la organización.
    
20. El usuario puede regresar al listado de organizaciones mediante la opción "Volver a Organizaciones". (ver info_de_org.md , solo hacer un assert)

21. Desde el detalle de la organización, el usuario puede seleccionar la opción "Editar organización". (ver info_de_org.md)
    
22. El sistema muestra la pantalla de edición con la información actual de la organización. 
    
23. El usuario modifica la información utilizando los campos disponibles en la pantalla de edición mostrada en el prototipo. (edit_org.md)
    
24. El sistema valida la información actualizada de acuerdo con las reglas de negocio establecidas. (aqui creo que no hacemos nada ver edit_org.md)
    
25. El usuario puede confirmar la actualización seleccionando "Guardar cambios" o cancelar la operación seleccionando "Cancelar". (ver edit_org.md)
    
26. Si el usuario confirma la edición, el sistema guarda los cambios realizados. (¿como verificamos los cambios? (luego de guardar edicion (cambiar solo el campo "SECTOR", ir hacia https://bioactiva.ingsoftware.lat/organizaciones/7f93c302-9d93-4889-9eb5-8036bd779b27 y verificar que el nuevo sector elegido esté actualizado. Ver sectores disponibles en edit_org.md )
	1. Tras hacer clic en "Guardar cambios", la página te redirigirá al detalle. Ahí debes hacer un `expect(page.getByText('MANUFACTURA')).toBeVisible()` para confirmar que la interfaz se actualizó con el nuevo dato persistido.
    
27. El sistema muestra la información actualizada de la organización.
    
28. Desde el detalle de la organización, el usuario puede seleccionar la opción "Desactivar organización". (asert noma, creo que no deberiamos deactivar inenecsriametne por un testun organizacion real.)
    
29. El sistema solicita confirmación de la operación.
    
30. El usuario confirma la desactivación. (aparece una ventana modal ver modal_desactiva.md)
    
31. El sistema actualiza el estado de la organización a inactivo. (¿ como podemos teaer esto?)
    
32. La organización permanece registrada en el sistema para fines de trazabilidad e historial. ( esto no lo testearemos para nada)

#### ¿Cómo testear los Pasos 28, 29, 30 y 31 (Desactivación)?
- Recomiendo crear una organizacion ficctia, desde l paso 10 aprox, y luego a medida avance el etst, trabajar sobre estar org. Luego al llegar a los pasos 29 y 30, terminar eliminando esta organizacion ficticia. Puedes trabajar con un RUC como el de la UPC 20211614545, y un ruc invalido como 12345678901

1. En el detalle de la organización que **acabas de crear en este mismo test**, haz clic en "Desactivar organización" (Paso 28).
    
2. El modal de confirmación aparecerá (Paso 29 y 30). Interactúa con el modal y haz clic en "Confirmar" o "Sí, desactivar".

