<?php
$config = require '../admin/model/config.inc.php';

try {
    $db = new PDO(
        'mysql:host='.$config['host'].';port='.$config['port'].';dbname='.$config['dbname'],
        $config['user'],
        $config['pass']
    );  
} catch (Exception $error) {
    echo 'Error de conexión: ' . $error->getMessage();
    die();
}