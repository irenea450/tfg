// pedirCita.js


// Modificar la función que maneja el cambio de motivo
motivoSelect.addEventListener("change", async function() {
    const motivo = this.value;
    generarInputs.innerHTML = "";
    
    let duracion = 20; // Valor por defecto
    
    switch(motivo) {
        case "Revisión":
            duracion = 20;
            await cargarOpcionesRevision(duracion);
            break;
        case "Primera Cita":
            duracion = 30;
            await cargarOpcionesRevision(duracion); //es un tipo de revisión, peor la ser la primera se necesita más tiempo
            break;
        case "Limpieza":
            duracion = 30;
            cargarOpcionesLimpieza(duracion);
            break;
        case "Radiografia":
            duracion = 15;
            await cargarOpcionesRadiografia(duracion);
            break;
        case "Ortodoncia":
            duracion = 60;
            await cargarOpcionesOrtodoncia(duracion);
            break;
    }
    
    // Actualizar duración en el formulario
    document.getElementById('duracionInput').value = duracion;
});


/* ------------ funciones de las diferentes opciones de la cita ------------ */
//? Reviisiones y priemera consulta
async function cargarOpcionesRevision(duracion) {
    try {
        const trabajadores = await cargarTrabajadoresPorEspecialidad("doctor", "dentista");
        const selectHTML = renderizarSelectTrabajadores(trabajadores);
        const fechaHoraHTML = `<div id="fechaContenedor" class="mt-3"></div>`;
        document.getElementById("generarInputs").innerHTML = selectHTML + fechaHoraHTML;

        document.getElementById("trabajadorSeleccionado").addEventListener("change", async function() {
            await cargarDisponibilidad(this.value, duracion);
        });
    } catch (err) {
        mostrarError("No se pudieron cargar los doctores");
    }
}

//? Limpiezas
async function cargarOpcionesLimpieza(duracion) {
    try {
        const trabajadores = await cargarTrabajadoresPorEspecialidad("higienista", "limpieza");
        const selectHTML = renderizarSelectTrabajadores(trabajadores);
        const fechaHoraHTML = `<div id="fechaContenedor" class="mt-3"></div>`;
        document.getElementById("generarInputs").innerHTML = selectHTML + fechaHoraHTML;

        document.getElementById("trabajadorSeleccionado").addEventListener("change", async function() {
            await cargarDisponibilidad(this.value, duracion);
        });
    } catch (err) {
        mostrarError("No se pudieron cargar los higienistras para la limpieza");
    }
}

//? Radiografías
async function cargarOpcionesRadiografia(duracion) {
    try {
        const trabajadores = await cargarTrabajadoresPorEspecialidad("higienista", "radiografía");
        const selectHTML = renderizarSelectTrabajadores(trabajadores);
        const fechaHoraHTML = `<div id="fechaContenedor" class="mt-3"></div>`;
        document.getElementById("generarInputs").innerHTML = selectHTML + fechaHoraHTML;

        document.getElementById("trabajadorSeleccionado").addEventListener("change", async function() {
            await cargarDisponibilidad(this.value, duracion);
        });
    } catch (err) {
        mostrarError("No se pudieron cargar los higienistras para realizar la radiografía");
    }
}


//? Ortodoncias
/* async function cargarOpcionesOrtodoncia(duracion) {
    try {
        // Cargar doctores y auxiliares
        const doctores = await cargarTrabajadoresPorEspecialidad("doctor", "dentista");
        const auxiliares = await cargarTrabajadoresPorEspecialidad("auxiliar");

        if (auxiliares.length === 0) {
            throw new Error("No hay auxiliares disponibles para ortodoncia");
        }

        // Seleccionar el primer auxiliar disponible (puedes implementar lógica más compleja)
        const auxiliarSeleccionado = auxiliares[0].id_trabajador;
        
        // Crear campo oculto solo con el ID del auxiliar
        const auxiliarInput = `<input type="hidden" name="id_auxiliar" value="${auxiliarSeleccionado}">`;
        
        const selectHTML = renderizarSelectTrabajadores(doctores) + auxiliarInput;
        const fechaHoraHTML = `<div id="fechaContenedor" class="mt-3"></div>`;
        document.getElementById("generarInputs").innerHTML = selectHTML + fechaHoraHTML;

        document.getElementById("trabajadorSeleccionado").addEventListener("change", async function() {
            await cargarDisponibilidad(this.value, duracion);
        });
        
    } catch (err) {
        mostrarError("No se pudieron cargar los profesionales para ortodoncia: " + err.message);
    }
} */





