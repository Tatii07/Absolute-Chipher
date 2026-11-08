// equipo.js — Sistema de equipamiento + pantalla "Equipo" (pestaña junto a "Estado" del personaje)
//
// PARA AGREGAR UN HUECO NUEVO: añade una línea a SLOTS_EQUIPO.
//   - id:   nombre interno (se guarda en window.jugador.equipo)
//   - tipo: el valor de `slot` que deben tener los objetos para entrar ahí.
//           Varios huecos pueden compartir tipo (como los 2 artefactos).
//
// PARA CREAR UN OBJETO EQUIPABLE (en base_datos.js):
//   mi_casco: { nombre: "...", descripcion: "...", tipo: "equipamiento",
//               slot: "casco", bonus: { vitalidad: 2, vidaMax: 10 } }
//   Bonus posibles: fuerza, agilidad, inteligencia, vitalidad, defensa, vidaMax

const SLOTS_EQUIPO = [
    { id: "arma",       nombre: "Arma",        icono: "⚔️", tipo: "arma" },
    { id: "casco",      nombre: "Casco",       icono: "🪖", tipo: "casco" },
    { id: "peto",       nombre: "Peto",        icono: "🦺", tipo: "peto" },
    { id: "guantes",    nombre: "Guantes",     icono: "🧤", tipo: "guantes" },
    { id: "pantalones", nombre: "Pantalones",  icono: "👖", tipo: "pantalones" },
    { id: "zapatos",    nombre: "Zapatos",     icono: "👢", tipo: "zapatos" },
    { id: "collar",     nombre: "Collar",      icono: "📿", tipo: "collar" },
    { id: "artefacto1", nombre: "Artefacto 1", icono: "🔮", tipo: "artefacto" },
    { id: "artefacto2", nombre: "Artefacto 2", icono: "🔮", tipo: "artefacto" }
];

const NOMBRES_STAT = {
    fuerza: "⚔️ Fuerza",
    agilidad: "💨 Agilidad",
    inteligencia: "🧠 Inteligencia",
    vitalidad: "❤️ Vitalidad",
    defensa: "🛡️ Defensa",
    vidaMax: "💗 Vida máx."
};

// ---------- Datos ----------

// Asegura que exista jugador.equipo con todos los huecos (partidas nuevas o guardadas antes)
function asegurarEquipo() {
    if (!window.jugador.equipo) window.jugador.equipo = {};
    SLOTS_EQUIPO.forEach(s => {
        if (!(s.id in window.jugador.equipo)) window.jugador.equipo[s.id] = null;
    });
}

// Bonus de un objeto (acepta el formato viejo bonusFuerza y el nuevo bonus: {...})
function bonusDeItem(info) {
    const b = Object.assign({}, info.bonus || {});
    if (info.bonusFuerza) b.fuerza = (b.fuerza || 0) + info.bonusFuerza;
    return b;
}

