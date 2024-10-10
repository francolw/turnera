<?php
// // Conectar a la base de datos
// $query = "SELECT * FROM tabla_turnos"; // Ajusta esto según tu tabla
// $stmt = $db->prepare($query);
// $stmt->execute();
// $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

require '../admin/header.php';
require '../admin/navbar.php';
require '../admin/model/conexion.php';
// require '../weatherAPI/apiData.php';
require '../pv_turnos/lista.php';

// $temperature = isset($forecast['DailyForecasts'][0]['Temperature']['Maximum']['Value']) ? $forecast['DailyForecasts'][0]['Temperature']['Maximum']['Value'] : 'N/A';
// $description = isset($forecast['DailyForecasts'][0]['Day']['IconPhrase']) ? $forecast['DailyForecasts'][0]['Day']['IconPhrase'] : 'N/A';
// $sensation = isset($forecast['DailyForecasts'][0]['RealFeelTemperature']['Maximum']['Value']) ? $forecast['DailyForecasts'][0]['RealFeelTemperature']['Maximum']['Value'] : 'N/A';
// $iconCode = isset($forecast['DailyForecasts'][0]['Day']['Icon']) ? str_pad($forecast['DailyForecasts'][0]['Day']['Icon'], 2, '0', STR_PAD_LEFT) : '01';
$temperature = "18 ";
$description = "Nublado";
$sensation = "15";
$iconCode = "05";
?>


<div class="banner">
    <div class="weather-info">
    <h3>Clima en Crespo</h3>
        <h1 class="temp"><?php echo $temperature; ?>°C</h1>
        <p class="description"><?php echo $description; ?></p>
        <p class="footer">Sensación térmica: <?php echo $sensation; ?>°C</p>
    </div>
    <div>
        <img src="https://developer.accuweather.com/sites/default/files/<?php echo $iconCode; ?>-s.png" alt="icono clima" class="icon">
    </div>
</div>


<!-- <div class="moduloBotones">
    <a href="#" class="btn btn-primary" name="btn-turnos">Turnos</a>
    <a href="#" class="btn btn-primary" name="btn-clientes">Clientes</a>
    <a href="#" class="btn btn-primary" name="btn-servicios">Servicios</a>
</div> -->


<div id="contenido-dinamico">  
</div>

</body>
</html>