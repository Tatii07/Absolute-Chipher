// base_datos/habilidades.js — Catálogo de HABILIDADES (la lógica está en sistema_habilidades.js)
//
// Aquí se DEFINEN las habilidades. Las clases (base_datos/clases.js) solo dicen cuáles enseñan:
//     guerrero: { ..., habilidades: ["golpe_brutal", "recio", "grito_de_guerra"] }
// Una habilidad puede enseñarla más de una clase.
//
// TIPOS
//   "activa"  Se usa en combate (botón morado). Gasta sus usos por combate.
//   "pasiva"  Siempre activa una vez aprendida (bonus numéricos).
//   "vida"    (venta, recolección, cocina...) PRÓXIMAMENTE: no dependerán de la clase.
//
// CAMPOS COMUNES
//   nombre, icono, descripcion
//   requisitos   Condiciones para poder aprenderla (si no pones, se puede desde el inicio).
//                Mismos tipos que en las clases:
//                  { tipo: "nivel",    meta: 3 }
//                  { tipo: "registro", clave: "huidas", meta: 5, texto: "Huye de 5 combates" }
//                  { tipo: "flag",     clave: "exploroZonaOculta", texto: "Descubre la zona oculta" }
//   auto: true   Se aprende sola al cumplir los requisitos (sin elegir). Ideal para la habilidad
//                básica de una clase. Si la omites, el jugador decide cuándo aprenderla.
//   requiere     Id (o lista de ids) de la habilidad que hay que tener ANTES. Así se forma el ÁRBOL:
//                en la pantalla solo se ven las habilidades que ya tienes y las que cuelgan
//                directamente de ellas; al aprender una, aparecen las siguientes.
//                Sin "requiere" = raíz del árbol (la primera de cada clase suele ser auto: true).
//                Ej.:  recio: { ..., requiere: "golpe_brutal" }
//   exclusivo    Nombre de una RAMA EXCLUSIVA (ver window.gruposHabilidades abajo): de todas las
//                habilidades con ese mismo nombre solo se puede aprender UNA. Las demás quedan
//                descartadas para siempre.
//
// SOLO ACTIVAS
//   usos         Veces por combate (por defecto 1)
//   mana         Coste en MP. Si la pones, la habilidad se limita solo por maná (ignora "usos")
//   efecto(jugador, enemigo)   Devuelve el texto que se muestra. Ayudas: golpeHabilidad,
//                danoMagico, aturdirEnemigo, debilitarEnemigo, curarJugador
//
// SOLO PASIVAS (efectos mientras la tengas)
//   danoExtra, defensaExtra, expMultiplicador
//   stats        Bonus PERMANENTES que se suman una sola vez al aprenderla (fuerza, agilidad,
//                inteligencia, vitalidad, defensa, vidaMax)
//   alAprender(j)   (opcional) función extra al aprenderla
//
// EXCLUSIVIDAD DE RAMA ENTRE CLASES
//   No hace falta configurarla: una habilidad solo se ofrece a quien tenga una clase que la
//   enseñe. Si eliges Berserker, las habilidades que solo enseña el Guardián nunca aparecerán.

// ---------- Ramas exclusivas (el nombre que se muestra en pantalla) ----------
window.gruposHabilidades = {
    temple_guerrero:     { nombre: "Temple del guerrero" },
    instinto_explorador: { nombre: "Instinto del explorador" }
};

