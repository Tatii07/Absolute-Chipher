// Variable global para almacenar el estado del combate actual
window.combateActual = null;

function iniciarCombate(idEnemigo) {
    const infoEnemigo = window.dbEnemigos[idEnemigo];
    if (!infoEnemigo) return;

    // Clonamos el enemigo incluyendo su expRecompensa
    window.combateActual = {
        id: idEnemigo,
        nombre: infoEnemigo.nombre,
        vida: infoEnemigo.vidaMax,
        vidaMax: infoEnemigo.vidaMax,
        fuerza: infoEnemigo.fuerza,
        expRecompensa: infoEnemigo.expRecompensa || 20 // 👈 Copiamos esto aquí
    };

    mostrarPantallaCombate();
}

function mostrarPantallaCombate() {
    const textoHistoria = document.getElementById("texto-historia");
    const contenedorBotones = document.querySelector(".opciones-container");
    const botonMochila = document.getElementById("btn-mochila-fijo");
    const botonStats = document.getElementById("btn-stats-fijo");
    const pantallaInv = document.getElementById("pantalla-inventario");

    // Ocultar HUD principal y mostrar pantalla de combate
    textoHistoria.style.display = "none";
    contenedorBotones.style.display = "none";
    if (botonMochila) botonMochila.style.display = "none";
    if (botonStats) botonStats.style.display = "none";

    pantallaInv.classList.remove("oculto");

    const enemigo = window.combateActual;

    pantallaInv.innerHTML = `
        <h2 style='color: #ef4444; margin-bottom: 5px;'>⚔️ COMBATE</h2>
        <div class="slot-objeto" style="flex-direction: column; align-items: center; gap: 8px; margin: 10px 0; border-color: #ef4444;">
            <span style="font-weight: bold; color: #f3e5ab; font-size: 16px;">${enemigo.nombre}</span>
            <span style="color: #ef4444; font-weight: bold;">HP: ${enemigo.vida} / ${enemigo.vidaMax}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 15px;">¿Qué acción deseas tomar?</p>
        
        <div style="display: flex; flex-direction: column; gap: 8px; width: 90%; max-width: 260px; margin: 0 auto;">
            <button onclick="turnoAtacar()" class="boton-opcion" style="background: #7f1d1d; border-color: #ef4444;">Atacar</button>
            <button onclick="abrirInventarioCombate()" class="boton-opcion">Usar Objeto</button>
            <button onclick="huirCombate()" class="boton-opcion" style="background: #1e293b;">Huir</button>
        </div>
    `;
}

function turnoAtacar() {
    const enemigo = window.combateActual;
    if (!enemigo) return;

    // 1. El jugador golpea al enemigo (usando la fuerza de Julliet)
    const danoJugador = Math.max(5, window.jugador.stats.fuerza - 2);
    enemigo.vida -= danoJugador;

    if (enemigo.vida <= 0) {
    enemigo.vida = 0;
    mostrarAviso(`¡Has derrotado a ${enemigo.nombre} con un golpe devastador!`);
    
    // Si el enemigo tiene expRecompensa la usa; si no, otorga 20 por defecto
    const recompensaXP = enemigo.expRecompensa || 20; 
    ganarExperiencia(recompensaXP); 
    
    if (enemigo.itemRecompensa) {
            ganarItem(enemigo.itemRecompensa, 1);
            const infoItem = window.dbItems[enemigo.itemRecompensa];
            const nombreItemDropeado = infoItem ? infoItem.nombre : "Objeto misterioso";
            mostrarAviso(`🎁 ¡Has obtenido un objeto único: ${nombreItemDropeado}!`);
        }
        

    cerrarCombate();
    return;
}


    // 2. Turno del enemigo contra el jugador
    const danoEnemigo = Math.max(2, enemigo.fuerza - Math.floor(window.jugador.stats.vitalidad / 2));
    window.jugador.stats.vida -= danoEnemigo;

    if (window.jugador.stats.vida <= 0) {
        window.jugador.stats.vida = 0;
        actualizarHUD();
        mostrarAviso("Has caído en combate...");
        cerrarCombate();
        cargarEscena("menu"); // O mandar a una escena de derrota
        return;
    }

    actualizarHUD();
    mostrarPantallaCombate();
    mostrarAviso(`Atacas por ${danoJugador} de daño. ${enemigo.nombre} te contraataca por ${danoEnemigo} de HP.`);
}

