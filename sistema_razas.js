// sistema_razas.js — Lógica de razas y especialidades (los datos están en base_datos/razas.js)
// Normalmente NO necesitas editar este archivo para agregar razas nuevas.

// ---------- Consultas ----------

function razaDe(jugador = window.jugador) {
    return (jugador && window.dbRazas && window.dbRazas[jugador.raza]) || null;
}

function especialidadDe(jugador = window.jugador) {
    return (jugador && window.dbEspecialidades && window.dbEspecialidades[jugador.especialidad]) || null;
}

// Rasgos de una raza o especialidad. Acepta ids del catálogo (dbRasgos) y rasgos escritos en línea
function rasgosDe(def) {
    return (def.rasgos || []).map(r => {
        if (typeof r !== "string") return r;
        const rasgo = window.dbRasgos && window.dbRasgos[r];
        if (!rasgo) console.warn(`Rasgo no encontrado en dbRasgos: "${r}"`);
        return rasgo || null;
    }).filter(Boolean);
}

// Todo lo que aporta efectos: la raza, sus rasgos, la especialidad y sus rasgos
// (un mismo rasgo compartido por raza y especialidad cuenta una sola vez)
function fuentesDeEfectos(jugador = window.jugador) {
    const lista = [];
    // 🆕 CLASES: la clase actual y las anteriores también aportan efectos
    const clases = (typeof clasesDe === "function") ? clasesDe(jugador) : [];
    [razaDe(jugador), especialidadDe(jugador), ...clases].forEach(fuente => {
        if (!fuente) return;
        lista.push(fuente);
        rasgosDe(fuente).forEach(r => { if (!lista.includes(r)) lista.push(r); });
    });
    // 🆕 HABILIDADES: las pasivas aprendidas también aportan efectos
    if (typeof pasivasDe === "function") pasivasDe(jugador).forEach(p => { if (!lista.includes(p)) lista.push(p); });
    return lista;
}

// Suma un efecto numérico de todas las fuentes (ej. danoExtra)
function sumaEfecto(clave) {
    return fuentesDeEfectos().reduce((total, f) => total + (Number(f[clave]) || 0), 0);
}

// Multiplica un efecto de todas las fuentes (ej. expMultiplicador)
function multiplicadorEfecto(clave) {
    return fuentesDeEfectos().reduce((total, f) => total * (f[clave] != null ? Number(f[clave]) : 1), 1);
}

// ---------- Aplicar al empezar una partida ----------

// Se llama desde nuevaPartida() DESPUÉS de crear el jugador y su inventario
function aplicarRazaYEspecialidad() {
    const j = window.jugador;
    fuentesDeEfectos(j).forEach(f => {
        Object.entries(f.stats || {}).forEach(([clave, valor]) => {
            j.stats[clave] = (j.stats[clave] || 0) + valor;
        });
        (f.items || []).forEach(it => ganarItem(it.id, it.cantidad || 1));
        if (f.oro) j.oro += f.oro;
        if (typeof f.alCrear === "function") f.alCrear(j);
    });
    j.stats.vida = j.stats.vidaMax; // empieza con la vida llena (ya con los bonus)
    if (typeof recalcularManaMax === "function") { recalcularManaMax(); j.stats.mana = j.stats.manaMax; } // y el maná lleno
}

// ---------- Textos ----------

function resumenEfectos(f) {
    const nombresStat = (typeof NOMBRES_STAT !== "undefined") ? NOMBRES_STAT : {};
    const partes = [];

    Object.entries(f.stats || {}).forEach(([k, v]) => {
        if (v !== 0) partes.push(`${nombresStat[k] || k} ${v > 0 ? "+" : ""}${v}`);
    });
    if (f.oro) partes.push(`💰 Oro ${f.oro > 0 ? "+" : ""}${f.oro}`);
    (f.items || []).forEach(it => {
        const info = window.dbItems && window.dbItems[it.id];
        partes.push(`🎒 ${info ? info.nombre : it.id} x${it.cantidad || 1}`);
    });
    if (f.expMultiplicador != null && f.expMultiplicador !== 1) {
        const pct = Math.round((f.expMultiplicador - 1) * 100);
        partes.push(`✨ Experiencia ${pct > 0 ? "+" : ""}${pct}%`);
    }
    if (f.danoExtra) partes.push(`🗡️ Daño ${f.danoExtra > 0 ? "+" : ""}${f.danoExtra}`);
    if (f.defensaExtra) partes.push(`🛡️ Defensa ${f.defensaExtra > 0 ? "+" : ""}${f.defensaExtra}`);

    return partes.join(" · ");
}

// Rasgos y habilidad de una raza o especialidad, en HTML pequeño
function htmlRasgosYHabilidad(def) {
    let html = "";

    rasgosDe(def).forEach(r => {
        const extra = resumenEfectos(r);
        html += `<p style="font-size: 11px; color: #86efac; margin: 4px 0 0 0;">✦ <b>${r.nombre}</b>: ${r.descripcion || ""}${extra ? ` <span style="color: #38bdf8;">(${extra})</span>` : ""}</p>`;
    });

    if (def.habilidad) {
        const h = def.habilidad;
        html += `<p style="font-size: 11px; color: #c4b5fd; margin: 4px 0 0 0;">⚡ <b>${h.nombre}</b> (${h.usos || 1} por combate): ${h.descripcion || ""}</p>`;
    }
    // Formato antiguo: habilidades escritas dentro de la clase (las nuevas son ids y van por el árbol)
    (def.habilidades || []).filter(h => typeof h === "object").forEach(h => {
        html += `<p style="font-size: 11px; color: #c4b5fd; margin: 4px 0 0 0;">⚡ <b>${h.nombre}</b> (${h.usos || 1} por combate): ${h.descripcion || ""}</p>`;
    });
    return html;
}

