<?php
include("header.php");
include("navbar.php");
include "model/conexion.php";

// Iniciar sesión si aún no está iniciada
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Verificar si el usuario está autenticado
if (!isset($_SESSION["usuario_id"])) {
    header("Location: index.php");
    exit();
}

$usuario_id = $_SESSION["usuario_id"];
$mensaje = $error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nueva_contrasena = $_POST["nueva_contrasena"];

    // Validar la nueva contraseña (puedes agregar más validaciones según tus requisitos)
    if (strlen($nueva_contrasena) >= 8) {
        // Hash de la nueva contraseña
        $hashed_password = password_hash($nueva_contrasena, PASSWORD_DEFAULT);

        // Actualizar la contraseña en la base de datos
        $stmt = $db->prepare("UPDATE usuarios SET password = ? WHERE id = ?");
        if ($stmt->execute([$hashed_password, $usuario_id])) {
            $mensaje = "Contraseña actualizada con éxito.";
        } else {
            $error = "Error al actualizar la contraseña.";
        }
    } else {
        $error = "La nueva contraseña debe tener al menos 8 caracteres.";
    }
}
?>

<div class="container mt-5">
    <h1 class="mb-4">Cambiar Contraseña</h1>
    <?php if (!empty($mensaje)) : ?>
        <div class="alert alert-success">
            <?php echo $mensaje; ?>
        </div>
    <?php endif; ?>
    <?php if (!empty($error)) : ?>
        <div class="alert alert-danger">
            <?php echo $error; ?>
        </div>
    <?php endif; ?>
    <form method="post">
        <div class="form-group">
            <label for="nueva_contrasena">Nueva Contraseña:</label>
            <input type="text" class="form-control" name="nueva_contrasena" required>
        </div>
         <a href="inicio.php" class="btn btn-danger">Cancelar</a>
        <button type="submit" class="btn btn-primary">Cambiar Contraseña</button>
    </form>
</div>
</body>
</html>
