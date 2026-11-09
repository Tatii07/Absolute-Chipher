// menu.js — Escena del menú principal + REGISTRO DEL JUEGO (lo implementado y las ideas futuras)
//
// CÓMO USAR EL REGISTRO
//   Todo se escribe en window.registroJuego, aquí abajo. No hay que tocar nada más.
//
//   Para anotar algo que ya hiciste:  copia un bloque de "implementado" y ponlo ARRIBA del todo
//   (el primero es el más nuevo y se muestra abierto).
//        { titulo: "Nombre del cambio", fecha: "2026-11-08", notas: ["Qué hace", "Otro detalle"] }
//      fecha es opcional.
//
//   Para anotar una idea:  añade un bloque a "ideas".
//        { titulo: "Nombre de la idea", estado: "idea", detalle: "Explicación breve" }
//      estado: "idea" (💭 solo se me ocurrió) · "planeado" (📌 lo voy a hacer) · "encurso" (🔧 lo estoy haciendo)
//      detalle es opcional.
//   Cuando termines una idea, bórrala de "ideas" y anótala en "implementado".

window.registroJuego = {
    version: "0.0",

    // ---------- LO IMPLEMENTADO (lo más nuevo, arriba) ----------
    implementado: [
        {
            titulo: "Actualización de UI y Pantalla de Inicio", fecha: "2026-11-08",
            notas: [
                "Rediseño visual de la interfaz con la estética de fantasía oscura y los bordes dorados.",
                "Integración del logo oficial del juego en la pantalla de inicio principal.",
                "Ajuste de los menús de navegación, botones y contenedores de texto."
            ]
        },
        {
            titulo: "Nueva Raza Draconix y Sistema de Razas/Especialidades", fecha: "2026-11-08",
            notas: [
                "Implementación de la raza Draconix junto a Humano, Enano, Elfo y Orco en la creación de personajes.",
                "Selección de especialidades iniciales (como minero) que otorgan bonificaciones pasivas.",
                "Definición de estadísticas base según la raza y especialidad elegida."
            ]
        },
        {
            titulo: "Clases básicas, avanzadas y estadísticas de Mago", fecha: "2026-11-08",
            notas: [
                "Implementación del sistema de clases básicas y avanzadas al progresar en la aventura.",
                "Mecánica de clase Mago: al seleccionarla, el personaje pierde la mayor parte de su fuerza física a cambio de Inteligencia pura.",
                "Evolución y árbol de habilidades ligado directamente a la clase seleccionada."
            ]
        },
        {
            titulo: "Sistema de maná", fecha: "2026-11-08",
            notas: [
                "Barra de MP en el HUD, en la hoja de personaje y en el combate.",
                "Maná máximo = 20 + 10 por cada punto de inteligencia (también cuenta la del equipo, la clase y la raza).",
                "Las habilidades mágicas gastan maná en vez de tener usos por combate.",
                "El maná se regenera un 5% por turno de combate y se llena al subir de nivel.",
                "Nueva habilidad Luz Curativa para el Clérigo.",
                "Ayuda restaurarMana(n) para pociones y escenas."
            ]
        },
        {
            titulo: "Combate",
            notas: [
                "Atacar, usar habilidades, usar objetos y huir.",
                "La defensa reduce el mínimo y el máximo del daño recibido.",
                "Efectos de aturdir y debilitar al enemigo.",
                "Recompensas de experiencia y objetos al ganar."
            ]
        },
        {
            titulo: "Equipo, mochila y personaje",
            notas: [
                "Equipo por ranuras con bonus de stats.",
                "Mochila con objetos usables.",
                "3 puntos de stats libres por cada nivel."
            ]
        },
        {
            titulo: "Partida y ambientación",
            notas: [
                "Guardar y continuar partida.",
                "Creación de personaje con nombre.",
                "Sistema de misiones.",
                "Música de fondo."
            ]
        }
    ],

    // ---------- IDEAS FUTURAS ----------
    ideas: [
        { titulo: "Personalizar habilidades de cada clase", estado: "planeado",
          detalle: "Ajustar las skills específicas de cada clase, revisar sus efectos en combate y asegurar que no se crucen descripciones locas como un mago con tajo físico (o dejarlo como easter egg)." },
        { titulo: "Corregir las evoluciones de clase", estado: "planeado",
          detalle: "Alquimista y Hechicero evolucionan de \"aprendiz_arcano\", y Cazador de Tesoros y Acechador de \"explorador\". Esas clases no existen (la del mago se llama \"mago\")." },
        { titulo: "Crear nuevos enemigos y zonas", estado: "planeado",
          detalle: "Diseñar monstruos y jefes para extender la historia más allá de las minas y los primeros niveles." },
        { titulo: "Pensar contenido de NPCs, ítems y lugares", estado: "idea",
          detalle: "Expandir el mundo libre (Sandbox) con comerciantes, interacciones morales y consecuencias por la reputación." },
        { titulo: "Pociones de maná", estado: "planeado",
          detalle: "Consumibles que llamen a restaurarMana(n)." },
        { titulo: "Descanso o campamento", estado: "idea",
          detalle: "Recuperar vida y maná fuera del combate." },
        { titulo: "Estados de varios turnos", estado: "idea",
          detalle: "Escudos, veneno, sangrado... Requiere que el combate recuerde estados por turno." },
        { titulo: "Habilidades de vida", estado: "idea",
          detalle: "Venta, recolección, cocina... independientes de la clase." },
        { titulo: "Especialidades únicas por clase", estado: "idea",
          detalle: "Implementar especialidades y pasivas únicas para cada combinación de clase y raza." }
    ]
};

// ---------- Pantalla del registro ----------

