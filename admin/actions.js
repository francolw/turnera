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
            alert(response); // Muestra la respuesta del servidor
            // Aquí puedes redirigir o manejar la respuesta como desees
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
            console.log('si');
            alert(response); // Muestra la respuesta del servidor
            // Aquí puedes redirigir o manejar la respuesta como desees
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert("Error al registrar usuario." + errorThrown);
            console.log('no');
        });
    });
});
