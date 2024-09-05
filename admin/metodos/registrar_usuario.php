
<?php
// Depuración para verificar los datos recibidos
//var_dump($_POST);
// Incluye el archivo de conexión a la base de datos
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once '../model/conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST["nombre"];
    $username = $_POST["username"];
    $password = $_POST["password"];

    // Cifra la contraseña usando password_hash
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Consulta para insertar el nuevo usuario en la base de datos
    $query = "INSERT INTO usuarios (nombre, username, password) VALUES (:nombre, :username, :password)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":nombre", $nombre);
    $stmt->bindParam(":username", $username);
    $stmt->bindParam(":password", $hashed_password); // Almacena la contraseña cifrada

    if ($stmt->execute()) {
        // Registro exitoso
        echo "Registro exitoso. ¡Bienvenido, $nombre!";
    } else {
        // Error en el registro
        echo "Error en el registro. Por favor, inténtalo de nuevo.";
    }
}

?>


