<?php
require '../admin/model/conexion.php';
require '../functions.php';

$query = "SELECT tc.id AS id,
                 tc.nombre AS nombre,
                 tc.telefono AS telefono,
                 tc.direccion AS direccion,
                 tc.vigente AS vigente,
                 tp.numero_patente AS numero_patente,
                 tv.vehiculo AS tipo_vehiculo
          FROM tabla_clientes AS tc
          LEFT JOIN tabla_patentes AS tp
            ON tc.id = tp.id_cliente
          LEFT JOIN tabla_vehiculos AS tv
            ON tp.tipo_vehiculo = tv.id
          ORDER BY tc.nombre ASC";

$stmt = $db->prepare($query);
$stmt->execute();
$tabla_clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

$cabeceras_clientes = ['Nombre', 'Telefono', 'Direccion', 'Patente', 'Tipo Vehiculo', 'Acciones'];
generarTabla($tabla_clientes, $cabeceras_clientes);