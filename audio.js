// audio.js — Música de fondo
//
// Los navegadores (sobre todo en celular) BLOQUEAN el audio hasta que la persona toca la pantalla.
// Por eso este archivo intenta sonar al cargar y, si lo bloquean, espera al primer toque/clic y suena.
// Ya NO hace falta llamar reproducirMusicaMenu() desde menu.js: arranca solo.

const RUTA_MUSICA_MENU = "audio/menu_principal.mp3"; // debe coincidir con el <source> de index.html
let esperandoInteraccion = false;
let avisoErrorMostrado = false;

function reproducirMusicaMenu() {
    const musica = document.getElementById("musica-fondo");
    if (!musica) return;

    musica.volume = 0.4; // Volumen al 40% para que no sature

    const promesa = musica.play();
    if (promesa !== undefined) {
        promesa.catch(() => esperarInteraccionParaMusica()); // bloqueado: reintenta al primer toque
    }
}

function esperarInteraccionParaMusica() {
    if (esperandoInteraccion) return;
    esperandoInteraccion = true;

    const eventos = ["click", "touchend", "pointerup", "keydown"];
    const reintentar = () => {
        eventos.forEach(ev => document.removeEventListener(ev, reintentar));
        esperandoInteraccion = false;
        const musica = document.getElementById("musica-fondo");
        if (musica) musica.play().catch(error => console.log("No se pudo reproducir la música:", error));
    };
    eventos.forEach(ev => document.addEventListener(ev, reintentar));
}

function detenerMusica() {
    const musica = document.getElementById("musica-fondo");
    if (musica) {
        musica.pause();
        musica.currentTime = 0; // Reinicia la pista
    }
}

// Si el archivo no existe o no se puede leer, avisa (en celular no hay consola)
(function vigilarErrorDeArchivo() {
    const fuente = document.querySelector("#musica-fondo source");
    if (!fuente) return;
    fuente.addEventListener("error", () => {
        console.error("No se encontró el archivo de música:", fuente.getAttribute("src"));
        if (!avisoErrorMostrado && typeof mostrarAviso === "function") {
            avisoErrorMostrado = true;
            mostrarAviso("🔇 No se pudo cargar la música. Revisa que exista: " + fuente.getAttribute("src"));
        }
    });
    function detenerMusica() {
    const musica = document.getElementById("musica-fondo");
    if (musica) {
        musica.pause();
        musica.currentTime = 0; // Opcional: reinicia la pista desde el principio
    }
}

})();

// Arranca sola al cargar la página
reproducirMusicaMenu();
