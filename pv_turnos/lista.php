<?php
require '../admin/model/conexion.php';
require '../functions.php';

$query = "SELECT
                tt.id AS id,
                tt.fecha AS fecha,
                tc.nombre AS cliente,
                tc.telefono AS telefono,
                GROUP_CONCAT(servicios.servicio SEPARATOR ', ') AS servicio,
                estados.estado AS estado,
                tcp.canal AS canal_pago
            FROM
                tabla_turnos AS tt
            JOIN tabla_clientes AS tc
            ON tt.id_cliente = tc.id
            JOIN tabla_estados AS estados
            on tt.id_estado = estados.id
            JOIN tabla_canales_pago AS tcp
            on tt.canal_cobro = tcp.id
            JOIN tabla_servicios_turnos AS tst
            ON tt.id = tst.id_turno
            JOIN tabla_servicios AS servicios
            ON tst.id_servicio = servicios.id
            GROUP BY tt.id";

$stmt = $db->prepare($query);
$stmt->execute();
$tabla_turnos = $stmt->fetchAll(PDO::FETCH_ASSOC);

$cabeceras_turnos = ['Fecha', 'Cliente', 'Servicio', 'Estado', 'Forma de Pago', 'Acciones'];
generarTabla($tabla_turnos, $cabeceras_turnos, true);