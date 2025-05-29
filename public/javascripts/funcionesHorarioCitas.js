



//? Marcar citas y sacar info en el lateral
document.addEventListener('DOMContentLoaded', function () {
    const celdasCita = document.querySelectorAll('.cita');

    celdasCita.forEach(celda => {
        celda.addEventListener('click', function () {
            //mostramos cuadrado
            let cuadroCitas = document.getElementById('cuadroCitas');
            cuadroCitas.style.display = 'block';

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
                    //console.log('Datos recibidos:', data);  // Ver todos los datos en consola

                    if (data.cita && data.paciente && data.paciente.length > 0) {
                        const cita = data.cita;  // Obtenemos la cita
                        const paciente = data.paciente[0];  // Accedemos al primer elemento del array de paciente

                        //console.log('Cita:', cita);
                        //console.log('Paciente:', paciente);

                        const fechaFormateada = new Date(cita.fecha).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }).split('/').reverse().join('-');

                        if (paciente && paciente.nombre) {
                            cuadroCitas.innerHTML = `
                        <h4>Detalles de la cita</h4>
                        <form class="container" id="formEditarCita" method="post">
                            <div class="row">
                                <div class="col">
                                    <label class="form-label"><strong>ID:</strong></label>
                                    <input type="text" class="form-control" name="id_cita" id="id_cita" value="${cita.id_cita}" disabled readonly>
                                </div>
                                <div class="col">
                                    <label class="form-label"><strong>Estado:</strong></label>
                                    <input type="text" class="form-control" name="estado" id="estado" value="${cita.estado}" disabled readonly>
                                </div>
                            </div><br>
                    
                            <label class="form-label"><strong>Motivo:</strong></label>
                            <input type="text" class="form-control" name="motivo" id="motivo" value="${cita.motivo}"><br>
                    
                            <label class="form-label"><strong>Paciente:</strong></label>
                            <input type="text" class="form-control" name="paciente" id="paciente" value="${paciente.nombre} ${paciente.apellidos}" disabled readonly><br>
                    
                            <label class="form-label"><strong>Fecha:</strong></label>
                            <input type="date" class="form-control" name="fecha" id="fecha" value="${fechaFormateada}"><br>

                            <div class="row">
                                <div class="col">
                                    <label class="form-label"><strong>Empieza:</strong></label>
                                    <input type="time" class="form-control" name="hora_inicio" id="hora_inicio" value="${cita.hora_inicio}"><br>
                                </div>  
                                <div class="col">
                                    <label class="form-label"><strong>Finaliza:</strong></label>
                                    <input type="time" class="form-control" name="hora_fin" id="hora_fin" value="${cita.hora_fin}"><br>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between mt-2">
                                <button type="submit" class="btn btn-primary">Guardar cambios</button>
                                <button type="button" class="btn btn-outline-dark px-2" id="generarInforme">Generar Informe</button>
                                <button type="button" class="btn btn-outline-danger px-2" id="anularCita">Anular Cita</button>
                                <button type="button" class="btn btn-outline-success px-2" id="completarCita">Completar Cita</button>
                            </div>
                        </form>
                    `;

                            //*Funciones de los botones de la cita
                            //?Guardar los cambios en la cita
                            document.getElementById('formEditarCita').addEventListener('submit', function (e) {
                                e.preventDefault();

                                const id_cita = document.getElementById('id_cita').value;
                                const fecha = document.getElementById('fecha').value;
                                const motivo = document.getElementById('motivo').value;
                                const hora_inicio = document.getElementById('hora_inicio').value;
                                const hora_fin = document.getElementById('hora_fin').value;


                                //pasamos a la route que gaurda los cambios
                                fetch('/zona/trabajador/editar-cita', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        id_cita: id_cita,
                                        fecha: fecha,
                                        motivo: motivo,
                                        hora_inicio: hora_inicio,
                                        hora_fin: hora_fin
                                    })
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        //console.log('Cita actualizada:', data);
                                        return Swal.fire({ // Importante: devuelve la promesa de Swal.fire
                                            icon: 'success',
                                            title: 'Actualizada',
                                            text: 'La cita ha sido actualizada',
                                            timer: 2000,
                                            showConfirmButton: false
                                        });
                                    })
                                    .then(() => { // Este .then() se ejecutará después de que Swal.fire se cierre (la promesa se resuelva)
                                        window.location.reload(true); // Recargar la página
                                    })
                                    .catch(err => console.error('Error al guardar cambios:', err));
                            });

                            //anular cita
                            document.getElementById('anularCita').addEventListener('click', function () {
                                fetch(`/zona/trabajador/anular-cita/${cita.id_cita}`, {
                                    method: 'POST'
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        //console.log('Cita anulada:', data);
                                        return Swal.fire({
                                            icon: 'error',
                                            title: 'Anulada',
                                            text: 'La cita ha sido anulada',
                                            timer: 2000,
                                            showConfirmButton: false
                                        });
                                    })
                                    .then(() => {
                                        window.location.reload(true);
                                    })
                                    .catch(err => console.error('Error al anular cita:', err));
                            });

                            // marcar cita como completada
                            document.getElementById('completarCita').addEventListener('click', function () {
                                fetch(`/zona/trabajador/completar-cita/${cita.id_cita}`, {
                                    method: 'POST'
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        //console.log('Cita completada:', data);
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Completada',
                                            text: 'Cita marcada como completada',
                                            timer: 2000,
                                            showConfirmButton: false
                                        });
                                    })
                                    .catch(err => console.error('Error al completar cita:', err));
                            });

                            //Generar informe de la cita selecionada
                            document.getElementById('generarInforme').addEventListener('click', function () {
                                //creamos formularioa en el div de informes
                                let contenedorInforme = document.getElementById('contenedorInforme');
                                contenedorInforme.style.display = 'block';

                                const fechaFormateada = new Date(cita.fecha).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                }).split('/').reverse().join('-');

                                contenedorInforme.innerHTML = `
                        <h4>Informe de cita</h4>
                        <form class="container my-4" id="formCrearInforme" method="post">
                            <div class="row">
                                <div class="col">
                                    <label class="form-label"><strong>ID cita:</strong></label>
                                    <input type="text" class="form-control" name="id_cita" value="${cita.id_cita}" disabled readonly>
                                </div>
                                <div class="col">
                                    <label class="form-label"><strong>Id paciente:</strong></label>
                                    <input type="text" class="form-control" name="id_paciente" value="${paciente.id_paciente}" disabled readonly>
                                </div>
                            </div><br>
                    
                            <div class="row">
                                <div class="col">
                                    <label class="form-label"><strong>Paciente:</strong></label>
                                    <input type="text" class="form-control" name="paciente" value="${paciente.nombre} ${paciente.apellidos}" disabled readonly><br>
                                </div>
                                <div class="col">
                                    <label class="form-label"><strong>Motivo:</strong></label>
                                    <input type="text" class="form-control" name="motivo" value="${cita.motivo}" disabled readonly><br>
                                </div>
                            </div>
                    
                            <label class="form-label"><strong>Fecha de la cita:</strong></label>
                            <input type="date" class="form-control" name="fecha" id="fecha" value="${fechaFormateada}" disabled readonly><br>

                            <label class="form-label"><strong>Informe:</strong></label>
                            <textarea class="form-control" name="descripción" id="textarea" rows="5"></textarea>
                    

                            <div class="d-flex justify-content-between mt-2">
                                <button type="submit" id="guardarInforme" class="btn btn-primary">Guardar Informe</button>
                            </div>
                        </form>
                    `;

                                // Al guardar el informe pasamos la infromación por route
                                document.getElementById('formCrearInforme').addEventListener('submit', function (e) {
                                    e.preventDefault(); // Evita recargar la página

                                    const descripcion = document.getElementById('textarea').value;
                                    const fecha = document.getElementById('fecha').value;

                                    fetch(`/zona/trabajador/generar-informe/${paciente.id_paciente}/${cita.id_cita}`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            descripcion: descripcion,
                                            fecha: fecha
                                        })
                                    })
                                        .then(res => res.json())
                                        .then(data => {
                                            //console.log('Informe generado:', data);
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Informe creado',
                                                text: 'Informe guardado con exito',
                                                timer: 2000,
                                                showConfirmButton: false
                                            });
                                        })
                                        .catch(err => console.error('Error al guardar informe:', err));
                                });
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

//? Marcar descanso de vacaciones
document.addEventListener('DOMContentLoaded', function () {
    const celdasFestivo = document.querySelectorAll('.vacaciones');

    celdasFestivo.forEach(celda => {
        celda.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Vacaciones',
                text: 'Día solicitado como vacaciones',
                timer: 2500,
                showConfirmButton: false
            });
        });
    });
});

/* Función donde se escribe el motivo d ela cita solo una vez */
function escribirMotivoUnaVez(id, motivo) {
    if (idsEscritos.has(id)) return; // en caso de que ya este escrito

    const celda = document.querySelector(`[data-id='${id}']`);
    if (celda) {
        celda.textContent = motivo;
        idsEscritos.add(id);
    }
}