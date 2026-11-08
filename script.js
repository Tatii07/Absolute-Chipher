// script.js
const textoPantalla = document.querySelector('#texto-historia');
const contenedorBotones = document.querySelector('.opciones-container');

function guardarPartida(nombreEscena) {
    localStorage.setItem("partida_guardada", nombreEscena);
    console.log("Progreso guardado en escena:", nombreEscena);
}

const logros = {
    MuerteInutil: false,
    cazador: false,
    Indeciso: false,
    MuerteHelada: false
};

// Guardar el estado actual del juego
function guardarPartidaActual(nombreEscenaActual) {
    const datosPartida = {
        jugador: window.jugador,
        inventario: inventario,
        escenaActual: nombreEscenaActual,
        flags: {
            exploroZonaOculta: !!window.exploroZonaOculta,
            exploroAlmacen: !!window.exploroAlmacen
        }
    };
    
    localStorage.setItem("rpg_partida_guardada", JSON.stringify(datosPartida));
    console.log("Partida guardada con éxito en la escena:", nombreEscenaActual);
}

// Cargar la partida guardada
function cargarPartidaGuardada() {
    const datosGuardados = localStorage.getItem("rpg_partida_guardada");
    if (!datosGuardados) return;

    const partida = JSON.parse(datosGuardados);
    
    // Restauramos los datos globales del jugador e inventario
    window.jugador = partida.jugador;
    inventario = partida.inventario;
    const flags = partida.flags || {};
    window.exploroZonaOculta = !!flags.exploroZonaOculta;
    window.exploroAlmacen = !!flags.exploroAlmacen;
    
    // Cargamos la escena donde se quedó
    cargarEscena(partida.escenaActual);
    actualizarHUD();
}

// Iniciar una nueva partida limpia
function nuevaPartida(datos = {}) {
    window.jugador = {
        nombre: "Julliet",
        nivel: 0,
        exp: 0,
        expSiguienteNivel: 100,
        oro: 20,
        puntosDisponibles: 0,
        equipo: { arma: null },
        stats: {
            vida: 50,
            vidaMax: 50,
            fuerza: 15,
            agilidad: 2,
            inteligencia: 2,
            vitalidad: 3,
            defensa: 0
        }
    };
    
    // Datos elegidos en la creación de personaje (nombre, y lo que se añada a futuro)
    Object.assign(window.jugador, datos);

    // 👈 Inventario inicial completo para una nueva partida
    inventario = inventarioInicial();
    // Bonus de la raza y la especialidad elegidas (stats, objetos, oro...)
    if (typeof aplicarRazaYEspecialidad === "function") aplicarRazaYEspecialidad();
    window.exploroZonaOculta = false;
    window.exploroAlmacen = false;

    localStorage.removeItem("rpg_partida_guardada");
    cargarEscena("zona_minera"); 
}

function cargarEscena(nombreEscena) {
    if (nombreEscena !== "menu") {
        nombreEscenaEnJuego = nombreEscena;
        
        // 👈 ESTO REGISTRA LA VISITA PARA LAS MISIONES
        if (typeof window.registrarVisita === "function") {
            window.registrarVisita(nombreEscena);
        }
        if (typeof registrarLugar === "function") registrarLugar(nombreEscena); // 🆕 CLASES
    }

    const escenaActual = window.escenas ? window.escenas[nombreEscena] : null;

    if (!escenaActual) {
        console.error("No se encontró la escena:", nombreEscena);
        return;
    }

    const cajaHud = document.getElementById("caja-hud");
    const bloqueMenuInicio = document.getElementById("bloque-menu-inicio");
    const botonMochila = document.getElementById("btn-mochila-fijo");
    const botonStats = document.getElementById("btn-stats-fijo");
    const botonMenuFijo = document.getElementById("btn-menu-fijo"); // 👈 Referencia al botón

    if (nombreEscena === "menu") {
        document.body.className = "modo-menu";
        window.combateActual = null; // al salir al menú no queda ningún combate colgado
        
        // Ocultar HUD y botones flotantes en el menú principal
        if (bloqueMenuInicio) bloqueMenuInicio.style.display = "block";
        if (cajaHud) cajaHud.classList.add("oculto");
        if (botonMochila) botonMochila.classList.add("oculto");
        if (botonStats) botonStats.classList.add("oculto");
        if (botonMenuFijo) botonMenuFijo.classList.add("oculto"); // 👈 Se oculta aquí
        if (textoPantalla) textoPantalla.style.display = "none";

    } else {
        document.body.className = "modo-juego";
        
        // Mostrar HUD y botones flotantes dentro del juego
        if (bloqueMenuInicio) bloqueMenuInicio.style.display = "none";
        if (cajaHud) cajaHud.classList.remove("oculto");
        if (botonMochila) botonMochila.classList.remove("oculto");
        if (botonStats) botonStats.classList.remove("oculto");
        if (botonMenuFijo) botonMenuFijo.classList.remove("oculto"); // 👈 Aparece solo al jugar

        if (textoPantalla) textoPantalla.style.display = "block";
        
        actualizarHUD();
    }

    if (textoPantalla && nombreEscena !== "menu") {
        textoPantalla.innerText = escenaActual.texto;
    }
    
    contenedorBotones.innerHTML = "";

    escenaActual.opciones.forEach(opcion => {
        if (opcion.condicion && !opcion.condicion()) {
            return; 
        }

        const nuevoBoton = document.createElement("button");
        nuevoBoton.innerText = opcion.texto;
        nuevoBoton.className = "boton-opcion";

        nuevoBoton.onclick = () => {
            if (opcion.accion) {
                opcion.accion(); 
            }
            if (opcion.destino) cargarEscena(opcion.destino);

            // Si la acción inició un combate, cargarEscena volvió a mostrar el texto de la escena:
            // lo ocultamos otra vez para que solo se vea el combate
            if (window.combateActual && typeof mostrarPantallaCombate === "function") {
                mostrarPantallaCombate();
            }
        };

        contenedorBotones.appendChild(nuevoBoton);
    });
}
// Inicializar el juego cargando el menú principal
if (window.escenas && window.escenas["menu"]) {
    cargarEscena("menu");
}

