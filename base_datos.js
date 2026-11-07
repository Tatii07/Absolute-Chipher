window.dbItems = {
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
    },
    
    espada_gastada: {
        nombre: "Espada Gastada",
        descripcion: "Un arma vieja, +2 de ataque",
        tipo: "equipamiento",
        slot: "arma",
        bonus: { fuerza: 2 }
    },

    // ===== EJEMPLOS DE EQUIPO (puedes cambiarlos o borrarlos) =====
    casco_cuero: {
        nombre: "Casco de Cuero",
        descripcion: "Protege la cabeza de los derrumbes.",
        tipo: "equipamiento", slot: "casco",
        bonus: { vitalidad: 1 }
    },
    peto_cuero: {
        nombre: "Peto de Cuero",
        descripcion: "Cuero curtido, rígido y pesado.",
        tipo: "equipamiento", slot: "peto",
        bonus: { vitalidad: 2 }
    },
    guantes_trapo: {
        nombre: "Guantes de Trapo",
        descripcion: "Mejoran el agarre del pico.",
        tipo: "equipamiento", slot: "guantes",
        bonus: { fuerza: 1 }
    },
    pantalones_gruesos: {
        nombre: "Pantalones Gruesos",
        descripcion: "Tela resistente de trabajador.",
        tipo: "equipamiento", slot: "pantalones",
        bonus: { vitalidad: 1 }
    },
    botas_gastadas: {
        nombre: "Botas Gastadas",
        descripcion: "Viejas, pero todavía se puede correr con ellas.",
        tipo: "equipamiento", slot: "zapatos",
        bonus: { agilidad: 1 }
    },
    collar_oxidado: {
        nombre: "Collar Oxidado",
        descripcion: "Una cadena vieja con un colgante extraño.",
        tipo: "equipamiento", slot: "collar",
        bonus: { inteligencia: 1 }
    },
    amuleto_minero: {
        nombre: "Amuleto del Minero",
        descripcion: "Se dice que protege a quien trabaja bajo tierra.",
        tipo: "equipamiento", slot: "artefacto",
        bonus: { vidaMax: 10 }
    },
    fragmento_cristal: {
        nombre: "Fragmento de Cristal",
        descripcion: "Vibra suavemente cerca de la magia.",
        tipo: "equipamiento", slot: "artefacto",
        bonus: { inteligencia: 2 }
    }
};

window.dbEnemigos = {
    slimo_oscuro: {
        nombre: "Slime Corrompido",
        vidaMax: 30,
        vida: 30,
        fuerza: 8,
        expRecompensa: 10,
        descripcion: "Una masa gelatinosa imbuida de oscuridad."
    },
    
    minero_zombi: {
        nombre: "Minero Zombi",
        vidaMax: 50,
        vida: 50,
        fuerza: 14,
        expRecompensa: 15,
        descripcion: "Un antiguo trabajador atrapado tras el derrumbe."
    },

capataz_lider: {
        nombre: "Capataz Lider",
        vidaMax: 200,
        vida: 200,
        fuerza: 20,
        expRecompensa: 20,
        descripcion: "Capataz de la mina trabajador esclavo de bajo rango"
},

lider_soldado: {
    nombre: "Soldado Jefe",
    vidaMax: 100,
    vida: 100,
    fuerza: 15,
    expRecompensa: 100,
    itemRecompensa: "espada_gastada",
    descripcion: "Lider de los soldados a cargo de vigilar a los esclavos"
    }
};