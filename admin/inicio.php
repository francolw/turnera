<?php
// // Conectar a la base de datos
// $query = "SELECT * FROM tabla_turnos"; // Ajusta esto según tu tabla
// $stmt = $db->prepare($query);
// $stmt->execute();
// $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

require '../admin/header.php';
require '../admin/navbar.php';
require '../admin/model/conexion.php';

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
            WHERE
                tt.vigente = 1
                GROUP BY tst.id_turno";
$stmt = $db->prepare($query);
$stmt->execute();
$tabla_turnos = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>


<div class="banner">
    <div class="weather-info">
        <h3>Clima en Crespo</h3>
        <h1 class="temp">18.75°C</h1>
        <p class="description">Pocas nubes</p>
        <p class="footer">Sensación térmica: 18.4°C</p>
    </div>
    <div>
        <img src="https://openweathermap.org/img/wn/02n.png" alt="icono clima" class="icon">
    </div>
</div>

<table class="turnos-table">
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>servicio</th>
            <th>Estado</th>
            <th>Forma pago</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($tabla_turnos as $turno): ?>
        <tr>
            <td><?php echo $turno['fecha']; ?></td>
            <td><?php echo $turno['cliente']; ?></td>
            <td><?php echo $turno['servicio']; ?></td>
            <td><?php echo $turno['estado']; ?></td>
            <td><?php echo $turno['canal_pago']; ?></td>
            <td>
                <!-- Icono de WhatsApp -->
                <a href="https://wa.me/<?php echo $turno['telefono']; ?>" target="_blank" title="Enviar mensaje por WhatsApp">
                    <img src="../img/wpp-logo.png" alt="WhatsApp" width="20" height="20">
                </a>
                <!-- Icono de cancelación -->
                <a href="#" rel="<?php echo $turno['id']; ?>" title="Cancelar turno">
                    <img src="../img/cancel-logo.png" alt="Cancelar" width="20" height="20">
                </a>
            </td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>



</body>
</html>