function mostrarAviso(texto) {
    const modal = document.getElementById("modal-aviso");
    const textoModal = document.getElementById("modal-texto");
    if (modal && textoModal) {
        textoModal.innerText = texto;
        modal.classList.remove("oculto");
    }
}

function cerrarModal() {
    const modal = document.getElementById("modal-aviso");
    if (modal) {
        modal.classList.add("oculto");
    }
}

// Variable para rastrear la escena actual en la que está Julliet
let nombreEscenaEnJuego = "zona_minera";

// (Asegúrate de actualizar esta variable dentro de cargarEscena):
// Al inicio de cargarEscena(nombreEscena), añade: if (nombreEscena !== "menu") nombreEscenaEnJuego = nombreEscena;


// --- MENÚ DE OPCIONES FLOTANTE ---

function abrirMenuOpciones() {
    const textoHistoria = document.getElementById("texto-historia");
    const contenedorBotones = document.querySelector(".opciones-container");
    const botonMochila = document.getElementById("btn-mochila-fijo");
    const botonStats = document.getElementById("btn-stats-fijo");
    const botonMenuOpciones = document.getElementById("btn-menu-fijo");
    const pantallaInv = document.getElementById("pantalla-inventario");

    // Ocultar HUD principal
    textoHistoria.style.display = "none";
    contenedorBotones.style.display = "none";
    if (botonMochila) botonMochila.style.display = "none";
    if (botonStats) botonStats.style.display = "none";
    if (botonMenuOpciones) botonMenuOpciones.style.display = "none";

    pantallaInv.classList.remove("oculto");
    pantallaInv.innerHTML = `
        <h2 style='color: #f3e5ab; margin-bottom: 15px;'>⚙️ MENÚ DE OPCIONES</h2>
        
        <div style="display: flex; flex-direction: column; gap: 10px; width: 90%; max-width: 260px; margin: 0 auto;">
            <button onclick="guardarPartidaManual()" class="boton-opcion" style="background: #0284c7;">💾 Guardar Partida</button>
            <button onclick="intentarCargarPartida()" class="boton-opcion" style="background: #0d9488;">📂 Cargar Partida</button>
            <button onclick="irMenuPrincipal()" class="boton-opcion" style="background: #7f1d1d; border-color: #ef4444;">🚪 Salir al Menú</button>
        </div>
    `;

    // Botón para volver al juego
    const botonVolver = document.createElement("button");
    botonVolver.innerText = "⬅ Volver al juego";
    botonVolver.className = "boton-opcion";
    botonVolver.style.marginTop = "20px";
    
    botonVolver.onclick = () => {
        cerrarMenuOpciones();
    };

    pantallaInv.appendChild(botonVolver);
}

function cerrarMenuOpciones() {
    const textoHistoria = document.getElementById("texto-historia");
    const contenedorBotones = document.querySelector(".opciones-container");
    const botonMochila = document.getElementById("btn-mochila-fijo");
    const botonStats = document.getElementById("btn-stats-fijo");
    const botonMenuOpciones = document.getElementById("btn-menu-fijo");
    const pantallaInv = document.getElementById("pantalla-inventario");

    pantallaInv.classList.add("oculto");
    textoHistoria.style.display = "block";
    contenedorBotones.style.display = "flex";
    if (botonMochila) botonMochila.style.display = "block";
    if (botonStats) botonStats.style.display = "block";
    if (botonMenuOpciones) botonMenuOpciones.style.display = "block";
}

function guardarPartidaManual() {
    guardarPartidaActual(nombreEscenaEnJuego);
    mostrarAviso("💾 ¡Partida guardada correctamente!");
    cerrarMenuOpciones();
}

function intentarCargarPartida() {
    if (localStorage.getItem("rpg_partida_guardada") !== null) {
        cargarPartidaGuardada();
        cerrarMenuOpciones();
        mostrarAviso("📂 ¡Partida cargada con éxito!");
    } else {
        mostrarAviso("No hay ninguna partida guardada.");
    }
}

function irMenuPrincipal() {
    cerrarMenuOpciones();
    cargarEscena("menu");
}
