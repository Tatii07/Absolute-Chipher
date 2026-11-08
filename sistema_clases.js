// sistema_clases.js — Lógica y pantallas de las clases (los datos están en base_datos/clases.js)
// Normalmente NO necesitas editar este archivo para agregar clases nuevas.
//
// Lo que se guarda en window.jugador (así se guarda solo con la partida):
//   clase           id de la clase actual (null = Sin Clase)
//   clasesPrevias   ids de las clases anteriores ["guerrero"]
//   registro        contadores de lo que has hecho { danoRecibido: 40, ... }
//   avisoClase      última etapa en la que se avisó "ya puedes elegir clase"

// ---------- Registro de lo que hace el jugador ----------

function registroDe(clave) {
    const r = window.jugador && window.jugador.registro;
    return (r && r[clave]) || 0;
}

function registrarAccion(clave, cantidad = 1) {
    const j = window.jugador;
    if (!j) return;
    if (!j.registro) j.registro = {};
    j.registro[clave] = (j.registro[clave] || 0) + cantidad;
}

function registrarDerrota(idEnemigo) {
    registrarAccion("enemigosDerrotados");
    registrarAccion("derrotados:" + idEnemigo);
}

// Cuenta cada lugar (escena) distinto la primera vez que se visita
function registrarLugar(nombreEscena) {
    if (!window.jugador) return;
    const clave = "lugar:" + nombreEscena;
    if (!registroDe(clave)) {
        registrarAccion(clave);
        registrarAccion("lugaresVisitados");
    }
}

// ---------- Consultas ----------

function idsClasesJugador(j = window.jugador) {
    if (!j) return [];
    return (j.clasesPrevias || []).concat(j.clase ? [j.clase] : []);
}

function claseActual(j = window.jugador) {
    return (j && j.clase && window.dbClases && window.dbClases[j.clase]) || null;
}

// Todas las clases que tiene el jugador (la actual y las anteriores): sus efectos se acumulan
function clasesDe(j = window.jugador) {
    if (!window.dbClases) return [];
    return idsClasesJugador(j).map(id => window.dbClases[id]).filter(Boolean);
}

// Habilidades de combate de todas las clases del jugador
function habilidadesDeClases(j = window.jugador) {
    const lista = [];
    idsClasesJugador(j).forEach(id => {
        const def = window.dbClases && window.dbClases[id];
        if (!def) return;
        // Solo el formato antiguo (habilidad escrita dentro de la clase). Los ids van por sistema_habilidades.js
        (def.habilidades || []).filter(h => typeof h === "object").forEach(h => lista.push(Object.assign({ clave: `clase_${id}_${h.id}` }, h)));
    });
    return lista;
}

// Clases que el jugador PODRÍA elegir ahora (según la que tiene): básicas si no tiene, o sus evoluciones
function idsClasesElegibles(j = window.jugador) {
    if (!window.dbClases) return [];
    return Object.keys(window.dbClases).filter(id => {
        const def = window.dbClases[id];
        return j.clase ? def.evolucionaDe === j.clase : !def.evolucionaDe;
    });
}

// ---------- Requisitos ----------

function evaluarRequisito(r) {
    let actual = 0;
    let texto = r.texto;
    if (r.tipo === "nivel") {
        actual = window.jugador.nivel || 0;
        texto = texto || `Nivel ${r.meta}`;
    } else if (r.tipo === "registro") {
        actual = registroDe(r.clave);
    } else if (r.tipo === "flag") {
        actual = window[r.clave] ? 1 : 0;
    }
    const meta = r.meta != null ? r.meta : 1;
    return { texto: texto || r.clave, actual: actual, meta: meta, ok: actual >= meta };
}

function estadoPuertaClases() {
    const reqs = (window.puertaClases ? window.puertaClases.requisitos : []).map(evaluarRequisito);
    return { reqs: reqs, ok: reqs.every(r => r.ok) };
}

// Estado de una clase: ¿se puede elegir ya? y cómo van sus requisitos
function estadoClase(id) {
    const def = window.dbClases[id];
    const propios = (def.requisitos || []).map(evaluarRequisito);
    const puerta = def.evolucionaDe ? { ok: true, reqs: [] } : estadoPuertaClases();
    return { puerta: puerta, propios: propios, cumple: puerta.ok && propios.every(r => r.ok) };
}

function hayClaseDisponible() {
    if (!window.jugador || !window.dbClases) return false;
    return idsClasesElegibles().some(id => estadoClase(id).cumple);
}

// ---------- Elegir clase ----------

