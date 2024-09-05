
    <script src="https://code.jquery.com/jquery-3.5.1.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>

    <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-bs4.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-bs4.min.js"></script>


    <?php
        include("model/conexion.php");

        // Realiza la consulta SQL para obtener los datos de contactos
        $sql = "SELECT Descripcion FROM contacto WHERE id = 1";

        try {
            // Ejecuta la consulta
            $stmt = $db->query($sql);

            // Obtiene el resultado de la consulta
            $fila = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verifica si se encontraron datos
            if ($fila) {
                $mediosContacto = $fila['Descripcion'];
            } else {
                $mediosContacto = ""; // Si no se encontraron datos, establece un valor predeterminado o vacío
            }
        } catch (PDOException $error) {
            echo 'Error al consultar la base de datos: ' . $error->getMessage();
            die();
        }

        // Cierra la conexión a la base de datos (opcional)
        //$db = null;
  ?>





<button class="btn btn-info" data-toggle="modal" data-target="#modalForm">
    <i class="fas fa-plus"></i> Colocar datos de contacto
</button>


<!-- Modal -->
<div class="modal fade" id="modalForm" tabindex="-1" role="dialog" aria-labelledby="modalForm" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalForm">Medios de contacto</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
            <form action="contacto/procesar.php" method="post">
                <textarea id="mediosContacto" name="mediosContacto"><?php echo $mediosContacto; ?></textarea>
                <input type="hidden" name="id" value="1">
                <button class="btn btn-success" type="submit"> Guardar</button>
            </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
      </div>
    </div>
  </div>
</div>


    <script>
      $('#mediosContacto').summernote({
        placeholder: 'Ingresa tus medios de contacto',
        tabsize: 2,
        height: 100
      });
    </script>