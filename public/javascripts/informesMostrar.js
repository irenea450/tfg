

//! No se usa

/* 
document.addEventListener('DOMContentLoaded', async () => {
    const contenedorInformes = document.getElementById('contenedorInformes');

    try {
        const response = await fetch('/zona/paciente/obtener-informes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const resultado = await response.json();
            
            // Ordenar informes por fecha (de más reciente a más antigua)
            const informesOrdenados = resultado.informes.sort((a, b) => {
                return new Date(b.fecha) - new Date(a.fecha);
            });
            
            // Crear el acordeón
            const accordion = document.createElement('div');
            accordion.className = 'accordion accordion-flush';
            accordion.id = 'accordionInformes';
            
            // Generar cada item del acordeón
            informesOrdenados.forEach((informe, index) => {
                const fecha = new Date(informe.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                const accordionItem = document.createElement('div');
                accordionItem.className = 'accordion-item';
                
                // Cabecera del acordeón
                const accordionHeader = document.createElement('h2');
                accordionHeader.className = 'accordion-header';
                
                const accordionButton = document.createElement('button');
                accordionButton.className = 'accordion-button collapsed';
                accordionButton.type = 'button';
                accordionButton.setAttribute('data-bs-toggle', 'collapse');
                accordionButton.setAttribute('data-bs-target', `#flush-collapse${index}`);
                accordionButton.setAttribute('aria-expanded', 'false');
                accordionButton.setAttribute('aria-controls', `flush-collapse${index}`);
                accordionButton.textContent = `Informe del ${fecha} - ${informe.titulo || 'Sin título'}`;
                
                accordionHeader.appendChild(accordionButton);
                
                // Cuerpo del acordeón
                const accordionCollapse = document.createElement('div');
                accordionCollapse.id = `flush-collapse${index}`;
                accordionCollapse.className = 'accordion-collapse collapse';
                accordionCollapse.setAttribute('data-bs-parent', '#accordionInformes');
                
                const accordionBody = document.createElement('div');
                accordionBody.className = 'accordion-body';
                accordionBody.innerHTML = `
                    <p><strong>Médico:</strong> ${informe.medico_nombre || 'No especificado'}</p>
                    <p><strong>Contenido:</strong></p>
                    <p>${informe.contenido || 'No hay contenido disponible'}</p>
                `;
                
                accordionCollapse.appendChild(accordionBody);
                
                // Ensamblar el item
                accordionItem.appendChild(accordionHeader);
                accordionItem.appendChild(accordionCollapse);
                
                // Agregar al acordeón
                accordion.appendChild(accordionItem);
            });
            
            // Limpiar y agregar el acordeón al contenedor
            contenedorInformes.innerHTML = '';
            contenedorInformes.appendChild(accordion);
            
        } else {
            const error = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Error no se han podido encontrar los informes',
                text: error
            });
        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error del servidor',
            text: 'Intenta de nuevo más tarde'
        });
        console.error('Error al solicitar los informes:', error);
    }
}); */