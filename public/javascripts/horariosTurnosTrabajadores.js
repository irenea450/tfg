// trabajador-config.js

document.addEventListener('DOMContentLoaded', () => {

    // Vacaciones
    let vacacionesVisibles = false;
    const botonVacaciones = document.getElementById('verVacaciones');
    const contenedorVacaciones = document.getElementById('contenedorVacaciones');

    if (botonVacaciones) {
        botonVacaciones.addEventListener('click', async () => {
            contenedorVacaciones.className = "container my-1 px-5 rounded";

            if (!vacacionesVisibles) {
                try {
                    const response = await fetch('/zona/trabajador/vacaciones/obtenerVacaciones');
                    const vacaciones = await response.json();

                    if (Array.isArray(vacaciones) && vacaciones.length > 0) {
                        vacaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                        const lista = vacaciones.map(v => {
                            const fecha = new Date(v.fecha);
                            const fechaFormateada = !isNaN(fecha) ? fecha.toLocaleDateString() : 'Fecha inválida';

                            return `
                                <li class="d-flex justify-content-between align-items-center my-1 ps-2 rounded" style="background-color: #ededed;">
                                    <span>${fechaFormateada}</span>
                                    <form method="POST" action="/zona/trabajador/vacaciones/eliminar" class="m-0">
                                        <input type="hidden" name="idVacacion" value="${v.id_vacaciones}">
                                        <button type="submit" class="btn btn-danger btn-sm">Eliminar día</button>
                                    </form>
                                </li>`;
                        }).join('');

                        contenedorVacaciones.innerHTML = `<ul class="list-group">${lista}</ul>`;
                    } else {
                        contenedorVacaciones.innerHTML = `<p class="fw-bold" >No tienes vacaciones solicitadas.</p>`;
                    }
                } catch (error) {
                    contenedorVacaciones.innerHTML = `<p style="color: red;">Error al cargar las vacaciones.</p>`;
                }

                vacacionesVisibles = true;
            } else {
                contenedorVacaciones.innerHTML = '';
                vacacionesVisibles = false;
            }
        });
    }

    // Horarios
    let horariosVisibles = false;
    const botonHorarios = document.getElementById('verHorarios');
    const contenedorHorarios = document.getElementById('contenedorHorarios');

    if (botonHorarios) {
        botonHorarios.addEventListener('click', async () => {
            contenedorHorarios.className = "d-flex justify-content-between align-items-center my-1 ps-2 px-5  rounded";
            contenedorHorarios.style.backgroundColor="#ededed";
            if (!horariosVisibles) {
                try {
                    const response = await fetch('/zona/trabajador/obtener-horario-trabajo');
                    const horarios = await response.json();

                    if (Array.isArray(horarios) && horarios.length > 0) {

                    //orden que quiero que siga
                    const ordenDias = {
                        'lunes': 1,
                        'martes': 2,
                        'miércoles': 3,
                        'miercoles': 3, // por si acaso sin tilde
                        'jueves': 4,
                        'viernes': 5
                    };

                    // ordenamos
                    horarios.sort((a, b) => {
                        const ordenA = ordenDias[a.dia.toLowerCase()];
                        const ordenB = ordenDias[b.dia.toLowerCase()];
                        return ordenA - ordenB;
                    });

                        const listaHorarios = horarios.map(horario => {
                            return `
                            <form action="/zona/trabajador/actualizar-horario-trabajo" method="POST" class="mb-2">
                                <div class="row align-items-center g-3">

                                    <!-- Campo oculto con el id del horario de ese turno-->
                                    <input type="hidden" name="id_horarios" value="${horario.id_horarios}">

                                    <div class="col-auto">
                                        <label>Día:</label>
                                    </div>
                                    <div class="col-auto">
                                        <input type="text" class="form-control" name="dia" value="${horario.dia}" readonly>
                                    </div>
                                    <div class="col-auto">
                                        <label>Entrada:</label>
                                    </div>
                                    <div class="col-auto">
                                        <input type="time" class="form-control" name="hora_inicio" value="${horario.hora_inicio}">
                                    </div>
                                    <div class="col-auto">
                                        <label>Salida:</label>
                                    </div>
                                    <div class="col-auto">
                                        <input type="time" class="form-control" name="hora_fin" value="${horario.hora_fin}">
                                    </div>
                                    <div class="col-auto">
                                        <button type="submit" class="btn btn-success">Guardar</button>
                                    </div>
                                    <div class="col-auto">
                                        <button type="button" class="btn btn-danger btn-eliminar">Eliminar</button>
                                    </div>
                                </div>
                            </form>
                        `;
                        
                        }).join('');

                        contenedorHorarios.innerHTML = `
                            <ul class="list-group m-2 rounded" style="background-color: #ededed;">
                                ${listaHorarios}
                            </ul>
                        `;

                        contenedorHorarios.style.display = "block";
                        /* ---------------------- Confrimar eliminar el horario --------------------- */
                        document.querySelectorAll('.btn-eliminar').forEach(boton => {
                            boton.addEventListener('click', function () {
                                const form = this.closest('form');

                                Swal.fire({
                                    title: '¿Estás seguro?',
                                    text: "Esta acción eliminará el horario permanentemente.",
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'Sí, eliminar',
                                    cancelButtonText: 'Cancelar'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        if (result.isConfirmed) {
                                            // Aquí cambiamos la acción del formulario
                                            form.action = '/zona/trabajador/eliminar-horario-trabajo';
                                            form.submit();
                                        }
                                    }
                                });
                            });
                        });
                    } else {
                        contenedorHorarios.innerHTML = `<p class="fw-bold" >No tienes horarios registrados.</p>`;
                        contenedorHorarios.style.display = "block";
                    }
                } catch (error) {
                    contenedorHorarios.innerHTML = `<p style="color: red;">Error al cargar los horarios.</p>`;
                    contenedorHorarios.style.display = "block";
                }

                horariosVisibles = true;
            } else {
                contenedorHorarios.style.display = "none";
                contenedorHorarios.innerHTML = "";
                horariosVisibles = false;
            }
        });
    }

});


