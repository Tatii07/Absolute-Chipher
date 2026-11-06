// inventario.js

// Añadir esto en inventario.js

// Ítems con los que empieza cualquier partida nueva (único lugar donde se define)
function inventarioInicial() {
    return [
        { id: "pico_hierro", nombre: "Pico de Hierro", cantidad: 1 },
        { id: "adminkey", nombre: "Llave de Admin", cantidad: 1 },
    ];
}

// Lista actual de objetos del jugador
let inventario = inventarioInicial();

// Función para agregar un objeto desde cualquier escena
function ganarItem(idItem, cantidad = 1) {
    // Buscamos si el objeto existe en la base de datos
    const itemInfo = window.dbItems[idItem];
    if (!itemInfo) return;

    // Vemos si ya lo tiene en el inventario
    const itemExistente = inventario.find(i => i.id === idItem);

    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        inventario.push({
            id: idItem,
            nombre: itemInfo.nombre,
            cantidad: cantidad
        });
    }
    console.log(`¡Has conseguido ${cantidad}x ${itemInfo.nombre}!`);
}

// Función para quitar o gastar un objeto del inventario
function gastarItem(idItem, cantidad = 1) {
    const item = inventario.find(i => i.id === idItem);
    
    if (item && item.cantidad >= cantidad) {
        item.cantidad -= cantidad; // Resta la cantidad
        
        // Si la cantidad llega a 0 o menos, lo borramos completamente de la lista
        if (item.cantidad <= 0) {
            inventario = inventario.filter(i => i.id !== idItem);
        }
        return true; // Éxito: sí se pudo gastar
    }
    
    return false; // No se pudo gastar (no tenías suficiente o no lo tienes)
}

// Función auxiliar para verificar si el jugador tiene un objeto
function tieneItem(idItem, cantidad = 1) {
    const item = inventario.find(i => i.id === idItem);
    return !!item && item.cantidad >= cantidad;
}


function abrirPantallaInventario() {
    const textoHistoria = document.getElementById("texto-historia");
    const contenedorBotones = document.querySelector(".opciones-container");
    const botonMochila = document.getElementById("btn-mochila-fijo");
    const botonStats = document.getElementById("btn-stats-fijo");
    const pantallaInv = document.getElementById("pantalla-inventario");

    textoHistoria.style.display = "none";
    contenedorBotones.style.display = "none";
    if (botonMochila) botonMochila.style.display = "none";
    if (botonStats) botonStats.style.display = "none";

    pantallaInv.classList.remove("oculto");
    pantallaInv.innerHTML = "<h2 style='color: #f3e5ab; margin-bottom: 5px;'>🎒 MOCHILA</h2>";

    if (inventario.length === 0) {
        pantallaInv.innerHTML += "<p style='margin:15px 0; color: #94a3b8;'>La mochila está vacía.</p>";
    } else {
        let HTMLObjetos = '<div class="grid-inventario" style="width: 90%; max-width: 320px; display: flex; flex-direction: column; gap: 8px; margin: 10px auto;">';
        
        inventario.forEach(item => {
            const infoDb = window.dbItems[item.id] || {};
            const nombreItem = infoDb.nombre || item.nombre || "Objeto desconocido";
            const descripcion = infoDb.descripcion || "Sin descripción.";
            const tieneEfecto = typeof infoDb.efecto === "function";

            HTMLObjetos += `
                <div class="slot-objeto" style="display: flex; flex-direction: column; align-items: flex-start; gap: 5px; padding: 10px; background: #0f172a; border: 1px solid #c9a050; border-radius: 6px; width: 100%;">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span style="font-weight: bold; color: #f3e5ab;">${nombreItem}</span>
                        <span class="cantidad-item" style="color: #38bdf8;">x${item.cantidad}</span>
                    </div>
                    <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 5px 0; text-align: left;">${descripcion}</p>
            `;

            if (tieneEfecto) {
                HTMLObjetos += `<button onclick="usarItemInventario('${item.id}')" class="boton-opcion" style="padding: 4px 10px; font-size: 11px; align-self: flex-end; margin-top: 5px;">Usar</button>`;
            }

            HTMLObjetos += `</div>`;
        });

        HTMLObjetos += '</div>';
        pantallaInv.innerHTML += HTMLObjetos;
    }

    const botonVolver = document.createElement("button");
    botonVolver.innerText = "⬅ Volver a la historia";
    botonVolver.className = "boton-opcion";
    botonVolver.style.marginTop = "15px";
    
    botonVolver.onclick = () => {
        pantallaInv.classList.add("oculto");
        textoHistoria.style.display = "block";
        contenedorBotones.style.display = "flex";
        if (botonMochila) botonMochila.style.display = "block";
        if (botonStats) botonStats.style.display = "block";
    };

    pantallaInv.appendChild(botonVolver);
}
