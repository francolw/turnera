const { createBot, createProvider, createFlow, addKeyword, EVENTS, addChild } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MySQLAdapter = require('@bot-whatsapp/database/mysql');
const axios = require('axios');
const { postToAPI } = require('./js/functions.js');
const { procesarPatentes } = require('./js/functions.js'); 

// Agregar el manejador global para promesas no gestionadas
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Configuración de MySQL
const MYSQL_DB_HOST = 'localhost';
const MYSQL_DB_USER = 'root';
const MYSQL_DB_PASSWORD = '';
const MYSQL_DB_NAME = 'demo';
const MYSQL_DB_PORT = '3308';
 
const flowMenu = addKeyword(EVENTS.WELCOME)
    .addAnswer(['🙌 Bienvenido a *Nombre_lavadero*',
                'QUE DESEA HACER? (Ingresar numero correspondiente)',
                '1. Reservar turno',
                '2. Consultar - cancelar un turno',
                '3. Hablar con un agente'
    ],
        { capture : true},
        async (ctx, {flowDynamic, gotoFlow, fallBack}) => {
        
            const eleccion = parseInt(ctx.body);

            switch (eleccion) {
                case 1:
                    await gotoFlow(flowPrincipal);
                    break;
                case 2:
                    await gotoFlow(flowConsultarTurno);
                    break;
                case 3:
                    await flowDynamic('Un representante se estará comunicando');
                    break;
                default:
                    await flowDynamic('No entendi tu respuesta. Por favor, intenta nuevamente.');
                    await fallBack();
            }
        }
    )

// Flujo principal
const flowPrincipal = addKeyword(EVENTS.ACTION)
    .addAnswer('Para continuar, ingresa el número de patente del vehículo:', 
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow, fallBack, state }) => {
            const numeroTelefono = ctx.from
            await state.update({ numeroTelefono })
            const patente = ctx.body.toUpperCase().replace(/\s+/g, '');
            console.log('Patente ingresada:', patente);

            if (procesarPatentes(patente)) {
                await state.update({patente});
                const data = await postToAPI('checkPatente',  {patente} );
                if (data.status == 'success') {
                    // Manejar respuesta
                    const retrievedCliente = data.data.nombre;
                    const idVehiculoConf = data.data.tipo_vehiculo;
                    const idClienteConf = data.data.id_cliente;
                    // await flowDynamic('La patente existe en la base de datos.');
                    await state.update({ idVehiculoConf });
                    await state.update({ idClienteConf });
                    await flowDynamic(`Bienvenido nuevamente, ${retrievedCliente}!`);
                    await gotoFlow(flowAltaTurno);
                    // console.log('Datos de servicios:', response);
                } else {
                    await flowDynamic('La patente no se encontró en la base de datos.');
                    await gotoFlow(flowAltaCliente);
                }
                console.log('Resultado de la consulta:', data); // <-- Aquí
            } else {
                console.log('Patente inválida');
                await flowDynamic('La patente no es válida. Intenta nuevamente.');
                return fallBack();
            }
        }
    );

const flowAltaCliente = addKeyword(EVENTS.ACTION)
.addAnswer('Vamos a dar de alta tu vehículo.')  // Mensaje introductorio
.addAnswer('Estamos obteniendo los tipos de vehículo disponibles...', null, async (ctx, { flowDynamic, gotoFlow }) => {
    try {
        const response = await postToAPI('getVehicleTypes');
        if (response.status === 'success') {
            const mapeoVehiculos = response.data.map((vehiculo) => `${vehiculo.id}. ${vehiculo.vehiculo}`).join('\n');
            await flowDynamic(`Los tipos de vehículo disponibles son:\n ${mapeoVehiculos}`);
            await gotoFlow(flowAltaVehiculo);
        }else {
            await flowDynamic('Error al obtener los tipos de vehículo. Por favor, intenta nuevamente más tarde.');
            return;
        }
    } catch (error) {
            console.error('Error al obtener los tipos de vehículo:', error);
            await flowDynamic('Hubo un problema al intentar obtener los tipos de vehículo. Por favor, inténtalo de nuevo más tarde.');
            return;
    }
})

