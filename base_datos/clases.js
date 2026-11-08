// base_datos/clases.js — Datos de las CLASES (la lógica está en sistema_clases.js)
//
// CÓMO FUNCIONA
// - Al empezar eres "Sin Clase". Cuando se cumple la PUERTA (un momento de la historia)
//   puedes elegir UNA clase básica (tier 1).
// - Las clases avanzadas (tier 2, 3...) salen de una clase concreta (evolucionaDe) y piden
//   cosas que hayas HECHO durante la partida (requisitos).
// - Las clases se acumulan: la avanzada conserva stats, rasgos y habilidades de las anteriores.
//
// PARA AGREGAR UNA CLASE: copia un bloque de window.dbClases y cambia el id y los datos.
//   evolucionaDe: id de la clase de la que sale (no lo pongas en las de tier 1)
//   tier:         1, 2, 3... (solo se usa para mostrarlo)
//   stats:        bonus PERMANENTES que se suman al elegirla (fuerza, agilidad, inteligencia,
//                 vitalidad, defensa, vidaMax)
//   danoExtra, defensaExtra, expMultiplicador: efectos que se aplican mientras tengas la clase
//   rasgos:       (opcional) ids de dbRasgos o rasgos escritos en línea, igual que en razas
//   oro, items:   (opcional) lo que recibes al elegirla
//   alElegir(j):  (opcional) función extra al elegirla
//   requisitos:   lista de condiciones (ver abajo)
//   habilidades:  ids de las habilidades que enseña esta clase (se definen en base_datos/habilidades.js).
//                 Incluye TODAS las del árbol de la clase: en pantalla solo se ven las que ya tienes
//                 y las que cuelgan de ellas (mira "requiere" en habilidades.js).
//
// TIPOS DE REQUISITO
//   { tipo: "nivel",    meta: 4 }
//   { tipo: "registro", clave: "danoRecibido", meta: 150, texto: "Recibe 150 de daño" }
//   { tipo: "flag",     clave: "exploroZonaOculta", texto: "Descubre la zona oculta" }
//
// CLAVES DEL REGISTRO (lo que cuenta el juego solo):
//   enemigosDerrotados, derrotados:<id_enemigo>, danoRecibido, huidas, habilidadesUsadas,
//   objetosUsados, carbonPicado, lugaresVisitados
//   Para contar algo nuevo, llama a  registrarAccion("miClave")  donde ocurra (en una escena, etc.)

// ---------- La puerta del tier 1: el momento de la historia en que despiertas tu clase ----------
// Cámbiala por el hecho de historia que quieras (cualquier requisito vale).
window.puertaClases = {
    textoCerrada: "Eres un esclavo sin oficio ni destino. Algo en tu historia debe cambiar antes de que puedas elegir una clase.",
    textoAbierta: "Algo despertó en ti. Ya puedes elegir el camino que seguirás.",
    requisitos: [
        { tipo: "registro", clave: "derrotados:lider_soldado", meta: 1, texto: "Derrota al Soldado Jefe" }
    ]
};