/* -------------------------------------------------------------------------- */
/*                       Disponiblididad y renderización                      */
/* -------------------------------------------------------------------------- */
async function cargarDisponibilidad(idTrabajador, duracion) {
    try {
        // Cargar días disponibles
        const dias = await obtenerDiasDisponibles(idTrabajador, duracion);
        
        if (dias.length === 0) {
            document.getElementById("fechaContenedor").innerHTML = `
                <div class="alert alert-warning">
                    No hay días disponibles para este profesional en las próximas 2 semanas
                </div>
            `;
            return;
        }
        
        renderizarDiasDisponibles(dias, idTrabajador, duracion);
    } catch (err) {
        document.getElementById("fechaContenedor").innerHTML = `
            <div class="alert alert-danger">${err.message}</div>
        `;
        console.error("Error al cargar disponibilidad:", err);
    }
}

/* ------------------------- cargar días disponibles ------------------------ */
async function obtenerDiasDisponibles(idTrabajador, duracion) {
    const response = await fetch(`/zona/paciente/disponibilidad/dias?trabajador=${idTrabajador}&duracion=${duracion}`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al cargar días disponibles");
    }
    return await response.json();
}


//mostramos en el ejs loas dias disponibles para esa cita
function renderizarDiasDisponibles(dias, idTrabajador, duracion) {
    // Actualizar el campo hidden de duración
    document.getElementById('duracionInput').value = duracion;
    
    document.getElementById("fechaContenedor").innerHTML = `
        <div class="row mt-3">
            <div class="col-md-6">
                <label for="fechaDisponible" class="form-label">Seleccione un día</label>
                <select class="form-select" name="fecha_cita" id="fechaDisponible" required>
                    <option value="" selected disabled>Seleccione un día</option>
                    ${dias.map(dia => `
                        <option value="${dia.fecha}">
                            ${formatearFecha(dia.fecha)} (${dia.hora_inicio.slice(0,5)} a ${dia.hora_fin.slice(0,5)})
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="col-md-6" id="horasContainer"></div>
        </div>
    `;
    
    document.getElementById("fechaDisponible").addEventListener("change", async function() {
        await cargarHorasDisponibles(idTrabajador, this.value, duracion);
    });
}

/* ---------------------------- Horas disponibles --------------------------- */
/* async function cargarHorasDisponibles(idTrabajador, fecha, duracion) {
    const horasContainer = document.getElementById("horasContainer");
    horasContainer.innerHTML = '<div class="text-center my-2"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const response = await fetch(`/zona/paciente/disponibilidad/horas?trabajador=${idTrabajador}&fecha=${fecha}&duracion=${duracion}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al cargar horas disponibles");
        }
        
        const horas = await response.json();
        
        if (horas.length === 0) {
            horasContainer.innerHTML = '<div class="alert alert-warning">No hay horas disponibles para este día</div>';
            return;
        }
        
        horasContainer.innerHTML = `
            <label for="horaDisponible" class="form-label">Horas disponibles</label>
            <select class="form-select" name="hora_cita" id="horaDisponible" required>
                <option value="" selected disabled>Seleccione una hora</option>
                ${horas.map(hora => `
                    <option value="${hora.hora}">${hora.hora}</option>
                `).join('')}
            </select>
        `;
    } catch (err) {
        horasContainer.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        console.error("Error al cargar horas:", err);
    }
} */

function formatearFecha(fechaStr) {
    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
}

function mostrarError(mensaje) {
    document.getElementById("generarInputs").innerHTML = `
        <div class="alert alert-danger">${mensaje}</div>
    `;
}



/* --------------------------- Cragar trabajadores -------------------------- */
async function cargarTrabajadoresPorEspecialidad(keyword1, keyword2) {
    const response = await fetch(`/zona/paciente/buscar-trabajadores?keyword1=${keyword1}&keyword2=${keyword2}`);
    if (!response.ok) throw new Error("No se pudieron cargar los trabajadores");
    return await response.json();
}

function renderizarSelectTrabajadores(trabajadores) {
    const opciones = trabajadores.map(t => `
        <option value="${t.id_trabajador}">
            ${t.nombre} ${t.apellidos} (${t.especialidad})
        </option>
    `).join('');

    return `
        <div class="row mt-2">
            <div class="col">
                <label for="trabajadorSeleccionado">Seleccione el profesional</label>
                <select class="form-select" name="id_trabajador" id="trabajadorSeleccionado" required>
                    <option value="" selected disabled>Seleccione un profesional</option>
                    ${opciones}
                </select>
            </div>
        </div>
    `;
}


