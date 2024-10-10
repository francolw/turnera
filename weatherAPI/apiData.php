<?php
// Definir tu clave de API
$apiKey = 'xEB1juPWKDesSvEQRZkVyTk6E7krJCXR';

// Función para obtener el locationKey
function getLocationKey($city) {
    global $apiKey;
    $url = "http://dataservice.accuweather.com/locations/v1/cities/search?apikey=$apiKey&q=" . urlencode($city);
    
    // Realizar la solicitud
    $response = file_get_contents($url);
    
    if ($response === FALSE) {
        return null; // Manejar error en la solicitud
    }
    
    // Decodificar el JSON
    $data = json_decode($response, true);
    
    if (isset($data[0]['Key'])) {
        return $data[0]['Key']; // Devuelve el primer locationKey
    }
    
    return null; // Si no se encontró el locationKey
}

// Función para obtener el pronóstico
function getWeatherForecast($locationKey) {
    global $apiKey;
    $url = "http://dataservice.accuweather.com/forecasts/v1/daily/1day/$locationKey?apikey=$apiKey&language=eS-us&details=true&metric=true";
    
    // Realizar la solicitud
    $response = file_get_contents($url);
    
    if ($response === FALSE) {
        return null; // Manejar error en la solicitud
    }
    
    // Decodificar el JSON
    $data = json_decode($response, true);
    return $data; // Devuelve los detalles del pronóstico
}

// Ejemplo de uso
$city = 'Crespo Argentina';
$locationKey = getLocationKey($city);

if ($locationKey) {
    $forecast = getWeatherForecast($locationKey);
    
    if ($forecast) {
        echo "Pronostico correcto";
    } else {
        echo "Pronostico no encontrado";
    }
} else {
    echo "Pronostico no encontrado";
}
