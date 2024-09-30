const { createBot, createProvider, createFlow, addKeyword, EVENTS, addChild } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MySQLAdapter = require('@bot-whatsapp/database/mysql');
const axios = require('axios');
const { postToAPI } = require('./js/functions.js');
const { procesarPatentes } = require('./js/functions.js'); 

//toma el json de textos
const text = require('./utils/texts/es.json');
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
    .addAnswer([ text.menu.welcome,
                 text.menu.promptAction,
                 text.menu.options["1"],
                 text.menu.options["2"],
                 text.menu.options["3"],
    ],
        { capture : true},
        async (ctx, {flowDynamic, gotoFlow, fallBack}) => {
        
            const eleccion = parseInt(ctx.body);
            
            if (Number.isInteger(eleccion)){
                switch (eleccion) {
		        case 1:
		            await gotoFlow(flowPrincipal);
		            break;
		        case 2:
		            await gotoFlow(flowConsultarTurno);
		            break;
		        case 3:
		            await flowDynamic(text.menu.agent);
		            break;
		        default:
		            await flowDynamic(text.menu.invalidInput);
		            await fallBack();
		    }
            } else {
            	await flowDynamic(text.globals.invalidResponse)
            }
        }
    )

// Comienzo flujos bot
const flowPrincipal = addKeyword(EVENTS.ACTION)
    .addAnswer(text.globals.insertLicense, 
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
                    const retrievedCliente = data.data.nombre;
                    const idVehiculoConf = data.data.tipo_vehiculo;
                    const idClienteConf = data.data.id_cliente;
                    await state.update({ idVehiculoConf });
                    await state.update({ idClienteConf });
                    await flowDynamic(`${text.globals.welcomeBack} ${retrievedCliente}`);
                    await gotoFlow(flowAltaTurno);
                } else {
                    await gotoFlow(flowAltaCliente);
                }
            } else {
                await flowDynamic(text.globals.invalidLicense);
                return fallBack();
            }
        }
    );

const flowAltaCliente = addKeyword(EVENTS.ACTION)
.addAnswer(text.registration.registerClients.insertVehicle) 
.addAnswer(text.registration.registerClients.gettingVehicles, null, async (ctx, { flowDynamic, gotoFlow }) => {
    try {
        const response = await postToAPI('getVehicleTypes');
        if (response.status === 'success') {
            const mapeoVehiculos = response.data.map((vehiculo) => `${vehiculo.id}. ${vehiculo.vehiculo}`).join('\n');
            await flowDynamic(`${text.registration.registerClients.availableVehicles} ${mapeoVehiculos}`);
            await gotoFlow(flowAltaVehiculo);
        }else {
            await flowDynamic(text.registration.registerClients.invalidVehicles);
            return;
        }
    } catch (error) {
            await flowDynamic(text.globals.problem);
            return;
    }
})

const flowAltaVehiculo = addKeyword(EVENTS.ACTION)
    .addAnswer(text.registration.registerCar.insertType,   
        { capture: true },
        async (ctx, { flowDynamic, state, fallBack }) => {

            const idVehiculo = parseInt(ctx.body);
            await state.update({ idVehiculo });  
            const response = await postToAPI('getVehicleTypes');
            const vehicleTypes = response.data;

            const vehiculoSeleccionado = vehicleTypes.find(v => v.id === idVehiculo);

            if (vehiculoSeleccionado) {
                await flowDynamic(`${text.registration.registerCar.chosenType} ${vehiculoSeleccionado.vehiculo}`);
            } else {
                await flowDynamic(text.globals.wrongInput);
                return fallBack(); 
            }
        }
    )
    .addAnswer(text.registration.registerCar.insertName,
        { capture: true },
        async (ctx, { flowDynamic, state, fallBack, gotoFlow }) => {
            const nombre = ctx.body;
            if (nombre !== '') {
                await state.update({ nombre })
                
                const patente = state.get('patente');  
                const idVehiculo = state.get('idVehiculo');
                // const nombre = state.get('nombre');
                const telefono = state.get('numeroTelefono');

                const customerData = {
                    patente,
                    idVehiculo,
                    nombre,
                    telefono
                }
                
                try {
                    const response = await postToAPI('insertNewCustomerData', customerData);
                    
                    if (response.status == 'success') {
                        await flowDynamic(text.registration.status.success);
                        await gotoFlow(flowAltaTurno);
                    } else {
                        await flowDynamic(text.registration.status.error);
                    }
                } catch (error) {
                    await flowDynamic(text.globals.problem);
                }
            } else {
                await flowDynamic(text.registration.registerCar.invalidName);
                return fallBack(); 
            }
        }
    )

