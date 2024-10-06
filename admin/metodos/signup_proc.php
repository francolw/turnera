<?php
// session_start();
require_once '../model/conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST["username"];
    $email = $_POST["email"];
    $password = password_hash($_POST["password"], PASSWORD_DEFAULT);
    $register = $_POST["register"];

    if ($register == TRUE) {
        $query = "INSERT INTO tabla_empleados (nombre, telefono, email, contraseña, id_rol, vigente) VALUES (:username, '', :email, :password, 1, 1)";
        try {
            $stmt = $db->prepare($query);
            $stmt->bindParam(":username", $username);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password", $password);
        
            if ($stmt->execute()) {
                echo "Usuario registrado exitosamente.";
            } else {
                echo "Error al registrar usuario.";
            }
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
        }
    } else {
        echo "No se completó el proceso";
    }

}
