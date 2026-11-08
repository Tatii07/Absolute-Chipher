// jugador.js
window.jugador = {
    nombre: "Julliet",
    nivel: 0,
    exp: 0,
    expSiguienteNivel: 100,
    oro: 20,
    puntosDisponibles: 0, 
    equipo: {
        arma: null
    },
    stats: {
        vida: 50,
        vidaMax: 50,
        mana: 40,
        manaMax: 40,
        fuerza: 15,
        agilidad: 2,
        inteligencia: 2,
        vitalidad: 3,
        defensa: 0
        
    },
};

// ===== BALANCE DEL MANÁ (ajusta aquí) =====
const MANA_CONFIG = {
    base: 20,              // maná con 0 de inteligencia
    porInteligencia: 10,   // maná extra por cada punto de inteligencia
    regenTurno: 0.05       // % del maná máximo que se recupera al final de cada turno de combate (0 = nada)
};

// Mantiene manaMax al día según la inteligencia (también la de equipo, clase y raza).
// Si el máximo sube, el maná actual sube lo mismo; si baja, se recorta. Se llama sola desde actualizarHUD.
function recalcularManaMax() {
    const s = window.jugador && window.jugador.stats;
    if (!s) return;
    const nuevoMax = MANA_CONFIG.base + (s.inteligencia || 0) * MANA_CONFIG.porInteligencia;

    // Partida nueva o guardado viejo sin maná: empieza lleno
    if (typeof s.mana !== "number" || typeof s.manaMax !== "number") {
        s.manaMax = nuevoMax;
        s.mana = nuevoMax;
        return;
    }
    const diferencia = nuevoMax - s.manaMax;
    s.manaMax = nuevoMax;
    if (diferencia > 0) s.mana += diferencia;
    s.mana = Math.max(0, Math.min(s.mana, s.manaMax));
}

// Devuelve cuánto maná se recuperó realmente (úsala en pociones: restaurarMana(30))
function restaurarMana(cantidad) {
    const s = window.jugador.stats;
    const antes = s.mana;
    s.mana = Math.min(s.manaMax, s.mana + cantidad);
    return s.mana - antes;
}

function regenerarManaTurno() {
    if (!MANA_CONFIG.regenTurno) return;
    restaurarMana(Math.max(1, Math.round(window.jugador.stats.manaMax * MANA_CONFIG.regenTurno)));
}


// Defensa total = defensa base + la mitad de la vitalidad + bonus de raza/rasgos.
// (el equipo ya suma a la defensa base al equiparse)
// Si NO quieres que la vitalidad cuente, borra la línea de Math.floor(...)
function defensaTotalJugador() {
    const s = window.jugador.stats;
    const extra = (typeof sumaEfecto === "function") ? sumaEfecto("defensaExtra") : 0;
    return (s.defensa || 0) + Math.floor((s.vitalidad || 0) / 2) + extra;
}

// Función para abrir la pantalla de estadísticas del personaje
// Función para aumentar una estadística gastando puntos libres
function gastarPuntoStat(statNombre) {
    if (window.jugador.puntosDisponibles > 0) {
        window.jugador.puntosDisponibles--;
        
        if (statNombre === 'vidaMax') {
            window.jugador.stats.vidaMax += 10;
            window.jugador.stats.vida = window.jugador.stats.vidaMax;
        } else {
            window.jugador.stats[statNombre] = (window.jugador.stats[statNombre] || 0) + 1;
        }
        
        // Recargamos la pantalla de stats para ver reflejado el cambio al instante
        actualizarHUD(); // recalcula el maná máximo si subiste inteligencia
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
        <h2 style='color: #f3e5ab; margin-bottom: 5px;'>📊 ESTADO</h2>
        ${typeof htmlPestanasPersonaje === "function" ? htmlPestanasPersonaje("estado") : ""}
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
            ${typeof htmlIdentidadJugador === "function" ? htmlIdentidadJugador() : ""}
            <div class="slot-objeto"><span>Nivel:</span> <span class="cantidad-item">${window.jugador.nivel}</span></div>
            <div class="slot-objeto"><span>HP:</span> <span class="cantidad-item">${window.jugador.stats.vida} / ${window.jugador.stats.vidaMax}</span></div>
            <div class="slot-objeto"><span>🔷 MP:</span> <span class="cantidad-item">${window.jugador.stats.mana} / ${window.jugador.stats.manaMax}</span></div>
            
            ${crearSlotStat("⚔️ Fuerza", window.jugador.stats.fuerza, "fuerza")}
            ${crearSlotStat("💨 Agilidad", window.jugador.stats.agilidad, "agilidad")}
            ${crearSlotStat("🧠 Inteligencia", window.jugador.stats.inteligencia, "inteligencia")}
            ${crearSlotStat("❤️ Vitalidad", window.jugador.stats.vitalidad, "vitalidad")}
            ${crearSlotStat("🛡️ Defensa", defensaTotalJugador(), "defensa")}
            <p style="font-size: 10px; color: #64748b; margin: -2px 0 0 0;">Defensa total = base + ½ vitalidad + rasgos. Reduce el mínimo y el máximo del daño que recibes.</p>
            
            <div class="slot-objeto">
                <span>✨ XP Actual / Siguiente:</span> 
                <span class="cantidad-item">${window.jugador.exp} / ${window.jugador.expSiguienteNivel}</span>
            </div>
        </div>
    `;
    
    pantallaInv.innerHTML += htmlStats;
    if (typeof htmlRasgosJugador === "function") {
        pantallaInv.innerHTML += htmlRasgosJugador();
    }

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

