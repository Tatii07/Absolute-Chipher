// sistemas.js
function ganarExperiencia(cantidad) {
    window.jugador.exp += Number(cantidad);
    let nivelesSubidos = 0;

    while (window.jugador.exp >= window.jugador.expSiguienteNivel) {
        window.jugador.exp -= window.jugador.expSiguienteNivel; 
        window.jugador.nivel++;
        nivelesSubidos++;
        
        // Cada nivel otorga 3 puntos de stats gratuitos (puedes cambiar el número si prefieres 1 o 5)
        window.jugador.puntosDisponibles += 1; 
        
        window.jugador.expSiguienteNivel = Math.floor(window.jugador.expSiguienteNivel * 1.5);
        
        // Al subir de nivel se cura por completo
        window.jugador.stats.vida = window.jugador.stats.vidaMax; 
    }
    
    if (nivelesSubidos > 0 && typeof mostrarAviso === "function") {
        mostrarAviso(`✨ ¡Nivel Subido! Ahora eres Nivel ${window.jugador.nivel}. Tienes ${window.jugador.puntosDisponibles} puntos de stats por repartir.`);
    }
    
    actualizarHUD(); 
}



function usarItemInventario(idItem) {
    const infoDb = window.dbItems[idItem];
    if (!infoDb) return;

    // Si es un ítem de control/admin, ejecutamos su efecto SIN gastarlo
    if (infoDb.tipo === "control") {
        if (infoDb.efecto) infoDb.efecto();
        return;
    }

    // Para los consumibles normales (pociones, etc.)
    const sePudoGastar = gastarItem(idItem, 1);

    if (sePudoGastar) {
        if (infoDb.efecto) infoDb.efecto();
        actualizarHUD();
        abrirPantallaInventario();
    } else {
        mostrarAviso("No tienes suficientes unidades de este objeto.");
    }
}


