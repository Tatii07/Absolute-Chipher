window.escenas = window.escenas || {};

const CARBON_SECRETO = 100; // carbón necesario para el evento oculto

window.escenas.zona_minera = {
    texto: "No recuerdas hace cuánto eres esclavo, apenas recuerdas tu nombre, lo único que conoces es el pico de minería, esta vez estas minando tranquilo como siempre",
    opciones: [
        {
            texto: "⛏️ Picar la pared en busca de minerales",
            destino: "zona_minera",
            accion: () => {
                ganarItem("carbon", 1);
                registrarAccion("carbonPicado"); // 🆕 CLASES
                actualizarHUD();
                ganarExperiencia("1");
                mostrarAviso("¡Has Obtenido 1 de carbon.");
            }
        },
        {
            texto: "🚪 Ir hacia el Almacén Abandonado", 
            destino: "almacen"
        },
                { 
            texto: "🛏️ Descansar un momento", 
            destino: "zona_minera",
            accion: () => {
                window.jugador.stats.vida = Math.min(window.jugador.stats.vida + 10, window.jugador.stats.vidaMax);
                actualizarHUD();
                mostrarAviso("Has descansado y recuperado 10 de HP.");
            }
        }, 
        { 
            texto: "Avanzar por la mina",
            destino: "camino1"
        },
        {
        texto: `✨ [SECRETO] ¡Tras acumular ${CARBON_SECRETO} de carbón, un brillo nace entre el montón!`,
        accion: () => {
            gastarItem("carbon", CARBON_SECRETO);
            window.exploroZonaOculta = true; 
        },
        condicion: () => tieneItem("carbon", CARBON_SECRETO) && !window.exploroZonaOculta, // 👈 Solo sale si tienes el carbón Y AÚN NO lo has usado
        destino: "oculto"
    }
    ] 
}; // 👈 Y aquí cierra la escena completa

//fin del príncipal

window.escenas.almacen = {
    texto: "Un viejo almacén polvoriento. Hay estanterías rotas y cajas tiradas por el suelo.",
    opciones: [
        { 
            texto: "🔍 Buscar entre los escombros", 
            destino: "almacen",
            condicion: () => !window.exploroAlmacen, // Ejemplo: solo se puede hacer una vez
            accion: () => {
                ganarItem("pocion_vida", 1);
                window.exploroAlmacen = true;
                alert("¡Encontraste una poción oculta!");
            }
        },
        { 
            texto: "🚪 Volver a los túneles de la mina", 
            destino: "zona_minera" 
        }
    ]
};

window.escenas.oculto = {
    texto: "descubres una zona oculta en las minas donde un una botella de poción yace",
    opciones: [
        {
            texto:"Tomarla",
            destino: "zona_minera",
            accion: () => {
                ganarItem("pocion_de_stats", 1);
            }
        }
    ]
};

window.escenas.camino1 = {
    texto: "Continúas avanzado por la mina mientras sientes el suelo de piedra a tus pies, de repente te topas con un guardia \n—¿Que haces aqui?, Ve a trabajar",
    opciones: [
        {
    texto: "Atacarlo e intentar robar su arma",
    accion: () => {
        iniciarCombate("lider_soldado");
    },
    destino: "zona_minera"
}

    ]
}