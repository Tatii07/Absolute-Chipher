// misiones.js
// Misiones generadas con VOCABULARIO + PLANTILLAS ENCADENADAS.
// Idea clave: primero se genera la misión como DATOS (tipo, objeto, cantidad)
// y después se convierte en TEXTO. Así el juego siempre puede comprobar si
// la misión se cumplió, sin importar cómo suene la frase.

(function () {

    // Todo el estado de misiones en un solo objeto (fácil de guardar y reiniciar)
    window.misiones = { activa: null, hechas: 0, ultimoTipo: null, visitadas: {} };

    window.reiniciarMisiones = function () {
        window.misiones = { activa: null, hechas: 0, ultimoTipo: null, visitadas: {} };
    };

    // Se llama desde cargarEscena para saber qué lugares ya visitó el jugador
    window.registrarVisita = function (escena) {
        window.misiones.visitadas[escena] = true;
    };

    // ---------- 1) VOCABULARIO: palabras sueltas agrupadas por función ----------
    const vocab = {
        verbosRecolectar: ["reúne", "consigue", "junta", "tráeme"],
        verbosVisitar:    ["explora", "revisa", "inspecciona"],
        conectores:       ["Además,", "Después de eso,", "Ahora que cumpliste,", "Escucha bien:"],
        motivos: [
            "los capataces vigilan menos hoy",
            "alguien paga bien por ello",
            "dicen que ahí se esconde algo"
        ],
        // Solo cosas que el jugador SÍ puede lograr hoy en el juego.
        // Para ampliar el juego, agrega aquí más materiales y lugares.
        materiales: [{ id: "carbon", min: 5, max: 12 }],
        lugares:    [{ id: "almacen", nombre: "el almacén abandonado" }]
    };

    // ---------- 2) FRASES DE HISTORIA: dependen de lo que ya hizo el jugador ----------
    const historia = [
        { si: () => window.exploroZonaOculta,      texto: "Desde que hallaste aquel brillo entre el carbón, los otros esclavos te miran distinto." },
        { si: () => window.jugador.nivel >= 2,     texto: "Ya no eres el mismo que llegó a esta mina." },
        { si: () => window.misiones.hechas >= 3,   texto: "El capataz empieza a confiar en ti." }
    ];

    // ---------- 3) PLANTILLAS: cada una crea los DATOS de una misión ----------
    const plantillas = [
        {
            tipo: "recolectar",
            valida: (ultimo) => true, // puede salir después de cualquier misión
            crear() {
                const mat = elegir(vocab.materiales);
                const cantidad = azar(mat.min, mat.max) + window.misiones.hechas * 2; // escala con el progreso
                const nombre = window.dbItems[mat.id].nombre.toLowerCase();
                return {
                    tipo: "recolectar", item: mat.id, cantidad: cantidad,
                    frase: `${elegir(vocab.verbosRecolectar)} ${cantidad} de ${nombre}`
                };
            }
        },
        {
            tipo: "visitar",
            valida: (ultimo) => ultimo !== "visitar", // ENCADENACIÓN: nunca dos "visitar" seguidas
            crear() {
                const lugar = elegir(vocab.lugares);
                window.misiones.visitadas[lugar.id] = false; // cuenta solo desde que se pidió la misión
                return {
                    tipo: "visitar", lugar: lugar.id,
                    frase: `${elegir(vocab.verbosVisitar)} ${lugar.nombre}`
                };
            }
        }
    ];

    // ---------- 4) GENERAR, MOSTRAR Y COMPROBAR ----------
    window.generarMision = function () {
        const estado = window.misiones;
        const opciones = plantillas.filter(p => p.valida(estado.ultimoTipo));
        const m = elegir(opciones).crear();

        m.conector = estado.hechas > 0 ? elegir(vocab.conectores) : "";
        m.motivo = elegir(vocab.motivos);
        const frasesHistoria = historia.filter(h => h.si()).map(h => h.texto);
        m.historia = frasesHistoria.length ? elegir(frasesHistoria) : "";

        estado.activa = m;
        estado.ultimoTipo = m.tipo;
    };

    window.textoMision = function () {
        const m = window.misiones.activa;
        if (!m) return "No tienes ninguna misión.";
        const inicio = m.conector ? `${m.conector} ${m.frase}` : capitalizar(m.frase);
        return `${inicio}, porque ${m.motivo}.` + (m.historia ? `\n${m.historia}` : "");
    };

    window.progresoMision = function () {
        const m = window.misiones.activa;
        if (!m) return "";
        if (m.tipo === "recolectar") {
            const it = inventario.find(i => i.id === m.item);
            return `Progreso: ${it ? it.cantidad : 0}/${m.cantidad}`;
        }
        return window.misiones.visitadas[m.lugar] ? "¡Ya estuviste ahí! Vuelve con el capataz." : "Aún no has ido.";
    };

    window.misionCompleta = function () {
        const m = window.misiones.activa;
        if (!m) return false;
        if (m.tipo === "recolectar") return tieneItem(m.item, m.cantidad);
        if (m.tipo === "visitar") return !!window.misiones.visitadas[m.lugar];
        return false;
    };

    window.entregarMision = function () {
        const m = window.misiones.activa;
        if (!m || !window.misionCompleta()) return;

        if (m.tipo === "recolectar") gastarItem(m.item, m.cantidad);

        const oro = 10 + window.misiones.hechas * 5;
        const xp = 20 + window.misiones.hechas * 5;
        window.jugador.oro += oro;
        window.misiones.hechas++;
        window.misiones.activa = null;

        mostrarAviso(`📜 ¡Misión cumplida! +${oro} de oro y +${xp} de XP.`);
        ganarExperiencia(xp); // si sube de nivel, este aviso reemplaza al anterior
        actualizarHUD();
    };

    // ---------- Ayudas ----------
    function elegir(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
    function azar(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
    function capitalizar(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

})();
