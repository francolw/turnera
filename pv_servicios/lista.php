<?php
require '../admin/model/conexion.php';
require '../functions.php';


$query = "SELECT id,
                 servicio, 
                 costo,
                 vigente
          FROM tabla_servicios
          ORDER BY id ASC";
$stmt = $db->prepare($query);
$stmt->execute();
$tabla_servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

$cabeceras_servicios = ['Servicio', 'Costo', 'Acciones'];

generarTabla($tabla_servicios, $cabeceras_servicios);