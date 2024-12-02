// URL del backend de Django
const BACKEND_URL = "http://localhost:8000";

// Función para registrar una nueva compra de acción
async function registrarCompra(event) {
    event.preventDefault();

    const fecha_compra = document.getElementById("fecha_compra").value;
    const nombre_accion = document.getElementById("nombre_accion").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const precio_unitario = parseFloat(document.getElementById("precio_unitario").value);

    const data = {
        fecha_compra,
        nombre_accion,
        cantidad,
        precio_unitario
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/gestionAcciones/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Compra registrada exitosamente");
            cargarAcciones();  // Recargar el historial
        } else {
            alert("Error al registrar la compra");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error en la conexión con el backend");
    }
}

// Función para cargar el historial de acciones
async function cargarAcciones() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/gestionAcciones/`);

        if (response.ok) {
            const acciones = await response.json();
            const tbody = document.querySelector("#tblHistorial tbody");
            tbody.innerHTML = ""; // Limpiar la tabla antes de cargar nuevos datos

            acciones.forEach(accion => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${accion.fecha_compra}</td>
                    <td>${accion.nombre_accion}</td>
                    <td>${accion.cantidad}</td>
                    <td>${accion.precio_unitario.toFixed(2)}</td>
                    <td>${accion.precio_total.toFixed(2)}</td>
                    <td>${accion.porcentaje_ganancia.toFixed(2)}%</td>
                    <td>${accion.total_ganancia.toFixed(2)}</td>
                `;

                tbody.appendChild(row);
            });
        } else {
            alert("Error al cargar el historial de acciones");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error en la conexión con el backend");
    }
}

// Event listeners
document.getElementById("frmCompra").addEventListener("submit", registrarCompra);
window.addEventListener("load", cargarAcciones);  // Cargar el historial cuando la página carga