window.dbHabilidades = {

    // ================= GUERRERO =================

    golpe_brutal: {
        nombre: "Golpe Brutal", icono: "💥", tipo: "activa", mana: 10, auto: true,
        descripcion: "Un golpe con casi el doble de daño.",
        efecto: (j, e) => `Descargas un Golpe Brutal por ${golpeHabilidad(e, 1.8)} de daño.`
    },
    recio: {
        nombre: "Recio", icono: "🪨", tipo: "pasiva",
        requiere: "golpe_brutal",
        descripcion: "Tu cuerpo se acostumbra al castigo.",
        stats: { vidaMax: 10 },
        requisitos: [{ tipo: "nivel", meta: 2 }]
    },
    grito_de_guerra: {
        nombre: "Grito de Guerra", icono: "📣", tipo: "activa", usos: 1,
        requiere: "golpe_brutal",
        descripcion: "Un rugido que debilita la fuerza del enemigo en 3.",
        requisitos: [{ tipo: "nivel", meta: 3 }],
        efecto: (j, e) => { debilitarEnemigo(e, 3); return `Tu Grito de Guerra hace temblar a ${e.nombre}: pierde fuerza.`; }
    },
    brazos_de_hierro: {
        nombre: "Brazos de Hierro", icono: "💪", tipo: "pasiva", exclusivo: "temple_guerrero",
        requiere: "recio",
        descripcion: "Tus golpes pesan más.",
        danoExtra: 2,
        requisitos: [{ tipo: "nivel", meta: 3 }]
    },
    piel_de_roble: {
        nombre: "Piel de Roble", icono: "🌳", tipo: "pasiva", exclusivo: "temple_guerrero",
        requiere: "recio",
        descripcion: "Te cuesta más hacerte daño.",
        defensaExtra: 2,
        requisitos: [{ tipo: "nivel", meta: 3 }]
    },

    // ================= EXPLORADOR =================

    tajo_preciso: {
        nombre: "Tajo Preciso", icono: "🎯", tipo: "activa", usos: 2, auto: true,
        descripcion: "Golpea ignorando la defensa del enemigo.",
        efecto: (j, e) => `Tu Tajo Preciso encuentra el punto débil: ${golpeHabilidad(e, 1.2, true)} de daño.`
    },
    ojo_de_aguila: {
        nombre: "Ojo de Águila", icono: "🦅", tipo: "pasiva",
        requiere: "tajo_preciso",
        descripcion: "Aprendes más de cada lugar que recorres.",
        expMultiplicador: 1.05,
        requisitos: [{ tipo: "registro", clave: "lugaresVisitados", meta: 3, texto: "Visita 3 lugares distintos" }]
    },
    pies_ligeros: {
        nombre: "Pies Ligeros", icono: "👣", tipo: "pasiva", exclusivo: "instinto_explorador",
        requiere: "ojo_de_aguila",
        descripcion: "Esquivas mejor: más agilidad y algo de defensa.",
        stats: { agilidad: 1 }, defensaExtra: 1,
        requisitos: [{ tipo: "nivel", meta: 3 }]
    },
    instinto_cazador: {
        nombre: "Instinto Cazador", icono: "🐺", tipo: "pasiva", exclusivo: "instinto_explorador",
        requiere: "ojo_de_aguila",
        descripcion: "Sabes dónde golpear.",
        danoExtra: 2,
        requisitos: [{ tipo: "nivel", meta: 3 }]
    },

    // ================= CLÉRIGO (sanador) =================

    luz_curativa: {
        nombre: "Luz Curativa", icono: "✨", tipo: "activa", mana: 20, auto: true,
        descripcion: "Recuperas el 20% de tu vida máxima + 2 por cada punto de inteligencia.",
        efecto: (j, e) => `Una Luz Curativa te envuelve y recuperas ${curarJugador(Math.ceil(j.stats.vidaMax * 0.2) + j.stats.inteligencia * 2)} HP.`
    },

    // ================= APRENDIZ ARCANO =================

    descarga_arcana: {
        nombre: "Descarga Arcana", icono: "⚡", tipo: "activa", mana: 15, auto: true,
        descripcion: "Daño mágico según tu inteligencia. Ignora la defensa.",
        efecto: (j, e) => `Una Descarga Arcana golpea al enemigo por ${danoMagico(e, 4 + j.stats.inteligencia * 3)} de daño.`
    },
    mente_clara: {
        nombre: "Mente Clara", icono: "🧠", tipo: "pasiva",
        requiere: "descarga_arcana",
        descripcion: "Pensar con calma agudiza tu magia.",
        stats: { inteligencia: 1 },
        requisitos: [{ tipo: "registro", clave: "objetosUsados", meta: 3, texto: "Usa 3 objetos (pociones...)" }]
    },
    sed_de_saber: {
        nombre: "Sed de Saber", icono: "📖", tipo: "pasiva",
        requiere: "mente_clara",
        descripcion: "Ganas más experiencia (+8%).",
        expMultiplicador: 1.08,
        requisitos: [{ tipo: "nivel", meta: 3 }]
    },

    // ================= BERSERKER =================

    furia_sangrienta: {
        nombre: "Furia Sangrienta", icono: "🩸", tipo: "activa", usos: 1, auto: true,
        descripcion: "Golpe devastador (x2.5 de daño). Te cuesta el 10% de tu vida máxima.",
        efecto: (j, e) => {
            const dano = golpeHabilidad(e, 2.5);
            const coste = Math.ceil(j.stats.vidaMax * 0.1);
            j.stats.vida = Math.max(1, j.stats.vida - coste);
            return `Estallas en Furia Sangrienta: ${dano} de daño (te cuesta ${coste} HP).`;
        }
    },
    sangre_caliente: {
        nombre: "Sangre Caliente", icono: "🔥", tipo: "pasiva",
        requiere: "furia_sangrienta",
        descripcion: "Cada herida te enfurece: +3 de daño.",
        danoExtra: 3,
        requisitos: [{ tipo: "registro", clave: "danoRecibido", meta: 250, texto: "Recibe 250 de daño en combate" }]
    },

    // ================= GUARDIÁN =================

    postura_firme: {
        nombre: "Postura Firme", icono: "🛡️", tipo: "activa", usos: 2, auto: true,
        descripcion: "Recuperas el 25% de tu vida máxima.",
        efecto: (j, e) => `Adoptas una Postura Firme y recuperas ${curarJugador(Math.ceil(j.stats.vidaMax * 0.25))} HP.`
    },
    muro_viviente: {
        nombre: "Muro Viviente", icono: "🧱", tipo: "pasiva",
        requiere: "postura_firme",
        descripcion: "Más defensa y más vida.",
        defensaExtra: 2, stats: { vidaMax: 10 },
        requisitos: [{ tipo: "registro", clave: "carbonPicado", meta: 80, texto: "Pica carbón 80 veces" }]
    },

    // ================= CAZADOR DE TESOROS =================

    golpe_oportuno: {
        nombre: "Golpe Oportuno", icono: "⏱️", tipo: "activa", usos: 2, auto: true,
        descripcion: "Golpe (x1.5) que además aturde: el enemigo no contraataca este turno.",
        efecto: (j, e) => {
            const dano = golpeHabilidad(e, 1.5);
            aturdirEnemigo(e, 1);
            return `Atacas en el momento justo por ${dano} de daño y dejas aturdido a ${e.nombre}.`;
        }
    },

    // ================= ACECHADOR =================

    punalada_trapera: {
        nombre: "Puñalada Trapera", icono: "🗡️", tipo: "activa", usos: 1, auto: true,
        descripcion: "Golpe (x2) que ignora la defensa.",
        efecto: (j, e) => `Clavas una Puñalada Trapera por ${golpeHabilidad(e, 2, true)} de daño.`
    },
    humo_cegador: {
        nombre: "Humo Cegador", icono: "💨", tipo: "activa", usos: 1,
        requiere: "punalada_trapera",
        descripcion: "El enemigo queda aturdido y no contraataca este turno.",
        requisitos: [{ tipo: "registro", clave: "huidas", meta: 5, texto: "Huye de 5 combates" }],
        efecto: (j, e) => { aturdirEnemigo(e, 1); return `Lanzas un Humo Cegador: ${e.nombre} no ve nada.`; }
    },

    // ================= ALQUIMISTA =================

    frasco_acido: {
        nombre: "Frasco Ácido", icono: "🧪", tipo: "activa", mana: 20, auto: true,
        descripcion: "Daño según tu inteligencia (ignora defensa) y debilita la fuerza del enemigo.",
        efecto: (j, e) => {
            const dano = danoMagico(e, 10 + j.stats.inteligencia * 2);
            debilitarEnemigo(e, 2);
            return `Tu Frasco Ácido quema a ${e.nombre} por ${dano} de daño y lo debilita.`;
        }
    },

    // ================= HECHICERO =================

    tormenta_arcana: {
        nombre: "Tormenta Arcana", icono: "🌪️", tipo: "activa", mana: 40, auto: true,
        descripcion: "Daño mágico enorme según tu inteligencia. Ignora la defensa.",
        efecto: (j, e) => `Desatas una Tormenta Arcana: ${danoMagico(e, j.stats.inteligencia * 5)} de daño.`
    }
};
