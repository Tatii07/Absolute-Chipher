// creacion.js — Pantalla de creación de personaje (se abre al pulsar "Nueva Partida")
//
// PARA AGREGAR COSAS EN EL FUTURO (clase, apariencia, dificultad...):
// añade un objeto nuevo a window.camposCreacion con:
//   render()   -> HTML del campo
//   leer()     -> objeto con los datos que aporta, ej. { clase: "guerrero" }
//   validar()  -> (opcional) devuelve un texto de error, o null si está bien
// Todo lo que devuelvan los leer() se copia a window.jugador al empezar.

window.camposCreacion = [
    {
        id: "nombre",
        render: () => `
            <label for="input-nombre-personaje" style="color: #94a3b8; font-size: 12px; display: block; margin-bottom: 6px;">
                Nombre del personaje
            </label>
            <input id="input-nombre-personaje" type="text" maxlength="16"
                   placeholder="Ej: Julliet" autocomplete="off"
                   onkeydown="if (event.key === 'Enter') confirmarCreacion()"
                   style="width: 100%; box-sizing: border-box; padding: 10px; background: #0f172a;
                          border: 2px solid #c9a050; border-radius: 6px; color: #f8fafc;
                          font-family: 'Cinzel', serif; font-size: 14px; text-align: center; outline: none;">
        `,
        leer: () => {
            const limpio = document.getElementById("input-nombre-personaje").value
                .replace(/[<>&"'`]/g, "")   // evita romper el HTML (el nombre se muestra con innerHTML)
                .trim();
            return { nombre: limpio };
        },
        validar: () => {
            const { nombre } = window.camposCreacion[0].leer();
            return nombre.length === 0 ? "Escribe un nombre para tu personaje." : null;
        }
    },
    {
        id: "raza",
        render: () => `<div id="campo-raza">${htmlSelectorRaza()}</div>`,
        leer: () => (window.seleccionCreacion.raza ? { raza: window.seleccionCreacion.raza } : {}),
        validar: () => {
            const hayRazas = window.dbRazas && Object.keys(window.dbRazas).length > 0;
            return (hayRazas && !window.seleccionCreacion.raza) ? "Elige una raza para tu personaje." : null;
        }
    },
    {
        id: "especialidad",
        render: () => `<div id="campo-especialidad">${htmlSelectorEspecialidad()}</div>`,
        leer: () => (window.seleccionCreacion.especialidad ? { especialidad: window.seleccionCreacion.especialidad } : {}),
        validar: () => {
            const raza = window.dbRazas && window.dbRazas[window.seleccionCreacion.raza];
            const hayEsp = raza && (raza.especialidades || []).length > 0;
            return (hayEsp && !window.seleccionCreacion.especialidad) ? "Elige una especialidad." : null;
        }
    }
    // { id: "dificultad", render: () => `...`, leer: () => ({ dificultad: ... }) },
];

// ---------- Selección de raza y especialidad ----------

window.seleccionCreacion = { raza: null, especialidad: null };

function tarjetaCreacion(def, seleccionada, alClick) {
    return `
        <div onclick="${alClick}" style="cursor: pointer; padding: 10px; border: 2px solid ${seleccionada ? "#c9a050" : "#334155"}; border-radius: 6px; background: ${seleccionada ? "#1e293b" : "#0f172a"}; text-align: left;">
            <div style="font-weight: bold; color: #f3e5ab; font-size: 14px;">${def.icono || ""} ${def.nombre}</div>
            ${seleccionada ? htmlDetalleFuente(def) : ""}
        </div>`;
}

function htmlSelectorRaza() {
    const razas = window.dbRazas || {};
    const ids = Object.keys(razas);
    if (ids.length === 0) return "";

    return `
        <label style="color: #94a3b8; font-size: 12px; display: block; margin-bottom: 6px;">Raza</label>
        <div style="display: flex; flex-direction: column; gap: 6px;">
            ${ids.map(id => tarjetaCreacion(razas[id], window.seleccionCreacion.raza === id, `elegirRaza('${id}')`)).join("")}
        </div>`;
}

function htmlSelectorEspecialidad() {
    const raza = window.dbRazas && window.dbRazas[window.seleccionCreacion.raza];
    if (!window.dbRazas || Object.keys(window.dbRazas).length === 0) return "";

    if (!raza) {
        return `<p style="color: #64748b; font-size: 11px; margin: 0;">Elige una raza para ver sus especialidades.</p>`;
    }

    const ids = (raza.especialidades || []).filter(id => window.dbEspecialidades && window.dbEspecialidades[id]);
    if (ids.length === 0) return "";

    return `
        <label style="color: #94a3b8; font-size: 12px; display: block; margin-bottom: 6px;">Especialidad</label>
        <div style="display: flex; flex-direction: column; gap: 6px;">
            ${ids.map(id => tarjetaCreacion(window.dbEspecialidades[id], window.seleccionCreacion.especialidad === id, `elegirEspecialidad('${id}')`)).join("")}
        </div>`;
}

function refrescarSelectoresCreacion() {
    const r = document.getElementById("campo-raza");
    const e = document.getElementById("campo-especialidad");
    if (r) r.innerHTML = htmlSelectorRaza();
    if (e) e.innerHTML = htmlSelectorEspecialidad();
}

function elegirRaza(id) {
    window.seleccionCreacion.raza = id;
    window.seleccionCreacion.especialidad = null; // cada raza tiene sus propias especialidades
    refrescarSelectoresCreacion();
}

function elegirEspecialidad(id) {
    window.seleccionCreacion.especialidad = id;
    refrescarSelectoresCreacion();
}

function abrirCreacionPersonaje() {
    window.seleccionCreacion = { raza: null, especialidad: null };
    const bloqueMenuInicio = document.getElementById("bloque-menu-inicio");
    const contenedorBotones = document.querySelector(".opciones-container");
    const pantalla = document.getElementById("pantalla-inventario");

    if (bloqueMenuInicio) bloqueMenuInicio.style.display = "none";
    contenedorBotones.style.display = "none";

    pantalla.classList.remove("oculto");
    pantalla.innerHTML = `
        <h2 style="color: #f3e5ab; margin-bottom: 15px;">🧑 CREA A TU PERSONAJE</h2>
        <div style="display: flex; flex-direction: column; gap: 14px; width: 92%; max-width: 300px; margin: 0 auto;">
            ${window.camposCreacion.map(c => c.render()).join("")}
            <button onclick="confirmarCreacion()" class="boton-opcion" style="background: #0284c7;">▶ Comenzar aventura</button>
            <button onclick="cancelarCreacion()" class="boton-opcion" style="background: #1e293b;">⬅ Volver</button>
        </div>
    `;

    const primerInput = pantalla.querySelector("input");
    if (primerInput) primerInput.focus();
}

function cerrarPantallaCreacion() {
    const contenedorBotones = document.querySelector(".opciones-container");
    document.getElementById("pantalla-inventario").classList.add("oculto");
    contenedorBotones.style.display = "flex";
}

function cancelarCreacion() {
    cerrarPantallaCreacion();
    cargarEscena("menu"); // vuelve a dibujar el menú principal
}

function confirmarCreacion() {
    // 1. Validar todos los campos
    for (const campo of window.camposCreacion) {
        const error = campo.validar ? campo.validar() : null;
        if (error) {
            mostrarAviso(error);
            return;
        }
    }

    // 2. Juntar los datos de todos los campos
    const datos = {};
    window.camposCreacion.forEach(c => Object.assign(datos, c.leer()));

    // 3. Empezar la partida con esos datos
    cerrarPantallaCreacion();
    nuevaPartida(datos);
}
