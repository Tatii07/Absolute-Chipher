window.escenas = window.escenas || {};

window.escenas.menu = {
    texto: "", 
    opciones: [
        { 
            texto: "Nueva Partida", 
            destino: "zona_minera", 
            accion: () => { nuevaPartida(); } 
        },
        { 
            texto: "Continuar Partida", 
            destino: "", // Se definirá dinámicamente o cargará la guardada
            condicion: () => {
                // Solo aparece si existe una partida guardada en el navegador
                return localStorage.getItem("rpg_partida_guardada") !== null;
            },
            accion: () => {
                cargarPartidaGuardada();
            }
        }
    ]
};
