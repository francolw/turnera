<?php

function generarTabla($datos, $cabeceras, $esTurnos = false) {
    if (!empty($datos)) {
        ?>
        <table class="main-table">
            <thead>
                <tr>
                    <?php foreach ($cabeceras as $cabecera): ?>
                        <th><?= htmlspecialchars($cabecera); ?></th>
                    <?php endforeach; ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($datos as $index => $fila): ?>
                    <?php                     
                    $esNoVigente = isset($fila['vigente']) && !$fila['vigente'];
                    $claseFila = ($index % 2 === 0 ? 'fila-par ' : 'fila-impar')  . ($esNoVigente ? ' fila-no-vigente' : '')
                    ?>
                    <tr class="<?= $claseFila; ?>">
                    <?php foreach ($fila as $key => $valor): ?>
                            <?php if ($key !== 'vigente' && $key !== 'id' && ($key !== 'telefono' || !$esTurnos)): // Omitir el campo 'vigente' en la tabla ?>
                                <td><?= htmlspecialchars($valor); ?></td>
                            <?php endif; ?>
                        <?php endforeach; ?>
                        <td>
                            <?php if ($esTurnos && isset($fila['telefono'])): ?>
                                <a href="https://wa.me/<?= htmlspecialchars($fila['telefono']); ?>" target="_blank" title="Contactar vía WhatsApp">
                                    <img src="../img/wpp-logo.png" class="clickable-icon" alt="WhatsApp" width="20" height="20">
                                </a>
                            <?php endif; ?> 
                            <a href="#" rel="<?= htmlspecialchars($fila['id']); ?>" title="Acción">
                                <img src="../img/pencil-icon.png" class="clickable-icon" alt="Editar" width="20" height="20">
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php
    } else {
        echo '<p>No hay datos disponibles.</p>';
    }
}