function textoBonus(info) {
    return Object.entries(bonusDeItem(info))
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${NOMBRES_STAT[k] || k} ${v > 0 ? "+" : ""}${v}`)
        .join(" · ");
}

// signo = +1 al equipar, -1 al quitar
function aplicarBonus(info, signo) {
    const st = window.jugador.stats;
    Object.entries(bonusDeItem(info)).forEach(([k, v]) => {
        st[k] = (st[k] || 0) + v * signo;
    });
    if (st.vida > st.vidaMax) st.vida = st.vidaMax;
}

function slotsParaTipo(tipo) {
    return SLOTS_EQUIPO.filter(s => s.tipo === tipo);
}

// ---------- Lógica ----------

// Equipa un objeto de la mochila. Si no se indica slotId, usa el primer hueco libre
// de su tipo (o reemplaza el primero si todos están ocupados).
function equiparItem(idItem, slotId) {
    const info = window.dbItems[idItem];
    if (!info || info.tipo !== "equipamiento") return false;

    asegurarEquipo();
    if (!tieneItem(idItem, 1)) return false;

    const candidatos = slotsParaTipo(info.slot || "arma");
    if (candidatos.length === 0) {
        mostrarAviso("Este objeto no se puede equipar.");
        return false;
    }

    let destino = slotId ? candidatos.find(s => s.id === slotId) : null;
    if (!destino) destino = candidatos.find(s => !window.jugador.equipo[s.id]) || candidatos[0];

    // Si el hueco está ocupado, lo de dentro vuelve a la mochila
    if (window.jugador.equipo[destino.id]) desequiparSlot(destino.id);

    gastarItem(idItem, 1);
    window.jugador.equipo[destino.id] = idItem;
    aplicarBonus(info, +1);

    mostrarAviso(`${destino.icono} Has equipado: ${info.nombre}`);
    actualizarHUD();
    return true;
}

// Quita lo que haya en un hueco y lo devuelve a la mochila
function desequiparSlot(slotId) {
    asegurarEquipo();
    const id = window.jugador.equipo[slotId];
    if (!id) return false;

    const info = window.dbItems[id];
    window.jugador.equipo[slotId] = null;
    if (info) aplicarBonus(info, -1);
    ganarItem(id, 1);
    actualizarHUD();
    return true;
}

// Compatibilidad con código viejo: quitar por id de objeto
function desequiparItem(idItem) {
    asegurarEquipo();
    const slot = SLOTS_EQUIPO.find(s => window.jugador.equipo[s.id] === idItem);
    if (slot) desequiparSlot(slot.id);
}

// Botones de las pantallas
function quitarEquipo(slotId) {
    desequiparSlot(slotId);
    abrirPantallaEquipo();
}

function equiparEnSlot(idItem, slotId) {
    equiparItem(idItem, slotId);
    abrirPantallaEquipo();
}

// ---------- Pantallas ----------

function mostrarPantallaPersonaje() {
    document.getElementById("texto-historia").style.display = "none";
    document.querySelector(".opciones-container").style.display = "none";
    ["btn-mochila-fijo", "btn-stats-fijo"].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.style.display = "none";
    });
    document.getElementById("pantalla-inventario").classList.remove("oculto");
}

function cerrarPantallaPersonaje() {
    document.getElementById("pantalla-inventario").classList.add("oculto");
    document.getElementById("texto-historia").style.display = "block";
    document.querySelector(".opciones-container").style.display = "flex";
    ["btn-mochila-fijo", "btn-stats-fijo"].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.style.display = "block";
    });
}

// Pestañas "Estado | Equipo" (las usan la Hoja de Personaje y la pantalla de Equipo)
function htmlPestanasPersonaje(activa) {
    const estilo = id => `flex: 1 1 auto; width: auto; max-width: none; padding: 6px 8px; font-size: 11px; letter-spacing: 0; white-space: nowrap; background: ${id === activa ? "#0284c7" : "#1e293b"};`;
    const marcaClase = (typeof hayClaseDisponible === "function" && hayClaseDisponible()) ? " ❗" : "";
    const marcaHab = (typeof hayHabilidadDisponible === "function" && hayHabilidadDisponible()) ? " ❗" : "";
    return `
        <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 8px 0;">
            <button onclick="abrirPantallaStats()" class="boton-opcion" style="${estilo("estado")}">📊 Estado</button>
            <button onclick="abrirPantallaEquipo()" class="boton-opcion" style="${estilo("equipo")}">🛡️ Equipo</button>
            <button onclick="abrirPantallaClase()" class="boton-opcion" style="${estilo("clase")}">⚜️ Clase${marcaClase}</button>
            <button onclick="abrirPantallaHabilidades()" class="boton-opcion" style="${estilo("habilidades")}">✨ Habilidades${marcaHab}</button>
        </div>`;
}

function botonVolverPersonaje(pantalla) {
    const boton = document.createElement("button");
    boton.innerText = "⬅ Volver a la historia";
    boton.className = "boton-opcion";
    boton.style.marginTop = "15px";
    boton.onclick = cerrarPantallaPersonaje;
    pantalla.appendChild(boton);
}

function abrirPantallaEquipo() {
    asegurarEquipo();
    mostrarPantallaPersonaje();
    const pantalla = document.getElementById("pantalla-inventario");

    // Suma de todos los bonus puestos
    const total = {};
    SLOTS_EQUIPO.forEach(s => {
        const id = window.jugador.equipo[s.id];
        if (!id || !window.dbItems[id]) return;
        Object.entries(bonusDeItem(window.dbItems[id])).forEach(([k, v]) => { total[k] = (total[k] || 0) + v; });
    });
    const resumen = Object.keys(total).length
        ? Object.entries(total).map(([k, v]) => `${NOMBRES_STAT[k] || k} ${v > 0 ? "+" : ""}${v}`).join(" · ")
        : "Sin bonus de equipo";

    const filas = SLOTS_EQUIPO.map(slot => {
        const id = window.jugador.equipo[slot.id];
        const info = id ? window.dbItems[id] : null;
        const bonus = info ? textoBonus(info) : "";

        return `
            <div class="slot-objeto" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 10px; background: #0f172a; border: 1px solid ${info ? "#38bdf8" : "#334155"}; border-radius: 6px; width: 100%; box-sizing: border-box; text-align: left;">
                <div style="display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0;">
                    <span style="color: #94a3b8; font-size: 11px;">${slot.icono} ${slot.nombre}</span>
                    <span style="color: ${info ? "#f3e5ab" : "#64748b"}; font-weight: bold; font-size: 13px;">${info ? info.nombre : "— Vacío —"}</span>
                    ${bonus ? `<span style="font-size: 10px; color: #38bdf8;">${bonus}</span>` : ""}
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button onclick="abrirSelectorEquipo('${slot.id}')" class="boton-opcion" style="width: auto; padding: 4px 10px; font-size: 11px; background: #0284c7;">${info ? "Cambiar" : "Equipar"}</button>
                    ${info ? `<button onclick="quitarEquipo('${slot.id}')" class="boton-opcion" style="width: auto; padding: 4px 10px; font-size: 11px; background: #7f1d1d;">Quitar</button>` : ""}
                </div>
            </div>`;
    }).join("");

    pantalla.innerHTML = `
        <h2 style="color: #f3e5ab; margin-bottom: 5px;">🛡️ EQUIPO</h2>
        ${htmlPestanasPersonaje("equipo")}
        <p style="font-size: 11px; color: #38bdf8; margin: 4px 0 8px;">${resumen}</p>
        <div class="grid-inventario" style="width: 90%; max-width: 320px; margin: 0 auto;">${filas}</div>
    `;

    botonVolverPersonaje(pantalla);
}

// Lista los objetos de la mochila que caben en un hueco
function abrirSelectorEquipo(slotId) {
    asegurarEquipo();
    const slot = SLOTS_EQUIPO.find(s => s.id === slotId);
    if (!slot) return;

    mostrarPantallaPersonaje();
    const pantalla = document.getElementById("pantalla-inventario");

    const compatibles = inventario.filter(it => {
        const info = window.dbItems[it.id];
        return info && info.tipo === "equipamiento" && (info.slot || "arma") === slot.tipo;
    });

    let lista;
    if (compatibles.length === 0) {
        lista = `<p style="margin: 15px 0; color: #94a3b8; font-size: 13px;">No tienes objetos de este tipo en la mochila.</p>`;
    } else {
        lista = `<div class="grid-inventario" style="width: 90%; max-width: 320px; margin: 10px auto;">` +
            compatibles.map(it => {
                const info = window.dbItems[it.id];
                return `
                    <div class="slot-objeto" style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 10px; background: #0f172a; border: 1px solid #c9a050; border-radius: 6px; width: 100%; box-sizing: border-box; text-align: left;">
                        <div style="display: flex; justify-content: space-between; width: 100%;">
                            <span style="font-weight: bold; color: #f3e5ab;">${info.nombre}</span>
                            <span class="cantidad-item">x${it.cantidad}</span>
                        </div>
                        <p style="font-size: 11px; color: #94a3b8; margin: 0;">${info.descripcion || ""}</p>
                        <span style="font-size: 11px; color: #38bdf8;">${textoBonus(info)}</span>
                        <button onclick="equiparEnSlot('${it.id}', '${slot.id}')" class="boton-opcion" style="width: auto; padding: 4px 10px; font-size: 11px; align-self: flex-end; background: #0284c7;">Equipar</button>
                    </div>`;
            }).join("") + `</div>`;
    }

    pantalla.innerHTML = `<h2 style="color: #f3e5ab; margin-bottom: 5px;">${slot.icono} ${slot.nombre.toUpperCase()}</h2>${lista}`;

    const volver = document.createElement("button");
    volver.innerText = "⬅ Volver al equipo";
    volver.className = "boton-opcion";
    volver.style.marginTop = "15px";
    volver.onclick = abrirPantallaEquipo;
    pantalla.appendChild(volver);
}
