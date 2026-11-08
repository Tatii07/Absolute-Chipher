function actualizarHUD() {
    // 0. El maná máximo depende de la inteligencia: lo recalculamos siempre
    if (typeof recalcularManaMax === "function") recalcularManaMax();

    // 1. Buscamos los elementos del HTML
    const txtNivel = document.getElementById("ui-nivel");
    const txtHp = document.getElementById("ui-hp");
    const txtHpMax = document.getElementById("ui-hp-max");
    const txtOro = document.getElementById("ui-oro");

    // 2. Si existen en la pantalla actual, les inyectamos los datos del jugador
    if (txtNivel) txtNivel.innerText = window.jugador.nivel;
    if (txtHp) txtHp.innerText = window.jugador.stats.vida;
    if (txtHpMax) txtHpMax.innerText = window.jugador.stats.vidaMax;
    if (txtOro) txtOro.innerText = window.jugador.oro;

    // 3. Barra de vida (se pone en rojo claro cuando queda poca)
    const barra = document.getElementById("ui-hp-barra");
    if (barra) {
        const max = window.jugador.stats.vidaMax || 1;
        const pct = Math.max(0, Math.min(100, (window.jugador.stats.vida / max) * 100));
        barra.style.width = pct + "%";
        barra.classList.toggle("critica", pct <= 30);
    }

    // 3b. Maná
    const txtMp = document.getElementById("ui-mp");
    const txtMpMax = document.getElementById("ui-mp-max");
    if (txtMp) txtMp.innerText = window.jugador.stats.mana;
    if (txtMpMax) txtMpMax.innerText = window.jugador.stats.manaMax;
    const barraMp = document.getElementById("ui-mp-barra");
    if (barraMp) {
        const maxMp = window.jugador.stats.manaMax || 1;
        barraMp.style.width = Math.max(0, Math.min(100, (window.jugador.stats.mana / maxMp) * 100)) + "%";
    }

    // 4. 🆕 CLASES: marca el botón Personaje y avisa cuando ya se puede elegir clase
    if (typeof revisarClases === "function") revisarClases();
}