const REGISTRO_ESTADOS = {
    idea:     { icono: "💭", texto: "Idea",     color: "#a89c82" },
    planeado: { icono: "📌", texto: "Planeado", color: "#e6c978" },
    encurso:  { icono: "🔧", texto: "En curso", color: "#8aa65a" }
};

function registroEsc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function registroFecha(f) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f || "");
    return m ? `${m[3]}/${m[2]}/${m[1]}` : registroEsc(f || "");
}

function htmlRegistroImplementado() {
    const lista = window.registroJuego.implementado || [];
    if (!lista.length) return `<p style="color: var(--ceniza); font-size: 13px;">Aún no hay nada anotado.</p>`;
    return lista.map((c, i) => `
        <details ${i === 0 ? "open" : ""} style="text-align: left; margin-bottom: 8px; padding: 8px 10px; border: 2px solid var(--cuero); background: var(--hierro-alto);">
            <summary style="cursor: pointer; font-weight: 700; color: var(--oro-claro); font-size: 15px;">
                ✅ ${registroEsc(c.titulo)}${c.fecha ? ` <span style="font-weight: 400; font-size: 11px; color: var(--ceniza);">· ${registroFecha(c.fecha)}</span>` : ""}
            </summary>
            <ul style="margin: 8px 0 2px; padding-left: 18px; font-size: 13px; color: var(--pergamino); line-height: 1.35;">
                ${(c.notas || []).map(n => `<li style="margin-bottom: 3px;">${registroEsc(n)}</li>`).join("")}
            </ul>
        </details>`).join("");
}

function htmlRegistroIdeas() {
    const lista = window.registroJuego.ideas || [];
    if (!lista.length) return `<p style="color: var(--ceniza); font-size: 13px;">No hay ideas anotadas todavía.</p>`;
    return lista.map(idea => {
        const est = REGISTRO_ESTADOS[idea.estado] || REGISTRO_ESTADOS.idea;
        return `
        <div style="text-align: left; margin-bottom: 8px; padding: 8px 10px; border: 2px solid var(--cuero); border-left: 4px solid ${est.color}; background: var(--hierro-alto);">
            <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                <span style="font-weight: 700; color: var(--oro-claro); font-size: 15px;">${registroEsc(idea.titulo)}</span>
                <span style="font-size: 11px; color: ${est.color}; white-space: nowrap;">${est.icono} ${est.texto}</span>
            </div>
            ${idea.detalle ? `<p style="margin: 5px 0 0; font-size: 13px; color: var(--pergamino); line-height: 1.35;">${registroEsc(idea.detalle)}</p>` : ""}
        </div>`;
    }).join("");
}

function abrirRegistro(pestana = "implementado") {
    const bloqueMenuInicio = document.getElementById("bloque-menu-inicio");
    const contenedorBotones = document.querySelector(".opciones-container");
    const pantalla = document.getElementById("pantalla-inventario");
    if (!pantalla) return;

    if (bloqueMenuInicio) bloqueMenuInicio.style.display = "none";
    if (contenedorBotones) contenedorBotones.style.display = "none";
    pantalla.classList.remove("oculto");

    const reg = window.registroJuego;
    const nImpl = (reg.implementado || []).length;
    const nIdeas = (reg.ideas || []).length;
    const estiloTab = id => `flex: 1 1 0; width: auto; max-width: none; padding: 6px 8px; font-size: 12px; letter-spacing: 0; white-space: nowrap; background: ${id === pestana ? "#0284c7" : "#1e293b"};`;

    pantalla.innerHTML = `
        <h2 style="color: #f3e5ab; margin-bottom: 4px;">📜 REGISTRO</h2>
        <p style="font-size: 12px; color: var(--ceniza); margin: 0 0 8px;">Versión ${registroEsc(reg.version)}</p>
        <div style="display: flex; gap: 6px; margin: 8px 0;">
            <button onclick="abrirRegistro('implementado')" class="boton-opcion" style="${estiloTab("implementado")}">✅ Implementado (${nImpl})</button>
            <button onclick="abrirRegistro('ideas')" class="boton-opcion" style="${estiloTab("ideas")}">💡 Ideas (${nIdeas})</button>
        </div>
        <div style="max-height: 52vh; overflow-y: auto; padding-right: 2px;">
            ${pestana === "ideas" ? htmlRegistroIdeas() : htmlRegistroImplementado()}
        </div>
        <button onclick="cerrarRegistro()" class="boton-opcion" style="margin-top: 12px; background: #1e293b;">⬅ Volver al menú</button>
    `;
}

function cerrarRegistro() {
    document.getElementById("pantalla-inventario").classList.add("oculto");
    const contenedorBotones = document.querySelector(".opciones-container");
    if (contenedorBotones) contenedorBotones.style.display = "flex";
    cargarEscena("menu"); // vuelve a dibujar el menú principal
}

// ---------- Escena del menú ----------

window.escenas = window.escenas || {};

window.escenas.menu = {
    texto: "",
    opciones: [
        {
            texto: "⚔️ Nueva Partida",
            destino: "", // no cambia de escena: abre la creación de personaje
            accion: () => { abrirCreacionPersonaje(); }
        },
        {
            texto: "📖 Continuar Partida",
            destino: "", // Se definirá dinámicamente o cargará la guardada
            condicion: () => {
                // Solo aparece si existe una partida guardada en el navegador
                return localStorage.getItem("rpg_partida_guardada") !== null;
            },
            accion: () => {
                cargarPartidaGuardada();
            }
        },
        {
            texto: "📜 Registro",
            destino: "", // no cambia de escena: abre el registro de lo implementado y las ideas
            accion: () => { abrirRegistro(); }
        }
    ]
};
