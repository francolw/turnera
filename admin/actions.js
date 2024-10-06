$(document).ready(function() {
    $('#loginForm').submit(function(e) {
        e.preventDefault(); // Evita la recarga de la página

        var username = $('input[name="username"]').val();
        var password = $('input[name="password"]').val();

        var loginData = {
            username: username,
            password: password,
            login: true // Añade un indicador para saber que es un inicio de sesión
        };

        $.post('../admin/metodos/login_proc.php', loginData, function(response) {
             window.location.href = '../admin/inicio.php';
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert("Error al iniciar sesión." + errorThrown);
        });
    });
    
    $('#signupForm').submit(function(e) {
        e.preventDefault(); // Evita la recarga de la página

        var username = $('#signupForm input[name="username"]').val();
        var email = $('#signupForm input[name="email"]').val();
        var password = $('#signupForm input[name="password"]').val();

        var signupData = {
            username: username,
            email: email,
            password: password,
            register: true // Añade un indicador para saber que es un registro
        };

        $.post('../admin/metodos/signup_proc.php', signupData, function(response) {
            window.location.href = '../admin/inicio.php';
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert("Error al registrar usuario." + errorThrown);
        });
    });

    $('#configLink').click(function(event) {    
        event.preventDefault(); // Evita que el enlace haga su acción por defecto
        $('#popup').css("display", "flex"); // Muestra el popup
    });

    // Manejar el clic en la 'x' para cerrar el popup
    $('#closePopup').click(function() {
        $('#popup').hide(); // Oculta el popup
    });

    // Manejar clic fuera del contenido del popup para cerrarlo
    $(window).click(function(event) {
        if ($(event.target).is('#popup')) {
            $('#popup').hide(); // Oculta el popup
        }
    });
});
