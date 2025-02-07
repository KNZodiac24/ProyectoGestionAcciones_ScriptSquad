// URL del backend de Django
const BACKEND_URL = "http://localhost:8000";

document.getElementById("frmCompra").addEventListener("submit", registrarCompra);
window.addEventListener("load", cargarAcciones);  // Cargar el historial cuando la página carga

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
            estilizarGanancias();  // Estilizar las ganancias/pérdidas
        } else {
            alert("Error al cargar el historial de acciones");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error en la conexión con el backend");
    }
}

const search = document.querySelector('.input_group input'),
    table_headings = document.querySelectorAll('#tblHistorial thead th');

// 1. Busqueda de valores especificos en la tabla
search.addEventListener('input', searchTable);

function searchTable() {
    const table_rows = document.querySelectorAll('#tblHistorial tbody tr')
    table_rows.forEach((row, i) => {
        let table_data = row.textContent.toLowerCase(),
            search_data = search.value.toLowerCase();

        row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
        row.style.setProperty('--delay', i / 25 + 's');
    })

    document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
        visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
    });
}

// 2. Ordenamiento | Ordenar la informacion de la tabla
table_headings.forEach((head, i) => {
    let sort_asc = true;
    head.onclick = () => {
        table_headings.forEach(head => head.classList.remove('active'));
        head.classList.add('active');

        document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
        head.classList.toggle('asc', sort_asc);
        sort_asc = head.classList.contains('asc') ? false : true;
        sortTable(i, sort_asc);
    }
})

function sortTable(column, sort_asc) {
    const table_rows = Array.from(document.querySelectorAll('#tblHistorial tbody tr')); // Obtener filas nuevamente
    const sorted_rows = table_rows.sort((a, b) => {
        let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase(),
            second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();

        const first_value = isNaN(first_row) ? first_row : parseFloat(first_row);
        const second_value = isNaN(second_row) ? second_row : parseFloat(second_row);

        return sort_asc
            ? first_value > second_value ? 1 : -1
            : first_value < second_value ? 1 : -1;
    });

    const tbody = document.querySelector('#tblHistorial tbody');
    tbody.innerHTML = '';
    sorted_rows.forEach(row => tbody.appendChild(row));
}

// 3. Función para estilizar valores de ganancia(verde)/pérdida(rojo)
function estilizarGanancias() {
    const rows = document.querySelectorAll('#tblHistorial tbody tr');

    rows.forEach(row => {
        const gananciaCelda = row.querySelector('td:nth-child(7)'); // Índice de columna de ganancia/pérdida
        const valorGanancia = parseFloat(gananciaCelda.textContent);

        // Aplicar colores según el valor
        if (!isNaN(valorGanancia)) {
            gananciaCelda.classList.remove('ganancia', 'perdida');
            if (valorGanancia < 0) {
                gananciaCelda.classList.add('perdida');
            } else if (valorGanancia > 0) {
                gananciaCelda.classList.add('ganancia');
            }
        }
    });
}

async function renderizarGrafico() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/resumen-acciones/`);
        const data = await response.json();

        const nombres = data.map(accion => accion.nombre_accion);
        const cantidades = data.map(accion => accion.cantidad_total);
        const valores = data.map(accion => accion.precio_total_usd);
        const costos = data.map(accion => accion.precio_costo);
        const ganancias = data.map(accion => accion.total_ganancia);
        const porcentajes = data.map(accion => accion.porcentaje_ganancia);

        const options = {
            chart: {
                type: 'bar'
            },
            series: [
                {
                    name: 'Ganancia Total (USD)',
                    data: ganancias
                }],
            xaxis: {
                categories: nombres
            },
            yaxis: {
                title: {
                    text: 'Ganancia Total (USD)'
                },
                labels: {
                    formatter: function (y) {
                        return y.toFixed(0);
                    }
                }
            },
            plotOptions: {
                bar: {
                    colors: {
                        ranges: [{
                            from: -100000,
                            to: 0,
                            color: '#ec210b'
                        }, {
                            from: 0,
                            to: 100000,
                            color: '#38cf77'
                        }]
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            tooltip: {
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    // Construir el contenido del tooltip
                    const nombre = nombres[dataPointIndex];
                    const cantidad = cantidades[dataPointIndex];
                    const valor = valores[dataPointIndex];
                    const costo = costos[dataPointIndex];
                    const ganancia = ganancias[dataPointIndex];
                    const porcentaje = porcentajes[dataPointIndex];

                    return `
                        <div style="margin:0;">
                            <div style="background-color:rgba(165, 165, 165, 0.55); padding: 5px;">
                                <strong>${nombre}</strong><br>
                            </div>
                            <div style="padding: 5px;">
                                <ul>
                                    <li>Cantidad Total: <strong>${cantidad}</strong></li>
                                    <li>Valor: <strong>$${valor.toFixed(2)}</strong></li>
                                    <li>Precio de Costo: <strong>$${costo.toFixed(2)}</strong></li>
                                    <li>Ganancia/Pérdida: <strong>${porcentaje.toFixed(2)}%</strong></li>
                                    <li>Ganancia/Pérdida: <strong>$${ganancia.toFixed(2)}</strong></li>
                                </ul>
                            </div>
                        </div>
                    `;
                }
            }
        };
        const chart = new ApexCharts(document.querySelector("#resumen"), options);
        chart.render();
    } catch (error) {
        console.error("Error en la solicitud de datos para el grafico:", error);
    }
}

renderizarGrafico();
