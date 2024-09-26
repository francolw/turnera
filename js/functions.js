const axios = require('axios');

async function postToAPI(action, data) {
    try {
        const response = await axios.post('http://localhost/coresys/queries.php', new URLSearchParams({
            action,
            ...data
        }));
        return response.data;
    } catch (error) {
        console.error('Error al hacer la solicitud:', error);
        return { status: 'error', message: error.message };
    }
}


function procesarPatentes(input) {
    let patente = input.toUpperCase().trim();  // Asegura que sea mayúscula y sin espacios innecesarios

    // Validación de formatos de patentes (autos y motos)
    if (/^[A-Z]{3}\d{3}$/.test(patente)) {
        console.log('Patente vieja de auto detectada (ABC123)');
    } else if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(patente)) {
        console.log('Patente Mercosur de auto detectada (AB123CD)');
    } else if (/^[A-Z]\d{3}[A-Z]{3}$/.test(patente)) {
        console.log('Patente de moto detectada (A123BCD)');
    } else {
        console.log('Formato de patente no válido');
        return null;  // Si no es válida, retorna null o un mensaje de error
    }

    // Procesamiento adicional, por ejemplo, eliminar comas
    let resultado = patente.replace(/,/g, '');  // Elimina todas las comas

    // Eliminar comas al inicio o al final, si las hay (aunque ya se eliminaron en la línea anterior)
    resultado = resultado.replace(/^,|,$/g, '');

    return resultado;  // Devuelve la patente procesada
}

function procesarInput(input) {
    // Eliminar letras y reemplazar por comas, luego reemplazar espacios por comas
    let resultado = input.replace(/[a-zA-Z]+/g, ',') // Reemplazar letras por comas
                         .replace(/\s+/g, ',') // Reemplazar espacios por comas
                         .replace(/,,+/g, ','); // Eliminar comas duplicadas
                         
    // Eliminar comas al inicio o al final, si las hay
    resultado = resultado.replace(/^,|,$/g, '');

    return resultado;
}


module.exports = { postToAPI, procesarPatentes, procesarInput  };
