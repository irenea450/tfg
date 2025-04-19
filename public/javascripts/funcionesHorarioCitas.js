



//? Marcar citas y sacar info en el lateral
document.addEventListener('DOMContentLoaded', function () {
    const celdasCita = document.querySelectorAll('.cita');

    // Crear o seleccionar el cuadro lateral
    let cuadroCitas = document.getElementById('cuadroCitas');
    if (!cuadroCitas) {
        cuadroCitas = document.createElement('div');
        cuadroCitas.id = "cuadroCitas";
        cuadroCitas.style.position = 'fixed';
        cuadroCitas.style.top = '100px';
        cuadroCitas.style.right = '0';
        cuadroCitas.style.width = '600px';
        cuadroCitas.style.height = 'auto';
        cuadroCitas.style.backgroundColor = '#fff';
        cuadroCitas.style.border = '1px solid #ccc';
        cuadroCitas.style.padding = '10px';
        cuadroCitas.style.margin = '10px';
        cuadroCitas.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        document.body.appendChild(cuadroCitas);
    }

    celdasCita.forEach(celda => {
        celda.addEventListener('click', function () {
            //rescatamos el id de la cita selecionada
            const idCita = celda.dataset.id;

            // 🔁 CONSULTAR CITA con fetch al backend
            fetch(`/zona/trabajador/consultar-cita/${idCita}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                }
            })
            .then(res => res.json())
            .then(data => {
                console.log('Datos recibidos:', data);  // Ver todos los datos en consola
            
                if (data.cita && data.paciente && data.paciente.length > 0) {
                    const cita = data.cita;  // Obtenemos la cita
                    const paciente = data.paciente[0];  // Accedemos al primer elemento del array de paciente
            
                    console.log('Cita:', cita);
                    console.log('Paciente:', paciente);
            
                    if (paciente && paciente.nombre) {
                        cuadroCitas.innerHTML = `
                        <h4>Detalles de la cita</h4>
                        <form class="container" id="formEditarCita">
                            <div class="row">
                                <div class="col">
                                    <label class="form-label"><strong>ID:</strong></label>
                                    <input type="text" class="form-control" name="id_cita" value="${cita.id_cita}" disabled readonly>
                                </div>
                                <div class="col">
                                    <label class="form-label"><strong>Estado:</strong></label>
                                    <input type="text" class="form-control" name="estado" value="${cita.estado}" disabled readonly>
                                </div>
                            </div><br>
                    
                            <label class="form-label"><strong>Motivo:</strong></label>
                            <input type="text" class="form-control" name="motivo" value="${cita.motivo}"><br>
                    
                            <label class="form-label"><strong>Paciente:</strong></label>
                            <input type="text" class="form-control" name="paciente" value="${paciente.nombre} ${paciente.apellidos}" disabled readonly><br>
                    
                            <label class="form-label"><strong>Empieza:</strong></label>
                            <input type="time" class="form-control" name="hora_inicio" value="${cita.hora_inicio}"><br>
                    
                            <label class="form-label"><strong>Finaliza:</strong></label>
                            <input type="time" class="form-control" name="hora_fin" value="${cita.hora_fin}"><br>

                            <div class="d-flex justify-content-between mt-2">
                                <button type="submit" class="btn btn-primary">Guardar cambios</button>
                                <button type="button" class="btn btn-outline-danger px-4" id="anularCita">Anular Cita</button>
                                <button type="button" class="btn btn-outline-success px-3" id="completarCita">Completar Cita</button>
                            </div>
                        </form>
                    `;

                    //*Funciones de los botones de la cita
                    //Guardar los cambios en la cita
                    document.getElementById('formEditarCita').addEventListener('submit', function (e) {
                        e.preventDefault();
                        const formData = new FormData(this);
                        const datos = {
                            id_cita: cita.id_cita,
                            motivo: formData.get('motivo'),
                            hora_inicio: formData.get('hora_inicio'),
                            hora_fin: formData.get('hora_fin')
                        };

                        //pasamos a la route que gaurda los cambios
                        fetch('/zona/trabajador/editar-cita', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(datos)
                        })
                        .then(res => res.json())
                        .then(data => {
                            console.log('Cita actualizada:', data);
                            alert('Cita actualizada correctamente');
                        })
                        .catch(err => console.error('Error al guardar cambios:', err));
                    });

                    // ❌ ANULAR CITA
                    document.getElementById('anularCita').addEventListener('click', function () {
                        fetch(`/zona/trabajador/anular-cita/${cita.id_cita}`, {
                            method: 'POST'
                        })
                        .then(res => res.json())
                        .then(data => {
                            console.log('Cita anulada:', data);
                            alert('Cita anulada');
                        })
                        .catch(err => console.error('Error al anular cita:', err));
                    });

                    // ✅ COMPLETAR CITA
                    document.getElementById('completarCita').addEventListener('click', function () {
                        fetch(`/zona/trabajador/completar-cita/${cita.id_cita}`, {
                            method: 'POST'
                        })
                        .then(res => res.json())
                        .then(data => {
                            console.log('Cita completada:', data);
                            alert('Cita marcada como completada');
                        })
                        .catch(err => console.error('Error al completar cita:', err));
                    });





                    } else {
                        console.error('El paciente no tiene nombre');
                    }
                } else {
                    console.error('No se encontraron datos de cita o paciente');
                }
            })
            .catch(err => {
                console.error('Error al obtener la cita:', err);
            });
            
            
            
            
        });
    });

    
});





//? Marcar descanso de comer
document.addEventListener('DOMContentLoaded', function () {
    const celdasDescanso = document.querySelectorAll('.descanso');

    celdasDescanso.forEach(celda => {
        celda.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Tiempo de descanso',
                text: 'En esta franja no se atiende',
                timer: 2000,
                showConfirmButton: false
            });
        });
    });
});

//? Marcar descanso de festivo
document.addEventListener('DOMContentLoaded', function () {
    const celdasFestivo = document.querySelectorAll('.festivo');

    celdasFestivo.forEach(celda => {
        celda.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Día festivo',
                text: 'Durante este día la clinica permanecerá cerrada',
                timer: 2500,
                showConfirmButton: false
            });
        });
    });
});
