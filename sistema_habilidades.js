// sistema_habilidades.js — Lógica y pantallas de las habilidades (los datos están en base_datos/habilidades.js)
// Normalmente NO necesitas editar este archivo para agregar habilidades nuevas.
//
// ÁRBOL DE HABILIDADES
//   Cada habilidad puede decir de cuál depende:  requiere: "golpe_brutal"
//   En la pantalla solo se ven las que YA tienes y las que cuelgan directamente de ellas.
//   Al aprender una, aparecen las siguientes. Lo demás sigue oculto.
//
// Lo que se guarda en window.jugador (así se guarda solo con la partida):
//   habilidades   ids de las habilidades aprendidas ["golpe_brutal", "recio"]

// ---------- Consultas ----------

function habilidadDef(id) {
    return (window.dbHabilidades && window.dbHabilidades[id]) || null;
}

function idsHabilidadesAprendidas(j = window.jugador) {
    return (j && j.habilidades) || [];
}

function tieneHabilidad(id, j = window.jugador) {
    return idsHabilidadesAprendidas(j).includes(id);
}

// Habilidades que enseñan las clases del jugador (la actual y las anteriores), sin repetir.
// Aquí está la exclusividad de rama entre clases: lo que enseña otra rama nunca aparece.
function idsHabilidadesOfrecidas(j = window.jugador) {
    const ids = [];
    if (typeof clasesDe !== "function") return ids;
    clasesDe(j).forEach(c => (c.habilidades || []).forEach(id => {
        if (typeof id !== "string") return; // formato antiguo (habilidad escrita dentro de la clase)
        if (ids.includes(id)) return;
        if (!habilidadDef(id)) { console.warn(`Habilidad no encontrada en dbHabilidades: "${id}"`); return; }
        ids.push(id);
    }));
    return ids;
}

// Ids de las habilidades que hay que tener ANTES (siempre como lista)
function requiereDe(id) {
    const def = habilidadDef(id);
    if (!def || !def.requiere) return [];
    return Array.isArray(def.requiere) ? def.requiere : [def.requiere];
}

// Si otra habilidad de la misma rama exclusiva ya fue aprendida, devuelve su id
function habilidadQueBloquea(id, j = window.jugador) {
    const def = habilidadDef(id);
    if (!def || !def.exclusivo) return null;
    return idsHabilidadesAprendidas(j).find(otra => {
        const d = habilidadDef(otra);
        return otra !== id && d && d.exclusivo === def.exclusivo;
    }) || null;
}

// Las otras habilidades de la misma rama que el jugador podría haber elegido
function alternativasExclusivas(id, j = window.jugador) {
    const def = habilidadDef(id);
    if (!def || !def.exclusivo) return [];
    return idsHabilidadesOfrecidas(j).filter(otra => otra !== id && habilidadDef(otra).exclusivo === def.exclusivo);
}

// Estado de una habilidad:
//   aprendida   ya la tienes
//   padresOk    ya tienes las habilidades de las que depende
//   visible     se muestra en el árbol (la tienes, o cuelga de algo que tienes)
//   disponible  puedes aprenderla ahora mismo
function estadoHabilidad(id, j = window.jugador) {
    const def = habilidadDef(id);
    const aprendida = tieneHabilidad(id, j);
    const reqs = (def.requisitos || []).map(evaluarRequisito);
    const cumple = reqs.every(r => r.ok);
    const padresOk = requiereDe(id).every(p => tieneHabilidad(p, j));
    const bloqueadaPor = aprendida ? null : habilidadQueBloquea(id, j);
    return {
        aprendida: aprendida, reqs: reqs, cumple: cumple, padresOk: padresOk, bloqueadaPor: bloqueadaPor,
        visible: aprendida || (padresOk && !bloqueadaPor),
        disponible: !aprendida && padresOk && cumple && !bloqueadaPor
    };
}

// ¿Hay algo que el jugador pueda aprender y todavía no haya aprendido? (marca ❗)
function hayHabilidadDisponible() {
    if (!window.jugador || !window.dbHabilidades) return false;
    return idsHabilidadesOfrecidas().some(id => !habilidadDef(id).auto && estadoHabilidad(id).disponible);
}

// ---------- Aprender ----------