const flowAltaVehiculo = addKeyword(EVENTS.ACTION)
    .addAnswer('Escribe el numero correspondiente al tipo de vehículo:',   // Captura del input después de mostrar la info
        { capture: true },
        async (ctx, { flowDynamic, state, fallBack }) => {

            const idVehiculo = parseInt(ctx.body);
            await state.update({ idVehiculo });  
            const response = await postToAPI('getVehicleTypes');
            const vehicleTypes = response.data;
            // const vehicleTypes = state.get('mapeoVehiculos');

            const vehiculoSeleccionado = vehicleTypes.find(v => v.id === idVehiculo);

            if (vehiculoSeleccionado) {
                await flowDynamic(`Has seleccionado el tipo de vehículo: ${vehiculoSeleccionado.vehiculo}`);
            } else {
                await flowDynamic('El número seleccionado no es válido. Por favor, intenta nuevamente.');
                return fallBack(); 
            }
        }
    )
    .addAnswer('Escribe tu nombre:',   // Captura del nombre
        { capture: true },
        async (ctx, { flowDynamic, state, fallBack }) => {
            const nombre = ctx.body;
            if (nombre !== '') {
                await state.update({ nombre });  // Guardamos el nombre en el state
                console.log('Nombre del cliente:', nombre);
            } else {
                await flowDynamic('El nombre no puede estar vacío. Por favor, intenta nuevamente.');
                return fallBack();  // Volver a pedir el nombre si es inválido
            }
        }
    )
    .addAnswer('Escribe tu dirección:',   // Captura de la dirección
        { capture: true },
        async (ctx, { flowDynamic, state, fallBack, gotoFlow }) => {
            const direccion = ctx.body;
            if (direccion !== '') {
                await state.update({ direccion });  // Guardamos la dirección en el state
                console.log('Dirección del cliente:', direccion);

                // Obtenemos todos los datos almacenados en el state
                const patente = state.get('patente');  
                const idVehiculo = state.get('idVehiculo');
                const nombre = state.get('nombre');
                const telefono = state.get('numeroTelefono');

                // const stateData = getMyState();
                // const { patente, tipoVehiculo, nombre, telefono, direccion } = stateData;

                const customerData = {
                    patente,
                    idVehiculo,
                    nombre,
                    telefono,
                    direccion
                }

                // console.log('141', patente);

                try {
                    // const response = await sendToProc('insertNewCustomerData', customerData);
                    const response = await postToAPI('insertNewCustomerData', customerData);
                    
                    if (response.status == 'success') {
                        console.log('Datos enviados al servidor: \n', response);
                        await flowDynamic('Tu información ha sido registrada exitosamente.');
                        await gotoFlow(flowAltaTurno);
                    } else {
                        console.log('Datos enviados al servidor: \n', response);
                        await flowDynamic('Hubo un problema al registrar tu información. Por favor, inténtalo de nuevo.');
                    }
                } catch (error) {
                    console.error('Error al enviar los datos:', error);
                    await flowDynamic('Hubo un problema al registrar tu información. Por favor, inténtalo de nuevo más tarde.');
                }
            } else {
                await flowDynamic('La dirección no puede estar vacía. Por favor, intenta nuevamente.');
                return fallBack();  // Volver a pedir la dirección si es inválida
            }
        }
    );

const flowAltaTurno = addKeyword(EVENTS.ACTION)
    .addAnswer('Listado de servicios', null, async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                // Llamada al endpoint para obtener los servicios.
                const response = await postToAPI('getServices');
                console.log('Datos de servicios:', response);
        
                // Verifica si la respuesta es exitosa y contiene los datos esperados
                if (response.status == 'success' && Array.isArray(response.data)) {
                    // Llenar el objeto serviciosDisponibles con los datos recibidos
                    serviciosDisponibles = {}; // Reiniciar el objeto para evitar duplicados
                    response.data.forEach(servicio => {
                        serviciosDisponibles[servicio.id] = servicio.costo; // Asignar costo al ID
                    });

                    const mapeoServicios = response.data.map((servicio) => `${servicio.id}. ${servicio.servicio}. - $ ${servicio.costo}`).join('\n');
                    await flowDynamic(`Los tipos de servicios disponibles son: \n${mapeoServicios}`);
                    await gotoFlow(subFlowAltaTurno);
                } else {
                    await flowDynamic('Error al obtener los servicios. Por favor, intenta nuevamente más tarde.');
                    return;
                }
            } catch (error) {
                console.error('Error al obtener los tipos de vehículo:', error);
                await flowDynamic('Hubo un problema al intentar obtener los servicios. Por favor, inténtalo de nuevo más tarde.');
                return;
            }
        }
    )

