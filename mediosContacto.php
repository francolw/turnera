<?php
include "header.php";
include "navbar.php";
include "admin/model/conexion.php";

// Realiza una consulta SQL para seleccionar todos los registros de la tabla "Contacto"
$query = "SELECT * FROM Contacto";
$result = $db->query($query);

?>

<div class="container" style="margin-top: 30px">
  <div class="row">
    <div class="col">
      <h2>Contacto</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Estos son nuestros medios de contacto</th>
          </tr>
        </thead>
        <tbody>
          <?php
          // Itera a través de los resultados y muestra cada registro en una fila de la tabla
          while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            echo "<td>" . $row['Descripcion'] . "</td>";
            echo "</tr>";
          }
          ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php include "footer.php"; ?>