window.dbClases = {

    // ================= TIER 1 =================

    guerrero: {
        nombre: "Guerrero", icono: "⚔️", tier: 1,
        descripcion: "Aprendes a pelear de verdad: golpear fuerte y aguantar lo que venga.",
        stats: { fuerza: 5, vitalidad: 3 },
        defensaExtra: 1,
        habilidades: ["golpe_brutal", "recio", "grito_de_guerra", "brazos_de_hierro", "piel_de_roble"]
    },

    mago: {
        nombre: "Aprendiz De Mago", icono: "🎩", tier: 1,
        descripcion: "Un aprendiz de un mago, es un novato que solo puede usar magia de bajo nivel.",
        stats: { fuerza: -15, inteligencia: 10 },
        habilidades: ["descarga_arcana", "mente_clara", "sed_de_saber"]
    },

    clerigo: {
        nombre: "Clerigo", icono: "🔮", tier: 1,
        descripcion: "Miembro de la iglesia, usa magia curativa.",
        stats: { inteligencia: 5 },
        habilidades: ["luz_curativa", "descarga_arcana", "mente_clara", "sed_de_saber"]
    },

    // ================= TIER 2 =================

    // ---- Del Guerrero ----
    berserker: {
        nombre: "Berserker", icono: "🪓", tier: 2, evolucionaDe: "guerrero",
        descripcion: "El dolor que has soportado se vuelve furia. Pegas durísimo, pero te cubres menos.",
        stats: { fuerza: 4 },
        defensaExtra: -1,
        requisitos: [
            { tipo: "nivel", meta: 4 },
            { tipo: "registro", clave: "danoRecibido", meta: 150, texto: "Recibe 150 de daño en combate" }
        ],
        habilidades: ["furia_sangrienta", "sangre_caliente"]
    },

    guardian: {
        nombre: "Guardián", icono: "🛡️", tier: 2, evolucionaDe: "guerrero",
        descripcion: "Años de trabajo duro te curtieron. Es muy difícil derribarte.",
        stats: { vitalidad: 3, vidaMax: 20 },
        defensaExtra: 3,
        requisitos: [
            { tipo: "nivel", meta: 4 },
            { tipo: "registro", clave: "carbonPicado", meta: 40, texto: "Pica carbón 40 veces" }
        ],
        habilidades: ["postura_firme", "muro_viviente"]
    },

    // ---- Del Explorador ----
    cazador_tesoros: {
        nombre: "Cazador de Tesoros", icono: "💎", tier: 2, evolucionaDe: "explorador",
        descripcion: "Tu olfato para lo escondido te hace avanzar más rápido que los demás.",
        stats: { agilidad: 2, inteligencia: 1 },
        expMultiplicador: 1.1,
        requisitos: [
            { tipo: "nivel", meta: 3 },
            { tipo: "flag", clave: "exploroZonaOculta", texto: "Descubre la zona oculta de la mina" },
            { tipo: "registro", clave: "lugaresVisitados", meta: 4, texto: "Visita 4 lugares distintos" }
        ],
        habilidades: ["golpe_oportuno"]
    },

    acechador: {
        nombre: "Acechador", icono: "🗡️", tier: 2, evolucionaDe: "explorador",
        descripcion: "Has aprendido que huir a tiempo también es una forma de ganar.",
        stats: { agilidad: 4 },
        requisitos: [
            { tipo: "nivel", meta: 4 },
            { tipo: "registro", clave: "huidas", meta: 3, texto: "Huye de 3 combates" }
        ],
        habilidades: ["punalada_trapera", "humo_cegador"]
    },

    // ---- Del Aprendiz Arcano ----
    alquimista: {
        nombre: "Alquimista", icono: "⚗️", tier: 2, evolucionaDe: "aprendiz_arcano",
        descripcion: "Mezclas, pruebas y aprendes de cada frasco que usas.",
        stats: { inteligencia: 2, vitalidad: 1 },
        expMultiplicador: 1.05,
        requisitos: [
            { tipo: "nivel", meta: 3 },
            { tipo: "registro", clave: "objetosUsados", meta: 5, texto: "Usa 5 objetos (pociones...)" }
        ],
        habilidades: ["frasco_acido"]
    },

    hechicero: {
        nombre: "Hechicero", icono: "🌀", tier: 2, evolucionaDe: "aprendiz_arcano",
        descripcion: "Tu magia ya no es un destello: es una fuerza que se siente.",
        stats: { inteligencia: 4 },
        danoExtra: 2,
        requisitos: [
            { tipo: "nivel", meta: 4 },
            { tipo: "registro", clave: "habilidadesUsadas", meta: 8, texto: "Usa habilidades de combate 8 veces" }
        ],
        habilidades: ["tormenta_arcana"]
    }
};