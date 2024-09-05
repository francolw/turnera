<?php
include("header.php");
include("navbar.php");
?>
    <div class="container mt-5">
        <p class="text-left"><kbd>Esta es tu plataforma administrativa.</kbd></p>
    </div>


    <div class="container"><!--Comienza Container-->
    <br><br>
        <div class="row"><!--Comienza Row-->
            
            <div class="col-sm-6">
                <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Consultar Citas</h5>
                    <p class="card-text">Accede al módulo para consultar las citas generadas.</p>
                    <a href="mod_reservas.php" class="btn btn-primary"><i class="fas fa-calendar"></i> Ir al módulo</a>
                </div>
                </div>
            </div>
            
            <div class="col-sm-6">
                <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Medios de contacto</h5>
                    <p class="card-text">Añade o edita los medios de contacto.</p>
                    <?php include "contacto/form_contacto.php";?>
                </div>
                </div>
            </div>


            

        </div><!--Finaliza Row-->

    </div><!--Finaliza Container-->

    <div class="container">
        <div class="card">
        <div class="card-header text-center">
            <p class="text-secondary"><b>Tus citas agendadas son las siguientes</b></p>
        </div>
        <div class="card-body">
             <?php include "calendario.php";?>
        </div>
        </div>
    </div>




<?php
include("../footer.php");
?>