/* Festivos */
document.addEventListener('DOMContentLoaded', () => {

    // Festivos
    let festivosVisibles = false;
    const botonFestivos = document.getElementById('verFestivos');
    const contenedorFestivos = document.getElementById('contenedorFestivos');

    if (botonFestivos) {
        botonFestivos.addEventListener('click', async () => {
            contenedorFestivos.className = "container my-1 px-5";

            if (!festivosVisibles) {
                try {
                    const response = await fetch('/zona/trabajador/festivos/obtenerFestivos');
                    const festivos = await response.json();

                    if (Array.isArray(festivos) && festivos.length > 0) {
                        festivos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                        const lista = festivos.map(f => {
                            const fecha = new Date(f.fecha);
                            const fechaFormateada = !isNaN(fecha) ? fecha.toLocaleDateString() : 'Fecha inválida';

                            return `
                                <li class="list-group-item d-flex justify-content-between align-items-center my-2 rounded" style="background-color: #ededed;">
                                    <div class="d-flex flex-row align-items-center w-100 justify-content-between gap-3">
                                        <strong class="mb-0">${fechaFormateada}</strong>

                                        <p class="mb-0 flex-grow-1" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                            ${f.descripcion}
                                        </p>

                                        <form method="POST" action="/zona/trabajador/festivos/eliminar" class="d-flex align-items-center m-0">
                                            <input type="hidden" name="idFestivos" value="${f.id}">
                                            <button type="submit" class="btn btn-danger btn-sm">Eliminar día</button>
                                        </form>
                                    </div>
                                </li>
                            `;
                        }).join('');

                        contenedorFestivos.innerHTML = `<ul class="list-group">${lista}</ul>`;
                    } else {
                        contenedorFestivos.innerHTML = `<p class="fw-bold">No tienes festivos solicitados.</p>`;
                    }
                } catch (error) {
                    contenedorFestivos.innerHTML = `<p style="color: red;">Error al cargar los festivos.</p>`;
                }

                festivosVisibles = true;
            } else {
                contenedorFestivos.innerHTML = '';
                festivosVisibles = false;
            }
        });
    }

})