// Aprende sin avisos ni refrescar el HUD (la usan aprenderHabilidad y las automáticas)
function registrarAprendizaje(id) {
    const j = window.jugador;
    const def = habilidadDef(id);
    j.habilidades = idsHabilidadesAprendidas(j).concat(id);

    // Bonus permanentes de las pasivas (igual que los de raza y clase)
    Object.entries(def.stats || {}).forEach(([clave, valor]) => {
        j.stats[clave] = (j.stats[clave] || 0) + valor;
    });
    if (def.stats && def.stats.vidaMax) {
        j.stats.vida = Math.min(j.stats.vidaMax, j.stats.vida + def.stats.vidaMax);
    }
    if (typeof def.alAprender === "function") def.alAprender(j);
}

function aprenderHabilidad(id) {
    const def = habilidadDef(id);
    if (!def || !idsHabilidadesOfrecidas().includes(id) || !estadoHabilidad(id).disponible) {
        mostrarAviso("Todavía no puedes aprender esa habilidad.");
        return false;
    }
    registrarAprendizaje(id);
    actualizarHUD();
    return true;
}

// Aprende solas las habilidades con auto: true en cuanto se cumplen sus requisitos.
// Se llama desde actualizarHUD (mira el final de este archivo), así que también arregla partidas viejas.
function revisarHabilidades() {
    const j = window.jugador;
    if (!j || !window.dbHabilidades) return;

    const nuevas = [];
    let aprendioAlgo = true;
    for (let vuelta = 0; aprendioAlgo && vuelta < 10; vuelta++) { // una auto puede abrir otra auto
        aprendioAlgo = false;
        idsHabilidadesOfrecidas(j).forEach(id => {
            if (habilidadDef(id).auto && estadoHabilidad(id, j).disponible) {
                registrarAprendizaje(id);
                nuevas.push(habilidadDef(id).nombre);
                aprendioAlgo = true;
            }
        });
    }

    // Se avisa después, para no pisar el mensaje que esté saliendo ahora (victoria, nivel, clase...)
    if (nuevas.length && typeof anadirAviso === "function" && !document.body.classList.contains("modo-menu")) {
        setTimeout(() => anadirAviso(`✨ Nueva habilidad: ${nuevas.join(", ")}.`), 0);
    }
}

// ---------- Efectos en el juego ----------

// Pasivas aprendidas: aportan efectos igual que una raza o una clase (ver fuentesDeEfectos)
function pasivasDe(j = window.jugador) {
    return idsHabilidadesAprendidas(j).map(habilidadDef).filter(d => d && d.tipo === "pasiva");
}

// Activas aprendidas, listas para los botones de combate
function habilidadesActivasJugador(j = window.jugador) {
    return idsHabilidadesAprendidas(j).map(id => {
        const d = habilidadDef(id);
        return (d && d.tipo === "activa") ? Object.assign({ id: id, clave: "hab_" + id }, d) : null;
    }).filter(Boolean);
}

// ---------- Pantallas: el árbol ----------

// Habilidades agrupadas por la clase que las enseña
// (cada habilidad cuenta en la primera clase que la ofrece)
function gruposDeHabilidades(j = window.jugador) {
    const grupos = [];
    const vistas = [];
    if (typeof clasesDe !== "function") return grupos;
    clasesDe(j).forEach(c => {
        const ids = (c.habilidades || []).filter(id => typeof id === "string" && habilidadDef(id) && !vistas.includes(id));
        ids.forEach(id => vistas.push(id));
        if (ids.length) grupos.push({ clase: c, ids: ids });
    });
    return grupos;
}

