// jugador.js
window.jugador = {
    nombre: "Julliet",
    nivel: 0,
    exp: 0,
    expSiguienteNivel: 100,
    oro: 20,
    puntosDisponibles: 0, // 👈 Puntos libres para repartir
    stats: {
        vida: 50,
        vidaMax: 50,
        fuerza: 15,
        agilidad: 2,
        inteligencia: 2,
        vitalidad: 3
    },
};


// Función para abrir la pantalla de estadísticas del personaje
// Función para aumentar una estadística gastando puntos libres
function gastarPuntoStat(statNombre) {
    if (window.jugador.puntosDisponibles > 0) {
        window.jugador.puntosDisponibles--;
        
        if (statNombre === 'vidaMax') {
            window.jugador.stats.vidaMax += 10;
            window.jugador.stats.vida = window.jugador.stats.vidaMax;
        } else {
            window.jugador.stats[statNombre]++;
        }
        
        // Recargamos la pantalla de stats para ver reflejado el cambio al instante
        abrirPantallaStats();
    } else {
        mostrarAviso("No tienes puntos disponibles.");
    }
}

// Función mejorada de la Hoja de Personaje
function abrirPantallaStats() {
    const textoHistoria = document.getElementById("texto-historia");
    const contenedorBotones = document.querySelector(".opciones-container");
    const botonMochila = document.getElementById("btn-mochila-fijo");
    const botonStats = document.getElementById("btn-stats-fijo");
    const pantallaInv = document.getElementById("pantalla-inventario");

    textoHistoria.style.display = "none";
    contenedorBotones.style.display = "none";
    if (botonMochila) botonMochila.style.display = "none";
    if (botonStats) botonStats.style.display = "none";

    pantallaInv.classList.remove("oculto");
    
    // Indicador visual de puntos disponibles
    let avisoPuntos = window.jugador.puntosDisponibles > 0 
        ? `<p style="color: #38bdf8; font-size: 13px; margin-bottom: 10px;">🌟 Puntos disponibles: ${window.jugador.puntosDisponibles}</p>` 
        : `<p style="color: #94a3b8; font-size: 12px; margin-bottom: 10px;">Sin puntos por repartir</p>`;

    pantallaInv.innerHTML = `
        <h2 style='color: #f3e5ab; margin-bottom: 5px;'>🛡️ HOJA DE PERSONAJE</h2>
        ${avisoPuntos}
    `;

    // Función auxiliar para dibujar cada slot con su botón de "+" si hay puntos
    function crearSlotStat(label, valor, statKey) {
        let botonPlus = window.jugador.puntosDisponibles > 0 
            ? `<button onclick="gastarPuntoStat('${statKey}')" class="boton-opcion" style="padding: 2px 8px; font-size: 11px; background: #0284c7; margin-left: 10px;">＋</button>` 
            : "";
            
        return `
            <div class="slot-objeto" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${label}:</span> 
                <div style="display: flex; align-items: center;">
                    <span class="cantidad-item">${valor}</span>
                    ${botonPlus}
                </div>
            </div>
        `;
    }

    let htmlStats = `
        <div class="grid-inventario" style="text-align: left; gap: 8px; width: 90%; max-width: 285px;">
            <div class="slot-objeto"><span>Nombre:</span> <span class="nombre-item">${window.jugador.nombre}</span></div>
            <div class="slot-objeto"><span>Nivel:</span> <span class="cantidad-item">${window.jugador.nivel}</span></div>
            <div class="slot-objeto"><span>HP:</span> <span class="cantidad-item">${window.jugador.stats.vida} / ${window.jugador.stats.vidaMax}</span></div>
            
            ${crearSlotStat("⚔️ Fuerza", window.jugador.stats.fuerza, "fuerza")}
            ${crearSlotStat("💨 Agilidad", window.jugador.stats.agilidad, "agilidad")}
            ${crearSlotStat("🧠 Inteligencia", window.jugador.stats.inteligencia, "inteligencia")}
            ${crearSlotStat("❤️ Vitalidad", window.jugador.stats.vitalidad, "vitalidad")}
            
            <div class="slot-objeto">
                <span>✨ XP Actual / Siguiente:</span> 
                <span class="cantidad-item">${window.jugador.exp} / ${window.jugador.expSiguienteNivel}</span>
            </div>
        </div>
    `;
    
    pantallaInv.innerHTML += htmlStats;

    const botonVolver = document.createElement("button");
    botonVolver.innerText = "⬅ Volver a la historia";
    botonVolver.className = "boton-opcion";
    botonVolver.style.marginTop = "15px";
    
    botonVolver.onclick = () => {
        pantallaInv.classList.add("oculto");
        textoHistoria.style.display = "block";
        contenedorBotones.style.display = "flex";
        if (botonMochila) botonMochila.style.display = "block";
        if (botonStats) botonStats.style.display = "block";
    };

    pantallaInv.appendChild(botonVolver);
}