function huirCombate() {
    mostrarAviso("¡Has huido cobardemente del combate!");
    cerrarCombate();
}

function abrirInventarioCombate() {
    const textoHistoria = document.getElementById("texto-historia");
    const contenedorBotones = document.querySelector(".opciones-container");
    const botonMochila = document.getElementById("btn-mochila-fijo");
    const pantallaInv = document.getElementById("pantalla-inventario");

    textoHistoria.style.display = "none";
    contenedorBotones.style.display = "none";
    botonMochila.style.display = "none";

    pantallaInv.classList.remove("oculto");
    pantallaInv.innerHTML = "<h2>🎒 MOCHILA</h2>";

    if (inventario.length === 0) {
        pantallaInv.innerHTML += "<p style='margin:15px 0;'>La mochila está vacía.</p>";
    } else {
        let HTMLObjetos = '<div class="grid-inventario" style="width: 90%; max-width: 320px;">';
        
                inventario.forEach(item => {
            const infoDb = window.dbItems[item.id] || {};
            const descripcion = infoDb.descripcion || "Sin descripción.";
            
            // Verificamos de una vez si el ítem tiene un efecto asignado
            const tieneEfecto = typeof infoDb.efecto === "function";

            HTMLObjetos += `
                <div class="slot-objeto" style="flex-direction: column; align-items: flex-start; gap: 5px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span style="font-weight: bold; color: #f3e5ab;">${item.nombre}</span>
                        <span class="cantidad-item">x${item.cantidad}</span>
                    </div>
                    <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 5px 0; text-align: left;">${descripcion}</p>
            `;

            // Si tiene efecto (ya sea poción o llave de admin), dibujamos el botón de usar
            if (tieneEfecto) {
                HTMLObjetos += `<button onclick="usarItemCombate('${item.id}')" class="boton-opcion" style="padding: 4px 10px; font-size: 11px; align-self: flex-end; margin-top: 5px;">Usar</button>`;
            }

            HTMLObjetos += `</div>`;
        });

        HTMLObjetos += '</div>';
        pantallaInv.innerHTML += HTMLObjetos;
    }

        // Botón para volver al combate en lugar de a la historia
    const botonVolver = document.createElement("button");
    botonVolver.innerText = "⬅ Volver al combate";
    botonVolver.className = "boton-opcion";
    botonVolver.style.marginTop = "15px";
    
    botonVolver.onclick = () => {
        mostrarPantallaCombate(); // 👈 Regresa directo a la pelea activa con el enemigo
    };

    pantallaInv.appendChild(botonVolver);
}


function cerrarCombate() {
    window.combateActual = null;
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
    actualizarHUD();
}

function usarItemCombate(idItem) {
const infoDb = window.dbItems[idItem];
if (!infoDb) return;

// Si es un ítem de control/admin en pleno combate, ejecutamos su efecto
if (infoDb.tipo === "control") {
    if (infoDb.efecto) infoDb.efecto();
    return;
}

// Gastamos el objeto del inventario global
const sePudoGastar = gastarItem(idItem, 1);

if (sePudoGastar) {
    if (infoDb.efecto) infoDb.efecto();
    actualizarHUD();
    // Recargamos la mochila de combate para ver la cantidad actualizada
    abrirInventarioCombate();
} else {
    mostrarAviso("No tienes suficientes unidades de este objeto.");
}
}
