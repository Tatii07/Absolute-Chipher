// ===== BALANCE DEL COMBATE (ajusta aquí) =====
const COMBATE_CONFIG = {
    variacionMin: 0.8,  // el golpe más flojo es el 80% del ataque base
    variacionMax: 1.2,  // el golpe más fuerte es el 120% del ataque base
    danoMinimo: 1       // ningún golpe hace menos que esto, aunque la defensa sea enorme
};

// Rango de daño de un golpe: la DEFENSA del que recibe baja tanto el mínimo como el máximo
function rangoDano(ataque, defensa) {
    const min = Math.max(COMBATE_CONFIG.danoMinimo, Math.floor(ataque * COMBATE_CONFIG.variacionMin) - defensa);
    const max = Math.max(min, Math.ceil(ataque * COMBATE_CONFIG.variacionMax) - defensa);
    return { min, max };
}

// Daño real de un golpe (al azar entre el mínimo y el máximo)
function tirarDano(ataque, defensa) {
    const { min, max } = rangoDano(ataque, defensa);
    return min + Math.floor(Math.random() * (max - min + 1));
}

// Ataque base del jugador: fuerza + bonus de raza/rasgos
function ataqueJugador() {
    const extra = (typeof sumaEfecto === "function") ? sumaEfecto("danoExtra") : 0;
    return Math.max(5, window.jugador.stats.fuerza - 2) + extra;
}

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
        defensa: infoEnemigo.defensa || 0,
        expRecompensa: infoEnemigo.expRecompensa || 20, // 👈 Copiamos esto aquí
        itemRecompensa: infoEnemigo.itemRecompensa,      // 👈 Antes no se copiaba, por eso no soltaba el objeto
        usosHabilidad: (typeof inicializarUsosHabilidades === "function") ? inicializarUsosHabilidades() : {}
    };

    mostrarPantallaCombate();
}

function mostrarPantallaCombate(){
    const contenedorTexto = document.getElementById("id-del-cuadro-de-texto"); 
if (contenedorTexto) {
    contenedorTexto.innerHTML = ""; // Oculta o vacía el texto de la mina durante el combate
}
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
        <p style="font-size: 11px; color: #38bdf8; margin: 0 0 6px 0;">
            🗡️ Tu daño: ${rangoDano(ataqueJugador(), enemigo.defensa || 0).min}–${rangoDano(ataqueJugador(), enemigo.defensa || 0).max}
            · 💥 Te harán: ${rangoDano(enemigo.fuerza, defensaTotalJugador()).min}–${rangoDano(enemigo.fuerza, defensaTotalJugador()).max}
            · 🛡️ ${defensaTotalJugador()}
            · 🔷 ${window.jugador.stats.mana} / ${window.jugador.stats.manaMax} MP
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 15px;">¿Qué acción deseas tomar?</p>
        
        <div style="display: flex; flex-direction: column; gap: 8px; width: 90%; max-width: 260px; margin: 0 auto;">
            <button onclick="turnoAtacar()" class="boton-opcion" style="background: #7f1d1d; border-color: #ef4444;">Atacar</button>
            ${typeof htmlBotonesHabilidades === "function" ? htmlBotonesHabilidades() : ""}
            <button onclick="abrirInventarioCombate()" class="boton-opcion">Usar Objeto</button>
            <button onclick="huirCombate()" class="boton-opcion" style="background: #1e293b;">Huir</button>
        </div>
    `;
}

function turnoAtacar() {
    const enemigo = window.combateActual;
    if (!enemigo) return;

    // El jugador golpea al enemigo (la defensa del enemigo baja el daño)
    const danoJugador = tirarDano(ataqueJugador(), enemigo.defensa || 0);
    enemigo.vida -= danoJugador;

    terminarTurnoJugador(`Atacas por ${danoJugador} de daño.`);
}

// Habilidad especial de la raza o la especialidad (definida en base_datos/razas.js)
function usarHabilidadCombate(clave) {
    const enemigo = window.combateActual;
    if (!enemigo || typeof habilidadesJugador !== "function") return;

    const habilidad = habilidadesJugador().find(h => h.clave === clave);
    if (!habilidad) return;

    // Si la habilidad tiene coste de maná, se limita solo por maná (ya no por usos)
    const costeMana = Number(habilidad.mana) || 0;
    if (costeMana > 0) {
        if (window.jugador.stats.mana < costeMana) {
            mostrarAviso(`No tienes maná suficiente para ${habilidad.nombre} (cuesta ${costeMana} MP).`);
            return;
        }
        window.jugador.stats.mana -= costeMana;
    } else {
        if (!enemigo.usosHabilidad || !(enemigo.usosHabilidad[clave] > 0)) {
            mostrarAviso(`Ya usaste ${habilidad.nombre} en este combate.`);
            return;
        }
        enemigo.usosHabilidad[clave]--;
    }
    registrarAccion("habilidadesUsadas"); // 🆕 CLASES
    const mensaje = habilidad.efecto ? habilidad.efecto(window.jugador, enemigo) : "";
    terminarTurnoJugador(mensaje || `Usas ${habilidad.nombre}.`);
}

// Después de actuar el jugador: ¿murió el enemigo? si no, contraataca
function terminarTurnoJugador(mensajeJugador) {
    const enemigo = window.combateActual;
    if (!enemigo) return;

    if (enemigo.vida <= 0) {
        enemigo.vida = 0;
        registrarDerrota(enemigo.id); // 🆕 CLASES
        let mensaje = `¡Has derrotado a ${enemigo.nombre}!`;

        if (enemigo.itemRecompensa) {
            ganarItem(enemigo.itemRecompensa, 1);
            const infoItem = window.dbItems[enemigo.itemRecompensa];
            const nombreItemDropeado = infoItem ? infoItem.nombre : "Objeto misterioso";
            mensaje += `\n🎁 ¡Has obtenido un objeto único: ${nombreItemDropeado}!`;
        }

        mostrarAviso(mensaje);
        cerrarCombate();
        // Al final, para que el aviso de "Nivel Subido" (si lo hay) se vea
        ganarExperiencia(enemigo.expRecompensa || 20);
        return;
    }

    // El maná se regenera un poco cada turno
    if (typeof regenerarManaTurno === "function") regenerarManaTurno();

    // 🆕 CLASES: un enemigo aturdido pierde su contraataque
    if (enemigo.aturdido > 0) {
        enemigo.aturdido--;
        actualizarHUD();
        mostrarPantallaCombate();
        mostrarAviso(`${mensajeJugador} ${enemigo.nombre} está aturdido y no puede contraatacar.`);
        return;
    }

    // Turno del enemigo contra el jugador (tu defensa baja el daño)
    const danoEnemigo = tirarDano(enemigo.fuerza, defensaTotalJugador());
    window.jugador.stats.vida -= danoEnemigo;
    registrarAccion("danoRecibido", danoEnemigo); // 🆕 CLASES

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
    mostrarAviso(`${mensajeJugador} ${enemigo.nombre} te contraataca por ${danoEnemigo} de HP.`);
}

function huirCombate() {
    registrarAccion("huidas"); // 🆕 CLASES
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
    registrarAccion("objetosUsados"); // 🆕 CLASES
    if (infoDb.efecto) infoDb.efecto();
    actualizarHUD();
    // Recargamos la mochila de combate para ver la cantidad actualizada
    abrirInventarioCombate();
} else {
    mostrarAviso("No tienes suficientes unidades de este objeto.");
}
}
