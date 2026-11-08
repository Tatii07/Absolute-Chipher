// base_datos/rasgos.js — CATÁLOGO DE RASGOS (reutilizables por cualquier raza o especialidad)
//
// Cada rasgo se define UNA vez aquí y luego se usa por id en base_datos/razas.js:
//     rasgos: ["ambicion", "piel_de_roca"]
//
// Un rasgo puede tener:
//   nombre, descripcion               -> lo que ve el jugador
//   stats: { fuerza: 2, defensa: 1, vidaMax: 10 } -> bonus permanentes al crear (pueden ser negativos)
//   items: [{ id: "pocion_vida", cantidad: 1 }]
//   oro: 10
//   expMultiplicador: 1.1             -> +10% de experiencia
//   danoExtra: 2                      -> +2 de daño al atacar
//   defensaExtra: 1                   -> recibe 1 de daño menos
//   alCrear: (jugador) => { ... }     -> código libre al empezar
//
// Si la raza y la especialidad comparten el mismo rasgo, sus efectos cuentan UNA sola vez.
// Usa ids con letras, números y _ (sin espacios ni comillas).

window.dbRasgos = {

    ambicion: {
        nombre: "Ambición",
        descripcion: "Aprendes más rápido de cada experiencia.",
        expMultiplicador: 1.10
    },

    mente_aguda: {
        nombre: "Mente Aguda",
        descripcion: "Aprendes un poco más rápido.",
        expMultiplicador: 1.05
    },

    piel_de_roca: {
        nombre: "Piel de Roca",
        descripcion: "Los golpes te duelen menos.",
        defensaExtra: 1
    },

    furia: {
        nombre: "Furia",
        descripcion: "Tus golpes pegan más fuerte.",
        danoExtra: 2
    },

    disciplina: {
        nombre: "Disciplina",
        descripcion: "Golpeas con más precisión.",
        danoExtra: 1
    },

    presa_marcada: {
        nombre: "Presa Marcada",
        descripcion: "Conoces los puntos débiles de tus enemigos.",
        danoExtra: 1
    },

    // ----- Extras de ejemplo, todavía sin asignar a ninguna raza -----

    robusto: {
        nombre: "Robusto",
        descripcion: "Tu cuerpo aguanta más de lo normal.",
        stats: { vidaMax: 10 }
    },

    avaricia: {
        nombre: "Avaricia",
        descripcion: "Siempre empiezas con algo de oro guardado.",
        oro: 15
    },
    
    escamas_extraduras: {
        nombre: "Escamas Extraduras",
        descripción: "Un rasgo único de la raza reptil aumenta enormemente su defensa",
        defensaExtra: 5
    },
};