// Tarjeta de una habilidad. sinBoton: para la pantalla de confirmación
function htmlTarjetaHabilidad(id, sinBoton = false, enRama = false) {
    const def = habilidadDef(id);
    const est = estadoHabilidad(id);
    const estado = est.aprendida ? "aprendida" : (est.disponible ? "lista" : "bloqueada");
    const tipo = def.tipo === "activa" ? (def.mana ? `Activa · ${def.mana} MP` : `Activa · ${def.usos || 1} por combate`) : "Pasiva";
    const efectos = def.tipo === "pasiva" ? resumenEfectos(def) : "";
    const marca = est.aprendida ? "✔" : (est.disponible ? "✨" : "🔒");

    let rama = "";
    if (def.exclusivo) {
        const grupo = window.gruposHabilidades && window.gruposHabilidades[def.exclusivo];
        const otras = alternativasExclusivas(id).map(o => habilidadDef(o).nombre).join(", ");
        rama = est.aprendida
            ? (otras ? `<p class="arbol-nota">🔀 Elegiste esta; descartaste: ${otras}</p>` : "")
            : enRama ? "" : `<p class="arbol-nota">🔀 ${grupo ? grupo.nombre : "Rama exclusiva"}: solo puedes elegir una${otras ? ` (alternativa: ${otras})` : ""}</p>`;
    }

    let pie = "";
    if (est.aprendida) {
        pie = `<p class="arbol-ok">✔ Aprendida</p>`;
    } else {
        if (est.reqs.length) pie += `<ul class="arbol-reqs">${htmlRequisitosClase(est.reqs)}</ul>`;
        if (!est.cumple) {
            pie += `<p class="arbol-falta">Aún no cumples los requisitos.</p>`;
        } else if (def.auto) {
            pie += `<p class="arbol-falta">Se aprenderá sola.</p>`;
        } else if (!sinBoton) {
            const accion = def.exclusivo ? `abrirConfirmarHabilidad('${id}')` : `confirmarHabilidad('${id}')`;
            pie += `<button onclick="${accion}" class="boton-opcion boton-primario arbol-boton">${def.exclusivo ? "Elegir esta habilidad" : "Aprender"}</button>`;
        }
    }

    return `
        <div class="arbol-tarjeta ${estado}">
            <div class="arbol-cab">
                <span class="arbol-nombre">${marca} ${def.icono || "✨"} ${def.nombre}</span>
                <span class="arbol-chip ${def.tipo}">${tipo}</span>
            </div>
            <p class="arbol-desc">${def.descripcion || ""}</p>
            ${efectos ? `<p class="arbol-efectos">${efectos}</p>` : ""}
            ${rama}
            ${pie}
        </div>`;
}

// Un nodo del árbol: su tarjeta y, debajo, lo que cuelga de él (solo lo visible)
function htmlNodoArbol(id, visibles, enRama = false) {
    const hijos = visibles.filter(h => h !== id && requiereDe(h)[0] === id);
    return `
        <div class="arbol-nodo">
            ${htmlTarjetaHabilidad(id, false, enRama)}
            ${hijos.length ? `<div class="arbol-hijos">${htmlHijosArbol(hijos, visibles)}</div>` : ""}
        </div>`;
}

// Los hermanos de una rama exclusiva se agrupan en una caja ("elige una")
function htmlHijosArbol(hijos, visibles) {
    const hechos = [];
    let html = "";
    hijos.forEach(id => {
        if (hechos.includes(id)) return;
        const def = habilidadDef(id);
        const hermanos = def.exclusivo ? hijos.filter(h => habilidadDef(h).exclusivo === def.exclusivo) : [id];
        hermanos.forEach(h => hechos.push(h));

        if (hermanos.length > 1) {
            const grupo = window.gruposHabilidades && window.gruposHabilidades[def.exclusivo];
            html += `
                <div class="arbol-nodo arbol-rama">
                    <p class="arbol-rama-titulo">🔀 Elige una · ${grupo ? grupo.nombre : "Rama exclusiva"}</p>
                    ${hermanos.map(h => htmlNodoArbol(h, visibles, true)).join("")}
                </div>`;
        } else {
            html += htmlNodoArbol(id, visibles);
        }
    });
    return html;
}

