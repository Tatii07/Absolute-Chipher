// base_datos/razas.js — AQUÍ INVENTAS TUS RAZAS Y ESPECIALIDADES (solo datos, sin lógica)
//
// ─────────────────────────────────────────────────────────────
// CADA RAZA (window.dbRazas) y CADA ESPECIALIDAD (window.dbEspecialidades) puede tener:
//
//   nombre, icono, descripcion        -> lo que ve el jugador
//   stats: { fuerza: 2, vidaMax: 10 } -> bonus permanentes al crear (pueden ser negativos)
//                                        Claves: fuerza, agilidad, inteligencia, vitalidad, defensa, vidaMax
//   items: [{ id: "pocion_vida", cantidad: 2 }]  -> objetos iniciales (ids de Items.js / equipamiento.js)
//   oro: 10                           -> oro extra inicial
//   expMultiplicador: 1.1             -> gana 10% más de experiencia
//   danoExtra: 2                      -> +2 de daño al atacar
//   defensaExtra: 1                   -> recibe 1 de daño menos
//   alCrear: (jugador) => { ... }     -> código libre que corre una vez al empezar
//   rasgos: ["ambicion", "furia"]    -> ids de base_datos/rasgos.js (el catálogo de rasgos).
//                                       También puedes escribir uno "en línea" solo para esta raza:
//                                       { nombre, descripcion, ...efectos }
//   habilidad: { nombre, descripcion, usos: 1, efecto: (jugador, enemigo) => "texto" }
//                                     -> botón especial en combate (usos por combate)
//
// SOLO las razas tienen:
//   especialidades: ["minero", "soldado"] -> cuáles puede elegir esa raza
//
// ESPECIALIDADES EXCLUSIVAS: si una especialidad solo aparece en la lista de una raza,
// solo esa raza puede elegirla. Si aparece en varias, es compartida.
//
// IMPORTANTE:
//  - Los ids (humano, minero...) usa letras, números y _ (sin espacios ni comillas).
//  - Pon cada bonus en UN solo lugar (no repitas el mismo stats en la raza y en su rasgo).
//  - Las partidas guardadas guardan solo el id: si editas una raza, el bonus de stats
//    de partidas viejas no cambia, pero rasgos/habilidades sí se actualizan.
// ─────────────────────────────────────────────────────────────

window.dbRazas = {

    humano: {
        nombre: "Humano",
        icono: "🧑",
        descripcion: "Adaptables y tenaces, aprenden de todo lo que viven.",
        stats: { agilidad: 1, inteligencia: 1 },
        rasgos: ["ambicion"],
        habilidad: {
            nombre: "Segundo Aliento",
            descripcion: "Recuperas 15 de vida.",
            usos: 1,
            efecto: (jugador, enemigo) => {
                jugador.stats.vida = Math.min(jugador.stats.vidaMax, jugador.stats.vida + 15);
                return "Tomas aire y recuperas 15 de vida.";
            }
        },
        especialidades: ["minero", "soldado", "erudito"]
    },

    enano: {
        nombre: "Enano",
        icono: "⛏️",
        descripcion: "Bajos y robustos. La roca es su hogar.",
        stats: { vitalidad: 2, fuerza: 1 },
        items: [{ id: "pocion_vida", cantidad: 1 }],
        rasgos: ["piel_de_roca"],
        especialidades: ["minero", "soldado"]
    },

    draconix: {
        nombre: "Draconix",
        icono: "🐊",
        descripcion: "reconocidos por su gran fuerza y extrema defensa.",
        stats: { fuerza: 5, defensa: 3},
        items: [{ id: "espada_gastada", cantidad: 1 }],
        rasgos: ["escamas_extraduras"],
        especialidades: ["minero", "soldado"]
    },

    elfo: {
        nombre: "Elfo",
        icono: "🧝",
        descripcion: "Ágiles y sabios, pero de cuerpo frágil.",
        stats: { agilidad: 2, inteligencia: 1, vidaMax: -5 },
        rasgos: ["mente_aguda"],
        especialidades: ["erudito", "cazador"]
    },

    orco: {
        nombre: "Orco",
        icono: "🪓",
        descripcion: "Fuerza bruta antes que ingenio.",
        stats: { fuerza: 3, inteligencia: -1 },
        rasgos: ["furia"],
        habilidad: {
            nombre: "Grito de Guerra",
            descripcion: "Un golpe enorme que inflige el doble de tu fuerza.",
            usos: 1,
            efecto: (jugador, enemigo) => {
                const dano = jugador.stats.fuerza * 2;
                enemigo.vida -= dano;
                return `¡Lanzas un Grito de Guerra y golpeas por ${dano} de daño!`;
            }
        },
        especialidades: ["soldado", "chaman"]   // "chaman" solo existe para los orcos
    }
};


window.dbEspecialidades = {

    minero: {
        nombre: "Minero",
        icono: "⛏️",
        descripcion: "Años picando piedra te hicieron fuerte.",
        stats: { fuerza: 2 },
        items: [{ id: "carbon", cantidad: 3 }]
    },

    soldado: {
        nombre: "Soldado",
        icono: "🛡️",
        descripcion: "Entrenado para pelear y resistir.",
        stats: { fuerza: 1, vitalidad: 1 },
        items: [{ id: "casco_cuero", cantidad: 1 }],
        rasgos: ["disciplina"]
    },

    erudito: {
        nombre: "Erudito",
        icono: "📚",
        descripcion: "Prefiere la cabeza antes que los músculos.",
        stats: { inteligencia: 3 },
        items: [{ id: "pocion_vida", cantidad: 2 }]
    },

    cazador: {
        nombre: "Cazador",
        icono: "🏹",
        descripcion: "Rápido, silencioso y preciso.",
        stats: { agilidad: 2 },
        oro: 10,
        rasgos: ["presa_marcada"]
    },

    chaman: {
        nombre: "Chamán",
        icono: "🔮",
        descripcion: "Habla con los espíritus de la tribu.",
        stats: { inteligencia: 2, vidaMax: 10 },
        habilidad: {
            nombre: "Llamado Ancestral",
            descripcion: "Los espíritus te curan 25 de vida.",
            usos: 1,
            efecto: (jugador, enemigo) => {
                jugador.stats.vida = Math.min(jugador.stats.vidaMax, jugador.stats.vida + 25);
                return "Los espíritus te envuelven y recuperas 25 de vida.";
            }
        }
    }
};
