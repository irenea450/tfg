
//función pedir cita, donde se van a ir crenaod los inputs según las opcioens marcadas

const motivoSelect = document.getElementById("motivoSelect");
const contenedorOpciones = document.getElementById("generarInputs");

motivoSelect.addEventListener("change", async function () {
    const motivo = this.value;
    contenedorOpciones.innerHTML = "";

    if (motivo === "Revisión") {
        try {
            const trabajadores = await cargarTrabajadoresPorEspecialidad("doctor", "dentista");
            const selectHTML = renderizarSelectTrabajadores(trabajadores);
            const fechaHoraHTML = `<div id="fechaContenedor" class="mt-3"></div>`; // contenedor vacío al principio
            contenedorOpciones.innerHTML = selectHTML + fechaHoraHTML;
    
            // ✅ Ahora que el HTML ya está en el DOM, puedes capturar el select y agregar listener
            document.getElementById("trabajadorSeleccionado").addEventListener("change", async function () {
                const idTrabajador = this.value;
                const duracion = 20;
    
                try {
                    const disponibilidad = await obtenerDisponibilidad(idTrabajador, duracion);
                    const htmlDisponibilidad = renderizarFechaYHoraDisponibles(disponibilidad.fechas, disponibilidad.horas);
                    document.getElementById("fechaContenedor").innerHTML = htmlDisponibilidad;
                } catch (err) {
                    console.error("❌ Error al cargar disponibilidad", err);
                    document.getElementById("fechaContenedor").innerHTML = `<div class="alert alert-danger">Error al obtener fechas/horas</div>`;
                }
            });
    
        } catch (err) {
            console.error("❌ Error al cargar doctores", err);
            contenedorOpciones.innerHTML = `<div class="alert alert-danger">No se pudieron cargar los doctores</div>`;
        }
    } else if (motivo === "Limpieza") {
        contenedorOpciones.innerHTML = `
            <div class="row mt-2">
                <div class="col">
                    <label for="urgencia">¿Es urgente?</label>
                    <select class="form-select" name="urgencia">
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                    </select>
                </div>
            </div>
        `;
    }
});



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
                    <label for="trabajadorSeleccionado">Selecciona el profesional</label>
                    <select class="form-select" name="trabajadorSeleccionado" id="trabajadorSeleccionado">
                        ${opciones}
                    </select>
                </div>
            </div>
        `;
}

async function obtenerDisponibilidad(idTrabajador, duracionMinutos) {
    const response = await fetch(`/zona/paciente/disponibilidad?trabajador=${idTrabajador}&duracion=${duracionMinutos}`);
    if (!response.ok) throw new Error("Error al obtener disponibilidad");
    return await response.json(); // debería ser algo como { fechas: [...], horas: [...] }
}

function renderizarFechaYHoraDisponibles(fechasDisponibles, horasDisponibles) {
    const opcionesFecha = fechasDisponibles.map(f => `<option value="${f}">${f}</option>`).join('');
    const opcionesHora = horasDisponibles.map(h => `<option value="${h}">${h}</option>`).join('');

    return `
        <div class="row mt-3">
            <div class="col">
                <label for="fecha">Selecciona fecha</label>
                <select class="form-select" name="fecha" id="fecha">
                    ${opcionesFecha}
                </select>
            </div>
            <div class="col">
                <label for="hora">Selecciona hora</label>
                <select class="form-select" name="hora" id="hora">
                    ${opcionesHora}
                </select>
            </div>
        </div>
    `;
}


document.getElementById("trabajadorSeleccionado").addEventListener("change", async function () {
    const idTrabajador = this.value;
    const duracion = 20; // o la que corresponda al motivo

    try {
        const disponibilidad = await obtenerDisponibilidad(idTrabajador, duracion);
        const htmlDisponibilidad = renderizarFechaYHoraDisponibles(disponibilidad.fechas, disponibilidad.horas);
        document.getElementById("fechaContenedor").innerHTML = htmlDisponibilidad;
    } catch (err) {
        console.error("❌ Error al cargar disponibilidad", err);
        document.getElementById("fechaContenedor").innerHTML = `<div class="alert alert-danger">Error al obtener fechas/horas</div>`;
    }
});