/* -------------------------------------------------------------------------- */
/*                              Enviar formulario                             */
/* -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPedirCita');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que recargue la página

        const formData = new FormData(form);
        const datos = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/zona/paciente/pedirCitaPaciente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                const resultado = await response.json();

                // Mostrar SweetAlert
                Swal.fire({
                    icon: 'success',
                    title: '¡Cita solicitada!',
                    text: resultado.mensaje,
                    showConfirmButton: false,
                    timer: 2000
                }).then(() => {
                    window.location.href = "/zona/paciente/citas";
                });
            } else {
                const error = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error al pedir cita',
                    text: error
                });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'Intenta de nuevo más tarde'
            });
            console.error('Error al enviar formulario:', error);
        }
    });
});



async function cargarOpcionesOrtodoncia(duracion) {
    try {
        const doctores = await cargarTrabajadoresPorEspecialidad("doctor", "dentista");
        const auxiliares = await cargarTrabajadoresPorEspecialidad("auxiliar");

        if (auxiliares.length === 0) {
            throw new Error("No hay auxiliares disponibles para ortodoncia");
        }

        const auxiliarSeleccionado = auxiliares[0].id_trabajador;
        window.idAuxiliarSeleccionado = auxiliarSeleccionado;

        // 1. Obtener disponibilidad del auxiliar
        const disponibilidadAuxiliar = await obtenerDiasDisponibles(auxiliarSeleccionado, duracion);

        if (disponibilidadAuxiliar.length === 0) {
            throw new Error("No hay horarios disponibles para el auxiliar en las próximas semanas.");
        }

        // 2. Mostrar selector de doctor + campo oculto del auxiliar
        const selectHTML = renderizarSelectTrabajadores(doctores) +
            `<input type="hidden" name="id_auxiliar" value="${auxiliarSeleccionado}">`;
        const fechaHoraHTML = `<div id="fechaContenedor" class="mt-3"></div>`;
        document.getElementById("generarInputs").innerHTML = selectHTML + fechaHoraHTML;

        // 3. Al seleccionar doctor, cruzar horarios
        document.getElementById("trabajadorSeleccionado").addEventListener("change", async function () {
            const doctorId = this.value;

            const disponibilidadDoctor = await obtenerDiasDisponibles(doctorId, duracion);

            // 4. Filtrar coincidencias
            const diasCoincidentes = disponibilidadDoctor.filter(diaDoc => {
                return disponibilidadAuxiliar.some(diaAux => diaAux.fecha === diaDoc.fecha);
            });

            if (diasCoincidentes.length === 0) {
                document.getElementById("fechaContenedor").innerHTML = `
                    <div class="alert alert-warning">
                        No hay días comunes entre doctor y auxiliar para este tratamiento.
                    </div>`;
                return;
            }

            // 5. Mostrar solo días comunes
            renderizarDiasDisponibles(diasCoincidentes, doctorId, duracion);

            // Guardar la disponibilidad del auxiliar en una variable global o contexto si necesitas usarla después para cruzar las horas también
            // window.disponibilidadAuxiliar = disponibilidadAuxiliar;
        });

    } catch (err) {
        mostrarError("Error al cargar opciones de ortodoncia: " + err.message);
    }
}


async function cargarHorasDisponibles(idDoctor, fecha, duracion) {
    const horasContainer = document.getElementById("horasContainer");
    horasContainer.innerHTML = '<div class="text-center my-2"><div class="spinner-border text-primary" role="status"></div></div>';

    try {
        // Pedimos horas del doctor
        const responseDoc = await fetch(`/zona/paciente/disponibilidad/horas?trabajador=${idDoctor}&fecha=${fecha}&duracion=${duracion}`);
        if (!responseDoc.ok) throw new Error("Error al cargar horas del doctor");
        const horasDoc = await responseDoc.json();

        // Si es cita de ortodoncia, cruzamos con auxiliar
        if (window.idAuxiliarSeleccionado) {
            const responseAux = await fetch(`/zona/paciente/disponibilidad/horas?trabajador=${window.idAuxiliarSeleccionado}&fecha=${fecha}&duracion=${duracion}`);
            if (!responseAux.ok) throw new Error("Error al cargar horas del auxiliar");
            const horasAux = await responseAux.json();

            // Filtrar solo las horas comunes
            const horasAuxSolo = horasAux.map(h => h.hora);
            const horaMinAux = horasAuxSolo[0];
            const horaMaxAux = horasAuxSolo[horasAuxSolo.length - 1];

            const horasComunes = horasDoc.filter(h =>
                horasAuxSolo.includes(h.hora) &&
                h.hora >= horaMinAux &&
                h.hora <= horaMaxAux
            );

            if (horasComunes.length === 0) {
                horasContainer.innerHTML = '<div class="alert alert-warning">No hay horas comunes entre doctor y auxiliar en este día</div>';
                return;
            }

            renderizarSelectHoras(horasComunes);
        } else {
            // Si no es ortodoncia, mostramos horas del doctor directamente
            if (horasDoc.length === 0) {
                horasContainer.innerHTML = '<div class="alert alert-warning">No hay horas disponibles para este día</div>';
                return;
            }

            renderizarSelectHoras(horasDoc);
        }
    } catch (err) {
        horasContainer.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        console.error("Error al cargar horas:", err);
    }
}


function renderizarSelectHoras(horas) {
    const horasContainer = document.getElementById("horasContainer");

    horasContainer.innerHTML = `
        <label for="horaDisponible" class="form-label">Horas disponibles</label>
        <select class="form-select" name="hora_cita" id="horaDisponible" required>
            <option value="" selected disabled>Seleccione una hora</option>
            ${horas.map(hora => `<option value="${hora.hora}">${hora.hora}</option>`).join('')}
        </select>
    `;
}