let serviciosDisponibles = {}; // Declarar el objeto

const subFlowAltaTurno = addKeyword(EVENTS.ACTION)
    .addAnswer('Ingresa el / los numero(s) correspondiente al servicio', 
        { capture : true },
        async (ctx, { flowDynamic, state, fallBack, gotoFlow }) => {
            const numeroServicio = ctx.body.trim();
            

            if (numeroServicio !== '') {
                // Usar una expresión regular para dividir los números por espacio
                const serviciosArray = numeroServicio.split(/\s+/).map(num => num.trim()).filter(num => num);
                // Convertir el array a una cadena separada por comas
                const serviciosFormat = serviciosArray.join(', ');
                // Guardar el resultado en el state

            
                await state.update ( { serviciosArray });

                await state.update({ serviciosFormat });

                await flowDynamic(`Has ingresado los servicios: ${serviciosFormat}`);
                await gotoFlow(flowGetFechaReserva);
                // await flowDynamic(`Costo total de servicios: $ ${costoServicio}`);

            } else {
                await fallBack('Por favor, ingresa al menos un número de servicio.');
            }
        }
    )

const flowGetFechaReserva = addKeyword(EVENTS.ACTION)
.addAnswer('Los siguientes turnos están disponibles para su reserva:', null, async (ctx, { flowDynamic, gotoFlow }) => {
    try {
        // Llamada al endpoint para obtener los turnos disponibles.
        const response = await postToAPI('getAvailableTurns');
        console.log('Datos de turnos:', response);

        // Verifica si la respuesta es exitosa y contiene los datos esperados
        if (response.status == 'success' && Array.isArray(response.data)) {
            // Mostrar los turnos disponibles
            const mapeoTurnos = response.data.map((turno) => `Turno n°: ${turno.id}. - Fecha: ${turno.fecha}`).join('\n');
            await flowDynamic(`Los turnos disponibles son: \n${mapeoTurnos}`);
            await gotoFlow(flowInsertarTurno);
        } else {
            await flowDynamic('Error al obtener los turnos. Por favor, intenta nuevamente más tarde.');
            return;
        }
    } catch (e) {
        console.error('Error al obtener los turnos:', e);
        await flowDynamic('Hubo un problema al intentar obtener los turnos. Por favor, inténtalo de nuevo más tarde.');
        return;
    }
});

const flowInsertarTurno = addKeyword(EVENTS.ACTION)
    .addAnswer('Ingresa el numero correspondiente al turno que mas te conviene!',
        {capture : true},
        async (ctx, { flowDynamic, state, fallBack, gotoFlow }) => {
            const numeroTurno = ctx.body.trim();

            if (numeroTurno!== '') {
                // Guardar el resultado en el state
                await state.update({ numeroTurno });

                const id_servicio = state.get('serviciosFormat');
                const idVehiculoConf = state.get('idVehiculoConf');
                // const idClienteConf = state.get('idClienteConf');
                const patente = state.get('patente');

                const dataTurno = {
                    patente,
                    numeroTurno,
                    id_servicio,
                    idVehiculoConf,
                }
                try {
                    console.log('dataturno', dataTurno);
                    const response = await postToAPI('updateTurnera', dataTurno);
                    if (response.status == 'success') {
                        // console.log('Reserva confirmada:', response.data.turno);
                        // await flowDynamic('Guardado');
                        await gotoFlow(flowConfirmacion);
                    } else {
                        console.log('Reserva no confirmada:', response);
                        await flowDynamic('no');
                    }

                } catch {
                    console.error('Error al confirmar la reserva: 291');
                    await flowDynamic('Hubo un problema al confirmar la reserva. Por favor, inténtalo de nuevo más tarde.');
                }
                // await flowDynamic(`Seleccionaste el turno: ${numeroTurno}`);
            } else {
                await fallBack('Por favor, ingresa al menos un número de turno.');
            }
        }
    )