const flowAltaTurno = addKeyword(EVENTS.ACTION)
    .addAnswer(text.appointment.services.servicesAvailable, null, async (ctx, { flowDynamic, gotoFlow }) => {
            try {
                const response = await postToAPI('getServices');
        
                if (response.status == 'success' && Array.isArray(response.data)) {
                    serviciosDisponibles = {}; 
                    response.data.forEach(servicio => {
                        serviciosDisponibles[servicio.id] = servicio.costo;
                    });

                    const mapeoServicios = response.data.map((servicio) => `${servicio.id}. ${servicio.servicio}. - $ ${servicio.costo}`).join('\n');
                    await flowDynamic(`${text.appointment.services.success} \n${mapeoServicios}`);
                    await gotoFlow(subFlowAltaTurno);
                } else {
                    await flowDynamic(text.appointment.services.error);
                    return;
                }
            } catch (error) {
                await flowDynamic(text.globals.problem);
                return;
            }
        }
    )

let serviciosDisponibles = {}; 

const subFlowAltaTurno = addKeyword(EVENTS.ACTION)
    .addAnswer(text.appointment.services.insertService, 
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
                await gotoFlow(flowGetFechaReserva);
            } else {
                await fallBack(text.globals.wrongInput);
            }
        }
    )

const flowGetFechaReserva = addKeyword(EVENTS.ACTION)
.addAnswer(text.appointment.dates.datesAvailable, null, async (ctx, { flowDynamic, gotoFlow }) => {
    try {
        const response = await postToAPI('getAvailableTurns');

        if (response.status == 'success' && Array.isArray(response.data)) {
            const mapeoTurnos = response.data.map((turno) => `Turno n°: ${turno.id}. - Fecha: ${turno.fecha}`).join('\n');
            await flowDynamic(`\n${mapeoTurnos}`);
            await gotoFlow(flowInsertarTurno);
        } else {
            await flowDynamic(text.appointment.dates.error);
            return;
        }
    } catch (e) {
        await flowDynamic(text.globals.problem);
        return;
    }
});

const flowInsertarTurno = addKeyword(EVENTS.ACTION)
    .addAnswer(text.appointment.insertAppointment.insert,
        {capture : true},
        async (ctx, { flowDynamic, state, fallBack, gotoFlow }) => {
            const numeroTurno = ctx.body.trim();

            if (numeroTurno!== '') {
                await state.update({ numeroTurno });

                const id_servicio = state.get('serviciosFormat');
                const idVehiculoConf = state.get('idVehiculoConf');
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
                        await gotoFlow(flowConfirmacion);
                    } else {
                        await flowDynamic(text.appointment.insertAppointment.error);
                    }

                } catch {
                    await flowDynamic(text.globals.problem);
                }
            } else {
                await fallBack(text.appointment.insertAppointment.invalidChar);
            }
        }
    )

const flowConfirmacion = addKeyword(EVENTS.ACTION)
    .addAnswer(text.reservation.date.dateConfirmation, 
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
                const resTurno = response.data.map((turno) => 
                    `- *Fecha:* ${turno.fecha} \n - *Nombre:* ${turno.nombre} \n - *Servicio:* ${turno.servicios} - *Costo:* ${costoServicio}`
                ).join('\n');
                await flowDynamic(`Detalles:\n  ${resTurno}`);
                await gotoFlow(flowPago);
            } else {
                await flowDynamic(text.reservation.date.error);
            }

        } catch (error) {
            await flowDynamic(text.globals.problem);
        }
    }
)

