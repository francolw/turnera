<!DOCTYPE html>
<html>
<head>
    <title>Iniciar Sesión</title>
    <link rel="stylesheet" type="text/css" href="../styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Jost:wght@500&display=swap" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="../admin/actions.js"></script>
</head>
<body id="main">
<div class="main">
    <input type="checkbox" id="chk" aria-hidden="true">

    <div class="login">
        <form id="loginForm" method="POST">
            <label for="chk" aria-hidden="true">Ingresar</label>
            <input type="username" name="username" placeholder="Usuario" required="">
            <input type="password" name="password" placeholder="Contraseña" required="">
            <button type="submit" name="login">Ingresar</button>
      </form>
    </div>

    <div class="signup" id="signup">
     <form id="signupForm" method="POST">
        <label for="chk" aria-hidden="true">Registrarse</label>
        <input type="text" name="username" placeholder="Usuario" required="">
        <input type="email" name="email" placeholder="Email" required="">
        <input type="password" name="password" placeholder="Contraseña" required="">
        <button type="submit" name="register">Registrarse</button>
      </form>
    </div>
</div>
</body>
</html>
