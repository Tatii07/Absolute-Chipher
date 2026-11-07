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
    }
    // { id: "clase", render: () => `...`, leer: () => ({ clase: ... }) },
];

function abrirCreacionPersonaje() {
    const bloqueMenuInicio = document.getElementById("bloque-menu-inicio");
    const contenedorBotones = document.querySelector(".opciones-container");
    const pantalla = document.getElementById("pantalla-inventario");

    if (bloqueMenuInicio) bloqueMenuInicio.style.display = "none";
    contenedorBotones.style.display = "none";

    pantalla.classList.remove("oculto");
    pantalla.innerHTML = `
        <h2 style="color: #f3e5ab; margin-bottom: 15px;">🧑 CREA A TU PERSONAJE</h2>
        <div style="display: flex; flex-direction: column; gap: 14px; width: 90%; max-width: 260px; margin: 0 auto;">
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
