document.addEventListener('DOMContentLoaded', function() {
    const campoBusqueda = document.getElementById('buscadorInput');
    
    campoBusqueda.addEventListener('input', function() {
        const textoBusqueda = this.value.trim().toLowerCase();
        const pacientes = document.querySelectorAll('.paciente-item');
        
        pacientes.forEach(paciente => {
            const dni = paciente.dataset.dni || '';
            const nombre = paciente.dataset.nombre || '';
            const apellidos = paciente.dataset.apellidos || '';
            
            const coincide = textoBusqueda === '' || 
                            dni.includes(textoBusqueda) || 
                            nombre.includes(textoBusqueda) || 
                            apellidos.includes(textoBusqueda);
            
            paciente.style.display = coincide ? 'block' : 'none';
        });
    });
    
});



/* -------------------------------------------------------------------------- */
/*                          Crear cita en trabajadores                         */
/* -------------------------------------------------------------------------- */

//?Crear inputs de los trabaajdores exixstentes para agregarlos a la cita
document.addEventListener('DOMContentLoaded', () => {
    fetch('/zona/trabajador/buscar-trabajadores')
        .then(response => {
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return response.json();
        })
        .then(trabajadores => {
            const select = document.getElementById('selectTrabajadores');
            
            // Configurar el select para enviar null cuando no hay selección
            select.innerHTML = '';
            select.required = false; // Si no quieres que sea obligatorio
            
            // Añadir opción por defecto con valor null
            const defaultOption = new Option('Seleccionar trabajador extra', 'null', true, true);
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.add(defaultOption);
            
            // Añadir trabajadores
            if (Array.isArray(trabajadores) && trabajadores.length > 0) {
                trabajadores.forEach(t => {
                    if (t.id_trabajador && t.nombre && t.apellidos && t.especialidad) {
                        const option = new Option(
                            `${t.nombre} ${t.apellidos} (${t.especialidad})`, 
                            t.id_trabajador
                        );
                        select.add(option);
                    }
                });
            } else {
                const noDataOption = new Option('No hay trabajadores disponibles', 'null', false, false);
                noDataOption.disabled = true;
                select.add(noDataOption);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            const select = document.getElementById('selectTrabajadores');
            select.innerHTML = '';
            const errorOption = new Option('Error al cargar datos', 'null', false, false);
            errorOption.disabled = true;
            select.add(errorOption);
        });
});




document.addEventListener('DOMContentLoaded', () => {
    fetch('/zona/trabajador/buscar-trabajadores')
        .then(response => {
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return response.json();
        })
        .then(trabajadores => {
            const select = document.getElementById('selectTrabajadores');
            
            // Configurar el select para enviar null cuando no hay selección
            select.innerHTML = '';
            select.required = false; // Si no quieres que sea obligatorio
            
            // Añadir opción por defecto con valor null
            const defaultOption = new Option('Seleccionar trabajador extra', 'null', true, true);
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.add(defaultOption);
            
            // Añadir trabajadores
            if (Array.isArray(trabajadores) && trabajadores.length > 0) {
                trabajadores.forEach(t => {
                    if (t.id_trabajador && t.nombre && t.apellidos && t.especialidad) {
                        const option = new Option(
                            `${t.nombre} ${t.apellidos} (${t.especialidad})`, 
                            t.id_trabajador
                        );
                        select.add(option);
                    }
                });
            } else {
                const noDataOption = new Option('No hay trabajadores disponibles', 'null', false, false);
                noDataOption.disabled = true;
                select.add(noDataOption);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            const select = document.getElementById('selectTrabajadores');
            select.innerHTML = '';
            const errorOption = new Option('Error al cargar datos', 'null', false, false);
            errorOption.disabled = true;
            select.add(errorOption);
        });
});