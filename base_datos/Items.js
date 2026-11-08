window.dbConsumibles = {
    pico_hierro: {
        nombre: "Pico de Hierro",
        descripcion: "Una herramienta resistente para picar minerales en la mina.",
        tipo: "herramienta"
    },
    pocion_vida: {
        nombre: "Poción Pequeña",
        descripcion: "Restaura 20 de vida.",
        tipo: "consumible",
        efecto: () => {
            window.jugador.stats.vida = Math.min(window.jugador.stats.vida + 20, window.jugador.stats.vidaMax);
            mostrarAviso("Has usado una Poción Pequeña y recuperado 20 de HP.");
        }
    },
    pocion_de_stats: {
        nombre: "Poción Definitiva",
        descripcion: "Aumenta todas las estadísticas permanentemente en 4 puntos.",
        tipo: "consumible",
        efecto: () => {
            window.jugador.stats.fuerza += 3;
            window.jugador.stats.agilidad += 3;
            window.jugador.stats.inteligencia += 3;
            window.jugador.stats.vitalidad += 3;
            window.jugador.stats.defensa = (window.jugador.stats.defensa || 0) + 3;
            mostrarAviso("¡Has bebido la poción! Tus estadísticas aumentaron.");
        }
    },
    carbon: {
        nombre: "Carbon",
        descripcion: "Mineral más básico de la mina.",
        tipo: "material" 
    },
    adminkey: {
        nombre: "Llave de Admin",
        descripcion: "Permite abrir el menú de desarrollo.",
        tipo: "control",
        efecto: () => {
            abrirMenuAdmin();
        }
    }
};
