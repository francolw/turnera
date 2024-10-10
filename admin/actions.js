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
            setTimeout(function()    {
                window.location.href = '../admin/inicio.php';
            }, 600);
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

    $('[name="cerrar_sesion"]').click(function(event){
        event.preventDefault(); // Prevenir comportamiento por defecto del enlace
    
        setTimeout(function(){
            window.location.href = '../admin/metodos/cerrar_sesion.php'; // Redirigir al archivo cerrar_sesion.php
        }, 850); // Cambia 2000 por el tiempo que desees en milisegundos
    });
    

    $('[name="btn_config"]').click(function(event) {    
        event.preventDefault(); // Evita que el enlace haga su acción por defecto
        $('#nav-2').css('bottom', '-100px');
        
        setTimeout(function(){
            $('#contenido-dinamico').hide();
            $('#popup').css("display", "flex"); // Muestra el popup
        }, 500);
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

    $('.sliderup').click(function(){
        $('#nav-2').css('bottom', '0');
    });

    $('.sliderdown').click(function(){
        $('#nav-2').css('bottom', '-100');
    });

    $('[name="btn_turnos"]').click(function(e) {
        e.preventDefault(); // Prevenir comportamiento por defecto del enlace
        $('#contenido-dinamico').empty();
        $('#contenido-dinamico').show();

        cargarContenido('../pv_turnos/lista.php');

    });
    
    // Cuando se hace clic en el botón Servicios
    $('[name="btn_servicios"]').click(function(e) {
        e.preventDefault();
        $('#contenido-dinamico').empty();
        $('#contenido-dinamico').show();
        
        cargarContenido('../pv_servicios/lista.php');
    });

    $('[name="btn_clientes"]').click(function(e) {
        e.preventDefault();
        $('#contenido-dinamico').empty();
        $('#contenido-dinamico').show();
        
        cargarContenido('../pv_clientes/lista.php');
    });


    $("#nav-1 a").on("click", function() {
        var position = $(this)
          .parent().position();
        var width = $(this)
          .parent().width();
        $("#nav-1 .slide1").css({ opacity: 1, left: +position.left, width: width });
      });
      
      $("#nav-1 a").on("mouseover", function() {
        var position = $(this)
          .parent().position();
        var width = $(this)
          .parent().width();
        $("#nav-1 .slide2").css({ 
          opacity: 1, left: +position.left, width: width })
          .addClass("squeeze");
      });
      
      $("#nav-1 a").on("mouseout", function() {
        $("#nav-1 .slide2").css({ opacity: 0 }).removeClass("squeeze");
      });
      
      var currentWidth = $("#nav-1")
        .find("li:nth-of-type(3) a")
        .parent("li")
        .width();
      var current = $("li:nth-of-type(3) a").position();
      $("#nav-1 .slide1").css({ left: +current.left, width: currentWidth });
      
        // Cargar la lista de turnos al cargar la página
        cargarContenido('../pv_turnos/lista.php');


    function cargarContenido(url) {
        $('#contenido-dinamico').load(url);
    }
    
});
