function abrirMenuAdmin() {
    const textoHistoria = document.getElementById("texto-historia");
    const contenedorBotones = document.querySelector(".opciones-container");
    const botonMochila = document.getElementById("btn-mochila-fijo");
    const botonStats = document.getElementById("btn-stats-fijo");
    const pantallaInv = document.getElementById("pantalla-inventario");

    // Ocultar la interfaz normal
    textoHistoria.style.display = "none";
    contenedorBotones.style.display = "none";
    if (botonMochila) botonMochila.style.display = "none";
    if (botonStats) botonStats.style.display = "none";

    // Mostrar el contenedor reutilizando la pantalla central
    pantallaInv.classList.remove("oculto");
    pantallaInv.innerHTML = `<h2 style='color: #38bdf8; margin-bottom: 10px;'>🛠️ MENÚ DE ADMIN</h2>`;

    let htmlAdmin = `<div style="max-height: 250px; overflow-y: auto; text-align: left; width: 90%; margin: 0 auto; display: flex; flex-direction: column; gap: 10px;">`;

    // --- SECCIÓN 1: DAR ÍTEMS AUTOMÁTICAMENTE ---
    htmlAdmin += `<h3 style='color: #f3e5ab; font-size: 13px; margin: 5px 0;'>Dar Ítems Registrados:</h3>`;
    for (let id in window.dbItems) {
        let item = window.dbItems[id];
        htmlAdmin += `
            <div class="slot-objeto" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px;">
                <span style="font-size: 12px;">${item.nombre}</span>
                <button onclick="ganarItem('${id}', 1); mostrarAviso('¡Obtenido ${item.nombre}!');" class="boton-opcion" style="padding: 2px 8px; font-size: 11px;">Dar +1</button>
            </div>
        `;
    }

    // --- SECCIÓN 2: VIAJAR A ESCENAS ---
    htmlAdmin += `<h3 style='color: #f3e5ab; font-size: 13px; margin: 10px 0 5px 0;'>Teletransporte de Escenas:</h3>`;
    for (let nombreEscena in window.escenas) {
        htmlAdmin += `
            <div class="slot-objeto" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px;">
                <span style="font-size: 12px; text-transform: uppercase;">${nombreEscena}</span>
                <button onclick="cerrarMenuAdmin(); cargarEscena('${nombreEscena}');" class="boton-opcion" style="padding: 2px 8px; font-size: 11px; background: #0284c7;">Ir</button>
            </div>
        `;
    }

    // --- SECCIÓN 3: PROBAR COMBATES ---
    htmlAdmin += `<h3 style='color: #ef4444; font-size: 13px; margin: 10px 0 5px 0;'>Forzar Combate:</h3>`;
    for (let idEnemigo in window.dbEnemigos) {
        let enemigo = window.dbEnemigos[idEnemigo];
        htmlAdmin += `
            <div class="slot-objeto" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-color: #ef4444;">
                <span style="font-size: 12px;">${enemigo.nombre}</span>
                <button onclick="cerrarMenuAdmin(); iniciarCombate('${idEnemigo}');" class="boton-opcion" style="padding: 2px 8px; font-size: 11px; background: #991b1b;">Pelear</button>
            </div>
        `;
    }

    htmlAdmin += `</div>`;
    pantallaInv.innerHTML += htmlAdmin;

    // Botón para salir del menú de admin
    const botonVolver = document.createElement("button");
    botonVolver.innerText = "⬅ Cerrar Panel de Admin";
    botonVolver.className = "boton-opcion";
    botonVolver.style.marginTop = "15px";
    
    botonVolver.onclick = () => {
        cerrarMenuAdmin();
    };

    pantallaInv.appendChild(botonVolver);
}

function cerrarMenuAdmin() {
    const textoHistoria = document.getElementById("texto-historia");
    const contenedorBotones = document.querySelector(".opciones-container");
    const botonMochila = document.getElementById("btn-mochila-fijo");
    const botonStats = document.getElementById("btn-stats-fijo");
    const pantallaInv = document.getElementById("pantalla-inventario");

    pantallaInv.classList.add("oculto");
    textoHistoria.style.display = "block";
    contenedorBotones.style.display = "flex";
    if (botonMochila) botonMochila.style.display = "block";
    if (botonStats) botonStats.style.display = "block";
}