const flowPago = addKeyword(EVENTS.ACTION)
    .addAnswer(text.payment.confirmation, 
        null, 
        async (ctx, { flowDynamic, state, gotoFlow }) => {
            try {
                const response = await postToAPI('getPaymentMethods');
                
                if (response.status =='success' && Array.isArray(response.data)) {
                    const mapeoPagos = response.data.map((medioPago) => 
                        `N°: ${medioPago.id} - ${medioPago.canal}`).join('\n');
                    await flowDynamic(`${text.payment.availablePaymentMethods}\n${mapeoPagos}`);
                    await gotoFlow(flowPagoConfirmacion);
                } else {
                    await flowDynamic(text.payment.paymentError);
                    return;
                } 
            } catch (error) {
                await flowDynamic(text.globals.problem);
                return;
            }
        }
    )
const flowPagoConfirmacion = addKeyword(EVENTS.ACTION)
    .addAnswer(text.payment.enterNumber,
        { capture : true },
        async (ctx, { flowDynamic, state, fallBack }) => {
            try {
                const medioPago = ctx.body.trim();

                if (medioPago !== '') {

                    await state.update({ medioPago });
                    const nroTurnoConf = state.get('numeroTurno'); 
                    const data = { nroTurnoConf, medioPago }; 
                    const response = await postToAPI('updatePaymentMethod', data); 

                    
                    if (response.status == 'success') {
                        if (medioPago == 3) {
                            await flowDynamic(text.payment.personalPayment);
                        } else {
                            await flowDynamic(`${text.payment.successfulReservation} \n${text.payment.bankPayment}`);
                        }
                    } else {
                        await flowDynamic(text.globals.problem);
                    }
                } else {
                    await fallBack(text.globals.wrongInput);
                }
            } catch (error) {
                await flowDynamic(text.payment.paymentError);
            }
        });

const flowConsultarTurno = addKeyword(EVENTS.ACTION)
    .addAnswer(text.globals.insertLicense,
        { capture : true},
        async (ctx, { flowDynamic, state, gotoFlow, fallBack }) => {
            try {
                const patenteConsulta = ctx.body.toUpperCase().replace(/\s+/g, '');
    
                if (procesarPatentes(patenteConsulta)) {
                    await state.update({ patenteConsulta });
                    const data = { patenteConsulta };

                    const response = await postToAPI('consultarTurno', data);
                    if (response.status =='success' && Array.isArray(response.data)) {
                        const turnosMapped = response.data.map((turnos) => 
                            `- *N°:* ${turnos.id} \n - *Fecha:* ${turnos.fecha} \n - *Nombre:* ${turnos.nombre} \n - *Servicio:* ${turnos.servicios} \n\n`).join('\n');
                        await flowDynamic(`${text.reservation.consult.pendingAppointments} \n${turnosMapped}`);
                    } else {
                        await flowDynamic(text.reservation.consult.notFound);
                    }
                } else {
                    await flowDynamic(text.globals.invalidLicense);
                    await fallBack()
                }
            } catch (error) {
                await flowDynamic(text.globals.problem);
            }
        }
    )
    .addAnswer([text.reservation.reservationMenu.menu,
    		text.reservation.reservationMenu.options["1"],
    		text.reservation.reservationMenu.options["2"],
               ],
                {capture : true},
                async (ctx, { flowDynamic, state, gotoFlow, endFlow }) => {
                    const respuesta = parseInt(ctx.body);
                    
                    if (Number.isInteger(respuesta)){
                    	if (respuesta == 1) {
                        	gotoFlow (flowCancelarTurno);
                    	} else if (respuesta == 2) {
                        await flowDynamic(text.globals.endingFlows);
                        await endFlow();
                    	}
                    } else {
                    	await flowDynamic(text.globals.invalidResponse)
                    }

                }
    )


const flowCancelarTurno = addKeyword(EVENTS.ACTION)
    .addAnswer(text.reservation.cancel.insertAppointment,
        { capture : true },
        async (ctx, { flowDynamic, state, gotoFlow, fallBack }) => {
            try {
                const id_turno_cancela = parseInt(ctx.body);
                
                if (id_turno_cancela) {
                    const data = { id_turno_cancela };
                    const response = await postToAPI('cancelarTurno', data);

                    if (response.status == 'success') {
                        await flowDynamic(text.reservation.cancel.success);
                        await flowDynamic(text.globals.endingFlows);
                    } else {
                        await flowDynamic(text.globals.problem);
                    }
                } else {
                    await flowDynamic(text.reservation.cancel.invalidAppointment);
                }
            } catch (error) {
                await flowDynamic(text.globals.problem);
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
