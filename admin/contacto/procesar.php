<?php

print_r ($_POST);

#conexion a la base de datos
include "../model/conexion.php";

#procesar el guardado
$id = $_POST['id'];
$mediosContacto = $_POST['mediosContacto'];

#sentencia para insertar los datos
$sentencia = $db->prepare("UPDATE contacto SET Descripcion=? WHERE ID=?"); // Añade una condición WHERE para especificar qué registro actualizar
$resultado = $sentencia->execute([$mediosContacto, $id]); // Asegúrate de proporcionar el valor de $id correctamente


if($resultado==true){
    header("Location: ../exito.php");
}else{
    header("Location: ../error.php");
}