function elegirClase(id) {
    const j = window.jugador;
    const def = window.dbClases && window.dbClases[id];
    if (!def) return false;

    if (!idsClasesElegibles().includes(id) || !estadoClase(id).cumple) {
        mostrarAviso("Todavía no puedes elegir esa clase.");
        return false;
    }

    if (j.clase) j.clasesPrevias = (j.clasesPrevias || []).concat(j.clase);
    j.clase = id;

    // Bonus permanentes (igual que los de raza y especialidad)
    Object.entries(def.stats || {}).forEach(([clave, valor]) => {
        j.stats[clave] = (j.stats[clave] || 0) + valor;
    });
    if (def.stats && def.stats.vidaMax) {
        j.stats.vida = Math.min(j.stats.vidaMax, j.stats.vida + def.stats.vidaMax);
    }
    (def.items || []).forEach(it => ganarItem(it.id, it.cantidad || 1));
    if (def.oro) j.oro += def.oro;
    if (typeof def.alElegir === "function") def.alElegir(j);

    actualizarHUD();
    return true;
}

// ---------- Ayudas para escribir habilidades (se usan en base_datos/clases.js) ----------

// Golpe basado en tu ataque normal. multiplicador 1.5 = 150% del daño
function golpeHabilidad(enemigo, multiplicador, ignoraDefensa = false) {
    const ataque = Math.round(ataqueJugador() * multiplicador);
    const dano = tirarDano(ataque, ignoraDefensa ? 0 : (enemigo.defensa || 0));
    enemigo.vida -= dano;
    return dano;
}

// Daño mágico: ignora la defensa, con una pequeña variación (±10%)
function danoMagico(enemigo, cantidad) {
    const dano = Math.max(1, Math.round(cantidad * (0.9 + Math.random() * 0.2)));
    enemigo.vida -= dano;
    return dano;
}

// El enemigo no contraataca durante N turnos
function aturdirEnemigo(enemigo, turnos = 1) {
    enemigo.aturdido = (enemigo.aturdido || 0) + turnos;
}

function debilitarEnemigo(enemigo, cantidad) {
    enemigo.fuerza = Math.max(1, enemigo.fuerza - cantidad);
}

function curarJugador(cantidad) {
    const s = window.jugador.stats;
    const antes = s.vida;
    s.vida = Math.min(s.vidaMax, s.vida + cantidad);
    return s.vida - antes;
}

// ---------- Avisos ----------

// Si ya hay un aviso en pantalla, le agrega el texto debajo (así no pisa el de victoria o nivel)
function anadirAviso(texto) {
    const modal = document.getElementById("modal-aviso");
    const t = document.getElementById("modal-texto");
    if (!modal || !t) return;
    if (modal.classList.contains("oculto")) mostrarAviso(texto);
    else t.innerText += "\n\n" + texto;
}

// Se llama desde actualizarHUD(): marca el botón Personaje y avisa una vez por etapa
function revisarClases() {
    const j = window.jugador;
    if (!j || !window.dbClases || document.body.classList.contains("modo-menu")) return;

    const hay = hayClaseDisponible();
    const hayHab = (typeof hayHabilidadDisponible === "function") && hayHabilidadDisponible();

    const botonStats = document.getElementById("btn-stats-fijo");
    if (botonStats) botonStats.innerText = "📊 Personaje" + ((hay || hayHab) ? " ❗" : "");

    const etapa = j.clase || "base";
    if (hay && j.avisoClase !== etapa) {
        j.avisoClase = etapa;
        const texto = j.clase
            ? "⚜️ Tu camino puede evolucionar: ya cumples los requisitos de una clase avanzada. Mira Personaje → Clase."
            : "⚜️ " + window.puertaClases.textoAbierta + " Mira Personaje → Clase.";
        // Esperamos a que termine el turno/nivel actual para no pisar sus mensajes
        setTimeout(() => anadirAviso(texto), 0);
    }
}

// ---------- Pantallas ----------

function htmlRequisitosClase(lista) {
    return lista.map(r => {
        const progreso = r.meta > 1 ? ` (${Math.min(r.actual, r.meta)}/${r.meta})` : "";
        return `<li class="${r.ok ? "req-ok" : "req-falta"}">${r.ok ? "✔" : "✖"} ${r.texto}${progreso}</li>`;
    }).join("");
}

// En la tarjeta de una clase solo se muestran sus habilidades iniciales (las raíces del árbol);
// el resto se descubre en Personaje → Habilidades
function htmlHabilidadesClase(def) {
    const lista = def.habilidades || [];
    let html = lista.filter(h => typeof h === "object").map(h =>
        `<li>⚡ <b>${h.nombre}</b> (${h.usos || 1} por combate): ${h.descripcion || ""}</li>`
    ).join("");

    const ids = lista.filter(h => typeof h === "string" && typeof habilidadDef === "function" && habilidadDef(h));
    if (ids.length) {
        const raices = ids.filter(id => !habilidadDef(id).requiere);
        html += raices.map(id => {
            const d = habilidadDef(id);
            return `<li>${d.icono || "⚡"} <b>${d.nombre}</b>: ${d.descripcion || ""}</li>`;
        }).join("");
        const mas = ids.length - raices.length;
        if (mas > 0) html += `<li>🌳 Y ${mas} habilidad${mas === 1 ? "" : "es"} más que se desbloquean en el árbol</li>`;
    }
    return html;
}

