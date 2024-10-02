<?php
session_start();
require_once '../model/conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];
    $login = $_POST["login"];

    if ($login == TRUE) {
        $query = "SELECT * FROM tabla_empleados WHERE nombre = :username";
        try {
            $stmt = $db->prepare($query);
            $stmt->bindParam(":username", $username);
            $stmt->execute();
        
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch();
                $hashAlmacenado = $row['contraseña'];

                 
                if (password_verify($password, $hashAlmacenado)) {
                    $_SESSION['usuario_id'] = $row['id'];
                    $_SESSION['nombre'] = $row['nombre'];
                    echo "Inicio de sesión exitoso.";
                } else {
                    echo "Contraseña incorrecta.";
                }
            } else {
                echo "Usuario no encontrado.";
            }
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
        }

    } else {
        echo "No se completó el proceso.";
    }
}

