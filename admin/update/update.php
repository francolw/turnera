<?php
#Verificar el envio de datos
#print_r ($_POST);

if (isset($_POST["oculto"])) {
    header("Location: http://localhost/citas/admin/error.php");
}

#conexion a db
include "../model/conexion.php";
#datos actualizados
$id2 = $_POST["id2"];
$nombre = $_POST["nombre"];
$apellidos = $_POST["apellidos"];
$correo = $_POST["correo"];
$servicio = $_POST["servicio"];
$fecha = $_POST["fecha"];
$hora = $_POST["hora"];
$mensaje = $_POST["mensaje"];
$estado = $_POST["estado"];

#sentencia sql para insertar registros actualizados
$sentencia = $db->prepare("UPDATE reservas SET Nombre=?, Apellidos=?, Correo=?, Servicio=?, Fecha=?, Hora=?, MensajeAdicional=?, Estado=? WHERE ID=?;");
$resultado = $sentencia-> execute([$nombre, $apellidos, $correo, $servicio,$fecha, $hora, $mensaje, $estado, $id2]);

#validar una direccion en casi de que se actualicen correctamente los datos
if ($resultado === true) {
    header("Location: http://localhost/citas/admin/mod_reservas.php");
}else{
    echo "Error no se pueden actualziar los registros";
}
?>