function htmlTarjetaClase(id, esActual) {
    const def = window.dbClases[id];
    const efectos = resumenEfectos(def);
    const habs = htmlHabilidadesClase(def);
    let pie = "";
    let estado = "";

    if (!esActual) {
        const est = estadoClase(id);
        const reqs = htmlRequisitosClase(est.propios);
        if (reqs) pie += `<p class="clase-sub">Requisitos</p><ul class="clase-reqs">${reqs}</ul>`;
        pie += est.cumple
            ? `<button onclick="abrirConfirmarClase('${id}')" class="boton-opcion boton-primario" style="margin-top: 10px; width: 100%;">Elegir esta clase</button>`
            : `<p class="clase-falta">Aún no cumples los requisitos.</p>`;
        estado = est.cumple ? "lista" : "bloqueada";
    }

    return `
        <div class="clase-tarjeta ${esActual ? "actual" : estado}">
            <div class="clase-cabecera">
                <span class="nombre-item">${def.icono || ""} ${def.nombre}</span>
                <span class="clase-tier">Tier ${def.tier || 1}</span>
            </div>
            <p class="clase-desc">${def.descripcion || ""}</p>
            ${efectos ? `<p class="clase-efectos">${efectos}</p>` : ""}
            ${habs ? `<ul class="clase-lista">${habs}</ul>` : ""}
            ${pie}
        </div>`;
}

function abrirPantallaClase() {
    mostrarPantallaPersonaje();
    const pantalla = document.getElementById("pantalla-inventario");
    const j = window.jugador;
    const actual = claseActual(j);

    // Camino recorrido: Sin Clase → Guerrero → Berserker
    const camino = ["⛓️ Sin Clase"].concat(idsClasesJugador(j).map(id => {
        const d = window.dbClases[id];
        return d ? `${d.icono || ""} ${d.nombre}` : id;
    })).join(" → ");

    let html = `<h2>⚜️ CLASE</h2>${htmlPestanasPersonaje("clase")}<p class="clase-camino">${camino}</p>`;

    if (actual) {
        html += `<div class="grid-inventario">${htmlTarjetaClase(j.clase, true)}</div>`;
    } else {
        const puerta = estadoPuertaClases();
        html += `
            <div class="clase-puerta ${puerta.ok ? "abierta" : "cerrada"}">
                <p>${puerta.ok ? window.puertaClases.textoAbierta : window.puertaClases.textoCerrada}</p>
                <ul class="clase-reqs">${htmlRequisitosClase(puerta.reqs)}</ul>
            </div>`;
    }

    const elegibles = idsClasesElegibles(j);
    if (elegibles.length) {
        html += `<p class="clase-sub">${actual ? "Caminos de evolución" : "Clases básicas (Tier 1)"}</p>
                 <div class="grid-inventario">${elegibles.map(id => htmlTarjetaClase(id, false)).join("")}</div>`;
    } else if (actual) {
        html += `<p class="clase-falta">Has llegado al final de tu camino por ahora.</p>`;
    }

    pantalla.innerHTML = html;
    botonVolverPersonaje(pantalla);
}

function abrirConfirmarClase(id) {
    const def = window.dbClases[id];
    if (!def) return;
    mostrarPantallaPersonaje();
    const pantalla = document.getElementById("pantalla-inventario");

    pantalla.innerHTML = `
        <h2>${def.icono || ""} ${def.nombre}</h2>
        <div class="grid-inventario">${htmlTarjetaClase(id, true)}</div>
        <p class="clase-falta">Es una decisión permanente. Piénsalo bien.</p>
        <button onclick="confirmarClase('${id}')" class="boton-opcion boton-primario" style="margin-top: 10px;">Convertirme en ${def.nombre}</button>
        <button onclick="abrirPantallaClase()" class="boton-opcion" style="margin-top: 10px;">⬅ Volver</button>
    `;
}

function confirmarClase(id) {
    const def = window.dbClases[id];
    if (elegirClase(id)) mostrarAviso(`⚜️ Ahora eres ${def.nombre}.`);
    abrirPantallaClase();
}

// Fila "Clase" para la hoja de personaje (pantalla Estado)
function htmlFilaClase() {
    const c = claseActual();
    return `<div class="slot-objeto"><span>Clase:</span> <span class="nombre-item">${c ? `${c.icono || ""} ${c.nombre}` : "⛓️ Sin Clase"}</span></div>`;
}
