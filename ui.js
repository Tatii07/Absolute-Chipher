function actualizarHUD() {
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
}
