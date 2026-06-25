Pasaremos ahora a eleaborar los tests en ka seccion e2e/cotiz\_&_leads

Procederás con un efoque de loop iterativo, es decir organizaras el trabajo por pasos y te enfocarás en iterarar hasta conseguir los resultados esperados. Si algo no funciona verificarás las causas del error y luego volverás a intentarlo una cantidad razonable de veces. SIn embargo si no hay solucion debes informarlo en el informe resumido resumen_tests_e2e.md que dejarás en /outputs

Procederemos de la sigueitne manera.
Estudia y analiza la manera y estrategia empleada para elaborar tests e2e de alta calidad y resiliencia. Aplicando siempre las buenas practicas y no dejando algo improvidadamente al azar, sino controlando realmente el flujo.
Una vez entendido, elaborarás un informe integral que incluya (y no se limite solamente a) los patrones y estrategia de testing, informacion clave, y lo plasmaras en /outputs/Skill_testing_strategy.md en formato skill para que cualuqeir agente IA o persona pueda comandar y proceder a seguri elaborando mas testes para otras secciones de la pagina.

Terminado ello procede a
Elaborar un plan detallado para la elaboración de los sigueintes tests que se colocarán en e2e/cotiz_leads.
Luego procederás a ejecutar el plan (que tiene que esta detallado)
No lo probarás porque yo debo resolver captcha para poder luego pasar los tests.
(aunque actualmente el capta solo esta para marcarlo checkbox y espear unos 4 segundos y luego se activa el boton de ingresar.) Si vas a actualizar el auth.setup.ts comenta lo que teniamos antes y añade los cambios necesarios.

1. El usuario accede a la opción Cotizaciones desde el menú principal del CRM BioActiva.
2. El sistema muestra el listado de cotizaciones registradas siguiendo el diseño del prototipo.
3. El usuario puede seleccionar una de las siguientes acciones:
   a. Visualizar detalles de una cotización.
   i. Editar cotización existente.
4. Si el usuario desea crear una cotización, dispone de dos maneras
5. La primera manera es que el usuario puede cambiar el estado de un lead En prospecto a Ofertado, ello generará una cotización automáticamente con el estado Pendiente, rellenando automáticamente los campos de cliente (nombre de la organización), dirigido (nombre del cliente, si existe, o nulo en caso contrario), remitente (nombre del encargado del lead que se está cotizando), monto (igual a 0 ), moneda (soles) y nombre del servicio (Servicio de interés de lead).
6. (Omitiremos este punto porque no está implementado en la web desarrollada)La segunda manera es que el usuario, puede crear la cotización para un lead en específico, para ello puede seleccionar el atajo directo de Crear cotización, o desde detalle del lead en la sección Cotización puede presionar el botón Nueva cotización. Cualquiera de las formas abrirá un formulario con el formato definido en el prototipo, que rellena automáticamente los campos lead, fecha de cotización, cliente, dirigido, remitente, nombre del servicio y dispone como únicos campos editables para que el usuario complete: producto, monto, moneda, observación y link de propuesta.
7. Antes de crear la cotización el sistema valida que el lead no tenga una cotización creada. (solo lo testeamos si es que realmente podemos testearlo en e2e. Segun yo pareceira que no y que esto corresponde a un test de backend)
8. Si la cotización se crea, el estado de lead cambia de En prospecto a Ofertado (no testearemos este punto).
9. El sistema valida el formato de monto.
10. El sistema valida que los campos obligatorios no estén vacíos. (aplica resiliencia para escenarios variados)
11. El usuario confirma el registro seleccionando “Guardar cotización”.
12. La cotización queda disponible para consulta y seguimiento con estado Pendiente.
13. Si el usuario selecciona el ícono Ver detalle de la columna acciones definida para una cotización, el sistema mostrará la información registrada.
14. El sistema muestra la información registrada como cliente, contacto, remitente, nombre del servicio,( Información económica) monto, moneda, estado, observación, link de propuesta y fecha de cotización.
15. Desde el detalle de la cotización, el usuario puede retornar al listado o seleccionar la opción “Editar cotización”. (esto no se podrá hacer cuando la cotización fue “rechazada” o “aceptada”.
16. Si el usuario selecciona “Editar cotización”, el sistema muestra el formulario con la información actual de la cotización. (ver editar.md)
17. El usuario modifica uno o más campos permitidos, como producto, nombre del servicio, monto, moneda, estado, observación o link de propuesta. (Aquí mapear el test a los elementos que hayan. En informar cuales elementos se mapearon) Se aume que no se mapearan campos no existentes
18. El sistema valida el formato de monto (soles)
19. El usuario puede confirmar la actualización seleccionando “Guardar cambios” o “Cancelar” en caso contrario.
20. El usuario puede actualizar el estado de la cotización desde detalle, donde podrá seleccionar Marca como enviada si el estado de la cotización es Pendiente.
21. El usuario podrá seleccionar Rechazada o Aceptada si el estado de la cotización es Enviada.
22. Si el nuevo estado es Aceptada o Rechazada, el sistema verifica que el lead asociado no tenga actividades pendientes. (solo en caso sea testeable mediante e2e)
23. Si se crea una cotización a un lead con estado En prospecto, cambia automáticamente a Ofertado. (no se va a testear esto por ahora)
24. Si la cotización fue actualizada a Aceptada, el sistema actualiza el estado del lead a Cierre con venta.
25. Si la cotización fue actualizada a Rechazada, el sistema actualiza el estado del lead a Cierre sin venta.
26. Si la cotización fue actualizada a otro estado, como Enviada o Pendiente, el sistema guarda los cambios sin cerrar el lead.
27. La cotización queda actualizada y disponible para consulta y seguimiento.