function abrirPantallaHabilidades() {
    mostrarPantallaPersonaje();
    const pantalla = document.getElementById("pantalla-inventario");
    let html = `<h2>✨ HABILIDADES</h2>${htmlPestanasPersonaje("habilidades")}`;

    const grupos = gruposDeHabilidades();
    if (!grupos.length) {
        html += `<p class="arbol-falta">Las habilidades las enseñan las clases. Elige una clase para empezar a aprenderlas.</p>`;
    } else {
        const ofrecidas = idsHabilidadesOfrecidas();
        const estados = ofrecidas.map(id => estadoHabilidad(id));
        const aprendidas = estados.filter(e => e.aprendida).length;
        const paraAprender = ofrecidas.filter(id => !habilidadDef(id).auto && estadoHabilidad(id).disponible).length;
        const ocultas = ofrecidas.filter((id, i) => !estados[i].visible && !estados[i].bloqueadaPor).length;

        html += `<p class="arbol-resumen">✔ ${aprendidas} aprendida${aprendidas === 1 ? "" : "s"}${paraAprender ? ` · ❗ ${paraAprender} para aprender` : ""}</p>`;

        html += `<div class="arbol">` + grupos.map(g => {
            const visibles = g.ids.filter(id => estadoHabilidad(id).visible);
            // Raíces: las visibles que no cuelgan de otra de este mismo grupo
            const raices = visibles.filter(id => !g.ids.includes(requiereDe(id)[0]));
            return `
                <p class="arbol-clase">${g.clase.icono || ""} ${g.clase.nombre}</p>
                ${htmlHijosArbol(raices, visibles)}`;
        }).join("") + `</div>`;

        if (ocultas > 0) {
            html += `<p class="arbol-pista">🔭 Se revelarán más habilidades a medida que desbloquees estas.</p>`;
        }
    }

    pantalla.innerHTML = html;
    botonVolverPersonaje(pantalla);
}

// Las ramas exclusivas piden confirmación porque descartan a las demás
function abrirConfirmarHabilidad(id) {
    const def = habilidadDef(id);
    if (!def) return;
    mostrarPantallaPersonaje();
    const pantalla = document.getElementById("pantalla-inventario");
    const descartadas = alternativasExclusivas(id).map(o => habilidadDef(o).nombre).join(", ");

    pantalla.innerHTML = `
        <h2>${def.icono || "✨"} ${def.nombre}</h2>
        <div class="arbol">${htmlTarjetaHabilidad(id, true)}</div>
        <p class="arbol-falta">Es una decisión permanente${descartadas ? `: descartarás ${descartadas}` : ""}.</p>
        <button onclick="confirmarHabilidad('${id}')" class="boton-opcion boton-primario" style="margin-top: 10px;">Aprender ${def.nombre}</button>
        <button onclick="abrirPantallaHabilidades()" class="boton-opcion" style="margin-top: 10px;">⬅ Volver</button>
    `;
}

function confirmarHabilidad(id) {
    const def = habilidadDef(id);
    if (aprenderHabilidad(id)) mostrarAviso(`✨ Has aprendido ${def.nombre}.`);
    abrirPantallaHabilidades();
}

// Bloque para la hoja de personaje (pantalla Estado): lo aprendido hasta ahora
function htmlBloqueHabilidadesAprendidas() {
    const ids = idsHabilidadesAprendidas();
    if (!ids.length) return "";
    const filas = ids.map(habilidadDef).filter(Boolean).map(d => {
        const esActiva = d.tipo === "activa";
        const color = esActiva ? "#c4b5fd" : "#86efac";
        const detalle = esActiva ? (d.mana ? `${d.mana} MP` : `${d.usos || 1} por combate`) : (resumenEfectos(d) || "pasiva");
        return `<p style="font-size: 11px; color: ${color}; margin: 4px 0 0 0;">${d.icono || "✨"} <b>${d.nombre}</b> (${detalle}): ${d.descripcion || ""}</p>`;
    }).join("");
    return `<p style="color: #f3e5ab; font-size: 12px; margin: 6px 0 0 0;">✨ Habilidades</p>${filas}`;
}

// ---------- Conexión con el juego ----------
// Se engancha a actualizarHUD (que se ejecuta al subir de nivel, elegir clase, registrar acciones...)
// para aprender las habilidades automáticas y marcar el ❗ en el botón Personaje.
// Se hace al terminar de cargar la página porque actualizarHUD se define en ui.js, que carga después.
window.addEventListener("load", () => {
    const original = window.actualizarHUD;
    if (typeof original !== "function" || original.__conHabilidades) return;

    const conHabilidades = function () {
        const resultado = original.apply(this, arguments);
        if (window.jugador) {
            revisarHabilidades();
            if (typeof revisarClases === "function") revisarClases();
        }
        return resultado;
    };
    conHabilidades.__conHabilidades = true;
    window.actualizarHUD = conHabilidades;
});
