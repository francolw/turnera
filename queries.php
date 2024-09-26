<?php
require_once 'admin/model/conexion.php';

header('Content-Type: application/json');

// Establecer el modo de depuración de PDO
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$action = $_POST['action'] ?? '';
$patente = $_POST['patente'] ?? '';
$idVehiculo = $_POST['idVehiculo'] ?? '';
$nombre = $_POST['nombre'] ?? '';
$telefono = $_POST['telefono'] ?? ''; 
$direccion = $_POST['direccion'] ?? '';
$numeroTurno = $_POST['numeroTurno'] ??'';
$id_servicio = $_POST['id_servicio'] ??'';
$servicioConf = $_POST['servicioConf'] ??'';
$idVehiculoConf = $_POST['idVehiculoConf'] ?? '';
$fechaConf = $_POST['fechaConf'] ??'';
$idClienteConf = $_POST['idClienteConf'] ?? '';


// unset($_POST);

// Respuesta por defecto en caso de error
$response = [
    'status' => 'error',  // Por defecto es 'error', lo cambiaremos si todo está bien
    'data' => null,
    'message' => 'Acción no válida'
];

if ($action == 'checkPatente' && !empty($patente)) {
    try {

        $patente = strtoupper(trim($patente));


        // Primera consulta: verificar si la patente existe y obtener el id_cliente
        $query = "SELECT id_cliente FROM tabla_patentes WHERE numero_patente = :patente AND vigente = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':patente',$patente);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        

        // Si se encuentra la patente
        if ($result && $result['id_cliente']) {
            $id_cliente = $result['id_cliente'];

            // Segunda consulta: obtener el nombre del cliente relacionado con la patente
            $query = "SELECT tc.nombre,
                             tp.tipo_vehiculo
                      FROM tabla_clientes AS tc 
                      JOIN tabla_patentes AS tp ON tc.id = tp.id_cliente 
                      WHERE tp.id_cliente = :id_cliente";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id_cliente', $id_cliente);
            $stmt->execute();
            $clientInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($clientInfo) {
                $response['status'] = 'success';
                $response['data'] = [
                    'id_cliente' => $id_cliente,
                    'nombre' => $clientInfo['nombre'],
                    'tipo_vehiculo' => $clientInfo['tipo_vehiculo']
                ];
                $response['message'] = 'La patente y el cliente se encontraron en la base de datos.';
            } else {
                $response['status'] = 'error';
                $response['data'] = null;
                $response['message'] = 'No se encontró el cliente relacionado con la patente.';
            }
        } else {
            // Si no se encuentra la patente
            $response['status'] = 'error';
            $response['data'] = null;
            $response['message'] = 'La patente no se encontró en la base de datos.';
        }
    } catch (Exception $e) {
        // Manejo de excepciones
        $response['message'] = "Error: " . __LINE__ . $e->getMessage();
    }
} else if ($action === 'getVehicleTypes') {
    try {
        $query = "SELECT id, vehiculo FROM tabla_vehiculos WHERE vigente = 1";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $response['status'] = 'success';
        $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response['message'] = 'Tipos de vehículos obtenidos exitosamente.';

    } catch (Exception $e) {
        $response['message'] = "Error: " .__LINE__ . $e->getMessage();
    }
} else if ($action == 'getCustomerVehicle'){
    try {
        $query = "SELECT id FROM tabla_vehiculos WHERE id LIKE :idVehiculo";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':idVehiculo', $idVehiculo);
        $stmt->execute();
        $id_vehiculo = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($id_vehiculo) {
            $response["status"] = "success";
            $response["data"] = $id_vehiculo;
            $response["message"] = "ID del vehiculo obtenido correctamente";
        } else {
            $response["status"] = "error";
            $response["data"] = $id_vehiculo;
            $response["message"] = "ID del vehiculo no se obtuvo";
        }
    } catch (Exception $e) {
        $response['message'] = "Error: " .__LINE__ . $e->getMessage();
    }

} else if ($action == 'getServices') {
    try {
        $query = 'SELECT id, servicio, costo FROM tabla_servicios WHERE vigente = 1';
        $stmt = $db->prepare($query);
        $stmt->execute();

        $response['status'] = 'success';
        $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response['message'] = 'Servicios obtenidos exitosamente.';

    } catch (Exception $e) {
        $response['message'] = "Error: " .__LINE__ . $e->getMessage();
    }
} else if ($action === 'insertNewCustomerData') {
    try {
        // Insertar cliente
        $query = "INSERT INTO tabla_clientes (nombre, telefono, direccion, habilita_descuento, vigente) VALUES (:nombre, :telefono, :direccion, 0, 1)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':direccion', $direccion);

        if ($stmt->execute()) {
            $idCliente = $db->lastInsertId();
            $response['status'] = 'success';
            $response['data'] = $idCliente;
            $response['message'] = 'Cliente registrado exitosamente';

            if ($idVehiculo) {
                // Insertar vehículo
                $queryVehiculo = "INSERT INTO tabla_patentes (numero_patente, id_cliente, tipo_vehiculo, vigente) VALUES (:patente, :idCliente, :idVehiculoTipo, 1)";
                $stmtVehiculo = $db->prepare($queryVehiculo);
                $stmtVehiculo->bindParam(':idCliente', $idCliente);
                $stmtVehiculo->bindParam(':patente', $patente);
                $stmtVehiculo->bindParam(':idVehiculoTipo', $idVehiculo);

                if ($stmtVehiculo->execute()) {
                    $response['message'] .= ' y vehículo registrado exitosamente.';
                } else {
                    $response['status'] = 'error';
                    $response['message'] .= ' pero hubo un error al registrar el vehículo: ' . implode(", ", $stmtVehiculo->errorInfo());
                }
            } else {
                $response['status'] = 'error';
                $response['message'] = 'Tipo de vehículo no encontrado.';
            }
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Error al registrar el cliente: ' . implode(", ", $stmt->errorInfo());
        }
    } catch (Exception $e) {
        $response['status'] = 'error';
        $response['message'] = "Error: " . $e->getMessage();
    }
} else if ($action == 'getAvailableTurns') {
    try {
        $query = "SELECT id, fecha FROM tabla_turnos WHERE id_estado = 6 AND vigente = 1 LIMIT 10";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $response['status'] = 'success';
        $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response['message'] = 'Turnos obtenidos';

    } catch (Exception $e) {
        $response['status'] = 'error';
        $response['message'] = $e->getMessage();
    }

} else if ($action == 'updateTurnera') {
    $id_servicio_conf = $id_servicio; // Esto puede ser una cadena como '1, 5'
    // $idVehiculoConf = (int) $_POST['idVehiculoConf']; 
    $patenteConf = $_POST['patente'];
    // Convertir el string de servicios en un array
    $serviciosArray = array_map('trim', explode(',', $id_servicio_conf));

    try {
        // Verificar si el id_vehiculo existe en tabla_patentes
        $vehiculoQuery = "SELECT id_cliente FROM tabla_patentes WHERE tipo_vehiculo = :id_vehiculo AND numero_patente LIKE :patente_conf LIMIT 1";
        $stmtVehiculo = $db->prepare($vehiculoQuery);
        $stmtVehiculo->bindParam(':id_vehiculo', $idVehiculoConf);
        $stmtVehiculo->bindParam(':patente_conf', $patenteConf);
        $stmtVehiculo->execute();
        
        $id_cliente = $stmtVehiculo->fetch(PDO::FETCH_ASSOC);

        
        // Si el vehículo no existe, retornar error
        if (!$id_cliente || !isset($id_cliente['id_cliente'])) {
            $response['status'] = 'error';
            $response['message'] = 'El vehículo especificado no existe.';
            echo json_encode($response);
            return; // Terminar la ejecución del script
        }
        
        $idClienteConf = $id_cliente['id_cliente'];
        // Obtener el primer id_servicio para actualizar la tabla_turnos
        $primerServicio = $serviciosArray[0]; // O puedes definir cómo manejar esto

        // Actualizar la tabla_turnos
        $query = "UPDATE tabla_turnos 
                  SET id_cliente = :id_cliente, 
                      id_servicio = :id_servicio,
                      id_vehiculo = :id_vehiculo, 
                      id_estado = 1, 
                      fecha_creacion = NOW(), 
                      fecha_actualizacion = NOW(), 
                      canal_cobro = NULL 
                  WHERE id = :id_turno
                  LIMIT 1";  

        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_cliente', $idClienteConf);
        $stmt->bindParam(':id_servicio', $primerServicio);
        $stmt->bindParam(':id_vehiculo', $idVehiculoConf);
        $stmt->bindParam(':id_turno', $numeroTurno); 
        $stmt->execute();

        $vehiculoCountQuery = "SELECT COUNT(*) FROM tabla_vehiculos WHERE id = :id_vehiculo";
        $stmtVehiculoCount = $db->prepare($vehiculoCountQuery);
        $stmtVehiculoCount->bindParam(':id_vehiculo', $idVehiculoConf);
        $stmtVehiculoCount->execute();
        $vehiculoCount = $stmtVehiculoCount->fetchColumn();

        if ($vehiculoCount == 0) {
            $response['status'] = 'error';
            $response['message'] = 'El vehículo especificado no existe en la tabla de vehículos.';
            echo json_encode($response);
            return; // Terminar la ejecución del script
        }

        // Procesar los servicios en la tabla intermedia
        foreach ($serviciosArray as $id_servicio) {
            // Verificar si el servicio existe
            $servicioQuery = "SELECT COUNT(*) FROM tabla_servicios WHERE id = :id_servicio";
            $stmtServicio = $db->prepare($servicioQuery);
            $stmtServicio->bindParam(':id_servicio', $id_servicio);
            $stmtServicio->execute();
            $servicioCount = $stmtServicio->fetchColumn();

            // Si el servicio no existe, continuar al siguiente
            if ($servicioCount == 0) {
                $response['status'] = 'error';
                $response['message'] = 'El servicio con ID ' . $id_servicio . ' no existe.';
                echo json_encode($response);
                return; // Terminar la ejecución del script
            }

            // Si el servicio existe, proceder con la inserción
            $insertQuery = "INSERT INTO tabla_servicios_turnos (id_turno, id_servicio) VALUES (:id_turno, :id_servicio)";
            $stmtInsert = $db->prepare($insertQuery);
            $stmtInsert->bindParam(':id_turno', $numeroTurno);
            $stmtInsert->bindParam(':id_servicio', $id_servicio);
            $stmtInsert->execute();
        }

        $response['status'] = 'success';
        $response['message'] = 'Turno actualizado y servicios registrados exitosamente.';
    } catch (Exception $e) {
        $response['status'] = 'error';
        $response['message'] = "Error: " . $e->getMessage();
    }
} else if ($action == 'confirmReservation') {

    if (isset($_POST['nroTurnoConf'])) {
        $nroTurnoConf = $_POST['nroTurnoConf'];
    } else {
        $response['status'] = 'error';
        $response['message'] = 'No se recibió el número de turno.';
        echo json_encode($response);
        exit;
    }

    try {
        $query = "SELECT tt.fecha,
                         tc.nombre,
                         GROUP_CONCAT(serv.servicio SEPARATOR ', ') AS servicios
                  FROM tabla_turnos AS tt
                  JOIN tabla_clientes AS tc
                    ON tt.id_cliente = tc.id
                  JOIN tabla_servicios_turnos AS tst
                    ON tt.id = tst.id_turno
                  JOIN tabla_servicios AS serv
                     ON tst.id_servicio = serv.id  
                  WHERE tt.vigente = 1 AND 
                        tst.id_turno = :id_turno
                  GROUP BY tt.fecha, tc.nombre";
                    
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_turno', $nroTurnoConf, PDO::PARAM_INT);
        if($stmt->execute()) {
            $response['status'] = 'success';
            $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response['message'] = 'Se muestra la confirmacion del turno';
        } else {
            $response['status'] = 'error';
            $response['message'] = 'No fue posible mostrar la confirmación del turno.';
        }
    } catch (Exception $e) {
        $response['status'] = 'error';
        $response['message'] = "Error: " . $e->getMessage();
    }
} else if ($action == 'getPaymentMethods') {
    try {
        $query = "SELECT id, canal FROM tabla_canales_pago WHERE vigente = 1";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $response["status"] = "success";
        $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response['message'] = 'Métodos de pago obtenidos';
    } catch (PDOException $e) {
        $response['status'] = 'error';
        $response['message'] = 'Error al obtener los métodos de pago: '. $e->getMessage();
    }
} else if ($action == 'updatePaymentMethod') {
    if (isset($_POST['nroTurnoConf']) && isset($_POST['medioPago'])) {
        $idTurnoConf = $_POST['nroTurnoConf'];
        $idMetodoPagoConf = $_POST['medioPago'];
    } else {
        $response['status'] = 'error';
        $response['message'] = 'No se recibieron los parámetros necesarios.' .__LINE__;
        echo json_encode($response);
        exit;
    }

    try {
        $query = "UPDATE tabla_turnos SET canal_cobro = :idMetodoPagoConf WHERE id = :idTurnoConf AND vigente = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':idTurnoConf', $idTurnoConf, PDO::PARAM_INT);
        $stmt->bindParam(':idMetodoPagoConf', $idMetodoPagoConf, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $response['status'] ='success';
            $response['message'] = 'Método de pago actualizado exitosamente.';
        } else {
            $response['status'] = 'error';
            $response['message'] = 'No fue posible actualizar el método de pago.';
        }
    } catch (PDOException $e) {
        $response['status'] = 'error';
        $response['message'] = 'Error al actualizar el método de pago: '. $e->getMessage();
    }
} else if ($action == 'consultarTurno') {
    try {

        if (isset($_POST['patenteConsulta'])) {
            $patenteConsulta = $_POST['patenteConsulta'];
        

            $query = "SELECT id_cliente FROM tabla_patentes WHERE vigente = 1 AND numero_patente = :patenteConsulta LIMIT 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':patenteConsulta', $patenteConsulta);
            $stmt->execute();
            $id_cliente = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($id_cliente) {
                $query = "SELECT tt.id,
                                 tt.fecha,
                                 tc.nombre,
                                 GROUP_CONCAT(serv.servicio SEPARATOR ', ') AS servicios
                                FROM tabla_turnos AS tt
                                JOIN tabla_clientes AS tc
                                ON tt.id_cliente = tc.id
                                JOIN tabla_servicios_turnos AS tst
                                ON tt.id = tst.id_turno
                                JOIN tabla_servicios AS serv
                                    ON tst.id_servicio = serv.id  
                                WHERE tt.vigente = 1 AND 
                                    tt.id_cliente = :id_cliente
                                GROUP BY tt.fecha, tc.nombre";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id_cliente', $id_cliente['id_cliente']);
                
                if ($stmt->execute()){
                    $response['status'] ='success';
                    $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $response['message'] = 'Turno obtenido exitosamente.';
                } else {
                    $response['status'] = 'error';
                    $response['message'] = 'No se encontró un turno para la patente ingresada.';
                }
        } else {
            $response['status'] = 'error';
            $response['message'] = 'No se encontró un cliente asociado a la patente ingresada.';
        }
    } else {
        $response['status'] = 'error';
        $response['message'] = 'No se recibió la patente del vehículo.';
    }
    } catch(PDOException $e) {
        $response['status'] = 'error';
        $response['message'] = 'Error al realizar la consulta: '. $e->getMessage();
    }
} else if ($action == 'cancelarTurno') {

    if (isset($_POST['id_turno_cancela'])){
        $id_turno_cancela = $_POST['id_turno_cancela'];
        try {
            $query = "UPDATE tabla_turnos SET fecha_actualizacion = NOW(), vigente = 0 WHERE id = :id_turno_cancela";
            $stmt = $db->prepare($query);
        
            // Verificar que el prepare() haya sido exitoso
            if ($stmt) {
                $stmt->bindParam(':id_turno_cancela', $id_turno_cancela);
                $stmt->execute(); // Intentamos ejecutar la consulta
                
                // Asignamos el mensaje dependiendo del resultado de la operación
                $response['status'] = 'success';
                $response['message'] = 'Turno cancelado exitosamente.';
            } else {
                // Si el prepare() falla
                $response['status'] = 'error';
                $response['message'] = 'Error al preparar la consulta SQL.';
            }
        } catch (PDOException $e) {
            // Manejo de excepciones PDO
            $response['status'] = 'error';
            $response['message'] = 'Error al cancelar el turno: ' . $e->getMessage();
        }
        
        // Comprobamos si no se actualizó ninguna fila
        if ($stmt->rowCount() === 0) {
            $response['status'] = 'error';
            $response['message'] = 'No se pudo cancelar el turno: ID no encontrado o ya cancelado.';
        }
    }
} 



echo json_encode($response); 




// function executeQuery($db, $query, $params = []) {
//     $stmt = $db->prepare($query);
//     $stmt->execute($params);
//     return $stmt;
// }

// $result = executeQuery($db, $query, ['patente' => $patente])->fetch(PDO::FETCH_ASSOC);