// Detalle completo (para las tarjetas de la creación de personaje)
function htmlDetalleFuente(def) {
    const bonus = resumenEfectos(def);
    return `
        <p style="font-size: 11px; color: #94a3b8; margin: 6px 0 0 0;">${def.descripcion || ""}</p>
        ${bonus ? `<p style="font-size: 11px; color: #38bdf8; margin: 4px 0 0 0;">${bonus}</p>` : ""}
        ${htmlRasgosYHabilidad(def)}
    `;
}

// ---------- Hoja de personaje ----------

// Filas "Raza" y "Especialidad" para la pantalla de Estado
function htmlIdentidadJugador() {
    const r = razaDe(), e = especialidadDe();
    let html = "";
    if (r) html += `<div class="slot-objeto"><span>Raza:</span> <span class="nombre-item">${r.icono || ""} ${r.nombre}</span></div>`;
    if (e) html += `<div class="slot-objeto"><span>Especialidad:</span> <span class="nombre-item">${e.icono || ""} ${e.nombre}</span></div>`;
    if (typeof htmlFilaClase === "function") html += htmlFilaClase(); // 🆕 CLASES
    return html;
}

// Bloque con rasgos y habilidades del personaje
function htmlRasgosJugador() {
    const r = razaDe(), e = especialidadDe();
    const bloques = [];
    if (r && (rasgosDe(r).length || r.habilidad)) bloques.push(`<p style="color: #f3e5ab; font-size: 12px; margin: 6px 0 0 0;">${r.icono || ""} ${r.nombre}</p>${htmlRasgosYHabilidad(r)}`);
    if (e && (rasgosDe(e).length || e.habilidad)) bloques.push(`<p style="color: #f3e5ab; font-size: 12px; margin: 6px 0 0 0;">${e.icono || ""} ${e.nombre}</p>${htmlRasgosYHabilidad(e)}`);
    // 🆕 CLASES
    if (typeof clasesDe === "function") {
        clasesDe().forEach(c => {
            if (rasgosDe(c).length || (c.habilidades || []).some(h => typeof h === "object")) bloques.push(`<p style="color: #f3e5ab; font-size: 12px; margin: 6px 0 0 0;">${c.icono || ""} ${c.nombre}</p>${htmlRasgosYHabilidad(c)}`);
        });
    }
    // 🆕 HABILIDADES: lo aprendido en el árbol
    if (typeof htmlBloqueHabilidadesAprendidas === "function") {
        const aprendidas = htmlBloqueHabilidadesAprendidas();
        if (aprendidas) bloques.push(aprendidas);
    }
    if (!bloques.length) return "";

    return `<div style="width: 90%; max-width: 285px; margin: 12px auto 0; text-align: left; border-top: 1px solid #334155; padding-top: 8px;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">RASGOS Y HABILIDADES</p>
        ${bloques.join("")}
    </div>`;
}

// ---------- Habilidades activas (combate) ----------

function habilidadesJugador() {
    const lista = [];
    const r = razaDe(), e = especialidadDe();
    if (r && r.habilidad) lista.push(Object.assign({ clave: "raza" }, r.habilidad));
    if (e && e.habilidad) lista.push(Object.assign({ clave: "especialidad" }, e.habilidad));
    // 🆕 CLASES: habilidades de la clase actual y las anteriores
    if (typeof habilidadesDeClases === "function") lista.push(...habilidadesDeClases());
    // 🆕 HABILIDADES: las activas que has aprendido en el árbol
    if (typeof habilidadesActivasJugador === "function") lista.push(...habilidadesActivasJugador());
    return lista;
}

function inicializarUsosHabilidades() {
    const usos = {};
    habilidadesJugador().forEach(h => { usos[h.clave] = h.usos || 1; });
    return usos;
}

function htmlBotonesHabilidades() {
    const combate = window.combateActual;
    if (!combate) return "";
    return habilidadesJugador().map(h => {
        const coste = Number(h.mana) || 0;
        if (coste > 0) {
            const alcanza = window.jugador.stats.mana >= coste;
            return `<button onclick="usarHabilidadCombate('${h.clave}')" class="boton-opcion" style="background: #1e3a8a; border-color: #60a5fa; ${alcanza ? "" : "opacity: 0.5;"}">✨ ${h.nombre} (${coste} MP)</button>`;
        }
        const quedan = (combate.usosHabilidad && combate.usosHabilidad[h.clave]) || 0;
        return `<button onclick="usarHabilidadCombate('${h.clave}')" class="boton-opcion" style="background: #4c1d95; border-color: #a78bfa; ${quedan <= 0 ? "opacity: 0.5;" : ""}">✨ ${h.nombre} (${quedan})</button>`;
    }).join("");
}
