// Guardar partida actual
function guardarPartida() {
    const datosPartida = {
        jugador: window.jugador,
        inventario: typeof inventario !== 'undefined' ? inventario : [],
        escenaActual: typeof escenaActual !== 'undefined' ? escenaActual : 'menu'
    };

    localStorage.setItem('julliet_save_slot1', JSON.stringify(datosPartida));
    
    if (typeof mostrarAviso === "function") {
        mostrarAviso("💾 ¡Partida guardada con éxito!");
    } else {
        alert("¡Partida guardada con éxito!");
    }
}

// Cargar partida existente
function cargarPartida() {
    const datosGuardados = localStorage.getItem('julliet_save_slot1');
    if (!datosGuardados) {
        if (typeof mostrarAviso === "function") {
            mostrarAviso("No hay ninguna partida guardada.");
        } else {
            alert("No hay ninguna partida guardada.");
        }
        return false;
    }

    try {
        const partida = JSON.parse(datosGuardados);
        
        // Restauramos los datos globales del jugador
        window.jugador = partida.jugador;
        
        // Restauramos el inventario si existe la variable global
        if (typeof inventario !== 'undefined' && partida.inventario) {
            inventario.length = 0;
            partida.inventario.forEach(item => inventario.push(item));
        }

        // Actualizamos HUD y cargamos la escena donde se quedó
        if (typeof actualizarHUD === "function") actualizarHUD();
        
        const destino = partida.escenaActual || 'menu';
        if (typeof cargarEscena === "function") {
            cargarEscena(destino);
        }

        if (typeof mostrarAviso === "function") {
            mostrarAviso("📂 ¡Partida cargada correctamente!");
        }
        return true;
    } catch (e) {
        console.error("Error al cargar la partida:", e);
        return false;
    }
}

// Verificar si existe una partida guardada
function existePartidaGuardada() {
    return localStorage.getItem('julliet_save_slot1') !== null;
}

// Reiniciar / Nueva Partida
function nuevaPartida() {
    localStorage.removeItem('julliet_save_slot1');
    
    // Reiniciamos los valores por defecto del jugador
    window.jugador = {
        nombre: "Julliet",
        nivel: 0,
        exp: 0,
        expSiguienteNivel: 100,
        oro: 20,
        puntosDisponibles: 0,
        stats: {
            vida: 50,
            vidaMax: 50,
            fuerza: 15,
            agilidad: 2,
            inteligencia: 2,
            vitalidad: 3
        }
    };
    
    if (typeof inventario !== 'undefined') {
        inventario.length = 0;
        inventario.push({ id: "pico_hierro", cantidad: 1 }); // O los ítems iniciales que tengas
    }

    if (typeof cargarEscena === "function") {
        cargarEscena("inicio"); // O la primera escena de tu historia
    }
}