const flowConfirmacion = addKeyword(EVENTS.ACTION)
    .addAnswer('Confirma tu reserva', 
        null, 
        async (ctx, { flowDynamic, state, gotoFlow }) => {

        const nroTurnoConf = state.get('numeroTurno');
        const serviciosArray = state.get('serviciosArray');

        let costoServicio = 0;
        for (const num of serviciosArray) {
            const id = parseInt(num, 10);
            if (serviciosDisponibles[id]) {
                costoServicio += parseFloat(serviciosDisponibles[id]);
            }
        }

        const data = { nroTurnoConf }

        try {
            const response = await postToAPI('confirmReservation', data);

            if (response.status == 'success' && response.data.length > 0) { 
                console.log('log de data', response.data); // 
                const resTurno = response.data.map((turno) => 
                    `- *Fecha:* ${turno.fecha} \n - *Nombre:* ${turno.nombre} \n - *Servicio:* ${turno.servicios} - *Costo:* ${costoServicio}`
                ).join('\n');
                await flowDynamic(`Reserva confirmada con éxito. Detalles:\n  ${resTurno}`);
                await gotoFlow(flowPago);
            } else {
                await flowDynamic('Hubo un problema al confirmar la reserva. Por favor, inténtalo de nuevo más tarde.');
                console.log('error', response);
            }

        } catch (error) {
            console.error('Error al confirmar la reserva:', error);
            await flowDynamic('Hubo un problema al confirmar la reserva. Por favor, inténtalo de nuevo más tarde.');
        }
    }
)

const flowPago = addKeyword(EVENTS.ACTION)
    .addAnswer('Confirma tu forma de pago:', 
        null, 
        async (ctx, { flowDynamic, state, gotoFlow }) => {
            try {
                // Llamada al endpoint para obtener los medios de pago.
                const response = await postToAPI('getPaymentMethods');
                console.log('Datos de medios de pago:', response);

                // Verifica si la respuesta es exitosa y contiene los datos esperados
                if (response.status =='success' && Array.isArray(response.data)) {
                    // Mostrar los medios de pago disponibles
                    const mapeoPagos = response.data.map((medioPago) => 
                        `N°: ${medioPago.id} - ${medioPago.canal}`).join('\n');
                    await flowDynamic(`Los medios de pago disponibles son: \n${mapeoPagos}`);
                    await gotoFlow(flowPagoConfirmacion);
                } else {
                    await flowDynamic('Error al obtener los medios de pago. Por favor, intenta nuevamente más tarde.');
                    return;
                } 
            } catch (error) {
                console.error('Error al obtener los medios de pago:', e);
                await flowDynamic('Hubo un problema al intentar obtener los medios de pago. Por favor, inténtalo de nuevo más tarde.');
                return;
            }
        }
    )
const flowPagoConfirmacion = addKeyword(EVENTS.ACTION)
    .addAnswer('Ingresa el numero correspondiente al medio de pago que mas te conviene!',
        { capture : true },
        async (ctx, { flowDynamic, state, fallBack }) => {
            try {
                const medioPago = ctx.body.trim();

                if (medioPago !== '') {

                    if (medioPago == 3) {
                        await flowDynamic('Te esperamos en el local para hacer el pago!.');
                    } else {
                        // Guardar el resultado en el state
                        await state.update({ medioPago });
                        const nroTurnoConf = state.get('numeroTurno'); // Asegúrate de que esto esté guardado correctamente

                        const data = { nroTurnoConf, medioPago }; // Usa 'nroTurnoConf' aquí
                        const response = await postToAPI('updatePaymentMethod', data); 

                        if (response.status == 'success') {
                            await flowDynamic('Reserva confirmada con éxito.');
                        } else {
                            console.error('Error al confirmar el medio de pago:', response);
                            await flowDynamic('Hubo un problema al confirmar el medio de pago. Por favor, inténtalo de nuevo más tarde.');
                        }
                    }
                    

                } else {
                    await fallBack('Por favor, ingresa al menos un número de medio de pago.');
                }
            } catch (error) {
                console.error('Error al confirmar el medio de pago:', error);
                await flowDynamic('Hubo un problema al confirmar el medio de pago. Por favor, inténtalo de nuevo más tarde.');
            }
        });

