<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <a class="navbar-brand" href="./inicio.php">Tablero Administrativo</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
    <div class="navbar-nav">
      <a class="nav-item nav-link active" href="./inicio.php">Inicio <span class="sr-only">(current)</span></a>
      <a class="nav-item nav-link active" href="soporte.php">Soporte</a><!--disabled-->
      <a class="nav-item nav-link active" href="cambiarPassword.php">Cambiar contraseña</a>
      <a class="nav-item nav-link disabled" style="color:white">Bienvenido, <?php echo $nombreUsuario; ?>!</a>
      <a class="btn btn-danger" href="metodos/cerrar_sesion.php">Cerrar Sesión</a>
    </div>
  </div>
</nav>