const flowConsultarTurno = addKeyword(EVENTS.ACTION)
    .addAnswer('Ingresa tu patente para poder consultar tus turnos',
        { capture : true},
        async (ctx, { flowDynamic, state, gotoFlow, fallBack }) => {
            try {
                const patenteConsulta = ctx.body.toUpperCase().replace(/\s+/g, '');
                console.log('Patente ingresada:', patenteConsulta);
    
                if (procesarPatentes(patenteConsulta)) {
                    await state.update({ patenteConsulta });
                    const data = { patenteConsulta };


                    const response = await postToAPI('consultarTurno', data);
                    if (response.status =='success' && Array.isArray(response.data)) {
                        const turnosMapped = response.data.map((turnos) => 
                            `- *N°:* ${turnos.id}- *Fecha:* ${turnos.fecha} \n - *Nombre:* ${turnos.nombre} \n - *Servicio:* ${turnos.servicios} \n\n`).join('\n');
                        await flowDynamic(`Tus turnos para la patente *${patenteConsulta}* son: \n${turnosMapped}`);
                    } else {
                        console.log (response.data);
                        await flowDynamic('No se encontraron turnos para la patente ingresada.');
                    }
                } else {
                    // Si la patente no es válida
                    await flowDynamic('La patente ingresada no es válida. Por favor, verifica e inténtalo nuevamente.');
                    await fallBack()
                }
            } catch (error) {
                console.error('Error al consultar tus turnos:', error);
                await flowDynamic('Hubo un problema al intentar consultar tus turnos. Por favor, inténtalo de nuevo más tarde.');
            }
        }
    )
    .addAnswer(['Como desea seguir?',
                `Elija una opcion \n 1. Para eliminar un turno \n 2. Para salir.`],
                {capture : true},
                async (ctx, { flowDynamic, state, gotoFlow, endFlow }) => {
                    const respuesta = parseInt(ctx.body);
                    if (respuesta == 1) {
                        gotoFlow (flowCancelarTurno);
                    } else if (respuesta == 2) {
                        await flowDynamic('Gracias por su visita!');
                        await endFlow();
                    }
                }
    )


const flowCancelarTurno = addKeyword(EVENTS.ACTION)
    .addAnswer('A continuacion, ingresa el numero correspondiente a tu turno:',
        { capture : true },
        async (ctx, { flowDynamic, state, gotoFlow, fallBack }) => {
            try {
                const id_turno_cancela = parseInt(ctx.body);
                console.log (id_turno_cancela);

                if (id_turno_cancela) {
                    const data = { id_turno_cancela };
                    const response = await postToAPI('cancelarTurno', data);

                    if (response.status == 'success') {
                        await flowDynamic('Turno cancelado con éxito.');
                    } else {
                        await flowDynamic('Hubo un problema al intentar cancelar el turno. Por favor, inténtalo de nuevo más tarde.');
                    }
                } else {
                    // Si la patente no es válida
                    await flowDynamic('La patente no es válida');
                }
            } catch (error) {
                console.error('Error al cancelar el turno:', error);
                await flowDynamic('Hubo un problema al intentar cancelar el turno. Por favor, inténtalo de nuevo más tarde.');
            }
        }
    )

// Función principal
const main = async () => {
    try {
        const adapterDB = new MySQLAdapter({
            host: MYSQL_DB_HOST,
            user: MYSQL_DB_USER,
            database: MYSQL_DB_NAME,
            password: MYSQL_DB_PASSWORD,
            port: MYSQL_DB_PORT,
        });

        const adapterFlow = createFlow([flowMenu,
                                        flowPrincipal, 
                                        flowAltaCliente, 
                                        flowAltaVehiculo,
                                        flowAltaTurno,
                                        subFlowAltaTurno,
                                        flowGetFechaReserva,
                                        flowInsertarTurno,
                                        flowConfirmacion,
                                        flowPago,
                                        flowPagoConfirmacion,
                                        flowConsultarTurno,
                                        flowCancelarTurno
                                        ]);
                                        // Incluye todos los flujos
        const adapterProvider = createProvider(BaileysProvider);

        createBot({
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        });

        QRPortalWeb();
    } catch (error) {
        console.error('Error al iniciar el bot:', error);
    }
}

main();
