/** * ==========================================
 * 1. UTILIDADES GLOBALES Y EVENTOS GENERALES
 * ==========================================
 */

// Cerrar modales con la tecla ESC (Unificado)
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (document.getElementById("modalPDF").classList.contains("active")) cerrarVisor();
        if (document.getElementById("modalHTML").classList.contains("active")) cerrarHTML();
    }
});

/** * ==========================================
 * 2. INTERFAZ: SCROLL, NAVBAR Y FILTROS
 * ==========================================
 */

// --- Botón Volver Arriba ---
const botonSubir = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
    botonSubir.classList.toggle('visible', window.scrollY > 400);
});
botonSubir.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Filtro de Portafolio ---
const botonesFiltro = document.querySelectorAll('.filter-btn');
const tarjetas = document.querySelectorAll('.card-item');

botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        // Remover activo de todos y asignar al clickeado
        botonesFiltro.forEach(b => b.classList.remove('active'));
        boton.classList.add('active');

        // Filtrar tarjetas (Bug corregido: variable 'categoria')
        const categoria = boton.dataset.filter;
        tarjetas.forEach(tarjeta => {
            const coincide = categoria === 'all' || tarjeta.dataset.type.includes(categoria);
            tarjeta.style.display = coincide ? '' : 'none';
        });
    });
});

// --- Navbar Activo (Intersection Observer) ---
const secciones = document.querySelectorAll('section[id]');
const enlacesNav = document.querySelectorAll('.nav-link');

const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            enlacesNav.forEach(enlace => {
                enlace.classList.toggle('active', enlace.getAttribute('href') === '#' + entrada.target.id);
            });
        }
    });
}, { threshold: 0.4 });

secciones.forEach(sec => observador.observe(sec));


/** * ==========================================
 * 3. EFECTOS: PARTICLES.JS
 * ==========================================
 */
particlesJS("particles-js", {
    particles: {
        number: { value: 80 },
        color: { value: "#f0a500" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: 3 },
        line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.3, width: 1 },
        move: { enable: true, speed: 2 }
    },
    interactivity: {
        events: { onhover: { enable: true, mode: "repulse" } }
    }
});


/** * ==========================================
 * 4. LÓGICA: MODAL VISOR PDF (FLIPBOOK)
 * ==========================================
 */
const modalPDF = document.getElementById("modalPDF");
const flipBook = document.getElementById("flipBook");
const flipLoading = document.getElementById("flipLoading");
const flipInfo = document.getElementById("flipInfo");
const zoomWrap = document.getElementById("flipZoomWrap");
const zoomLevel = document.getElementById("zoomLevel");

let flipInstance = null;
let pdfDoc = null;
let currentPdfUrl = null;
let zoomScale = 1;

// Función para inyectar scripts dinámicamente
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

// Abrir el visor PDF
window.abrirVisor = async function(pdfUrl) {
    currentPdfUrl = pdfUrl;
    modalPDF.style.display = "flex";
    requestAnimationFrame(() => modalPDF.classList.add("active"));
    document.body.style.overflow = "hidden";

    flipBook.innerHTML = "";
    flipLoading.style.display = "flex";

    try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js");

        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
        pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;

        const firstPage = await pdfDoc.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });
        const wrap = document.getElementById("flipWrap");

        // Cálculo de escala responsiva
        const availH = wrap.clientHeight - 60;
        const availW = (wrap.clientWidth - 160) / 2;
        let scale = Math.max(Math.min(availH / viewport.height, availW / viewport.width, 1.2), 0.6);

        const width = Math.floor(viewport.width * scale);
        const height = Math.floor(viewport.height * scale);
        const pages = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const vp = page.getViewport({ scale });
            const svg = await new pdfjsLib.SVGGraphics(page.commonObjs, page.objs).getSVG(await page.getOperatorList(), vp);

            const div = document.createElement("div");
            div.className = "flip-page";
            div.style.width = `${width}px`;
            div.style.height = `${height}px`;

            svg.style.width = "100%";
            svg.style.height = "100%";

            div.appendChild(svg);
            pages.push(div);
        }

        flipInstance = new St.PageFlip(flipBook, {
            width: width, height: height, size: "fixed", usePortrait: false,
            showCover: false, maxShadowOpacity: 0.35, flippingTime: 600, drawShadow: true
        });

        flipInstance.loadFromHTML(pages);
        flipInstance.updateFromHtml(pages);
        
        flipInstance.on("flip", e => flipInfo.textContent = `${e.data + 1} / ${pdfDoc.numPages}`);
        flipInfo.textContent = `1 / ${pdfDoc.numPages}`;
        flipLoading.style.display = "none";

    } catch (e) {
        flipLoading.innerHTML = "Error cargando PDF";
        console.error("Error al cargar PDF:", e);
    }
};

// Cerrar el visor PDF
window.cerrarVisor = function() {
    modalPDF.classList.remove("active");
    setTimeout(() => {
        modalPDF.style.display = "none";
        document.body.style.overflow = "";
    }, 300);
};

// Controles PDF
document.getElementById("flipPrev").onclick = () => flipInstance?.flipPrev();
document.getElementById("flipNext").onclick = () => flipInstance?.flipNext();

// Zoom PDF
document.getElementById("zoomIn").onclick = () => {
    zoomScale = Math.min(zoomScale + 0.2, 2.5);
    zoomWrap.style.transform = `scale(${zoomScale}) translateZ(0)`;
    zoomLevel.textContent = `${Math.round(zoomScale * 100)}%`;
};

document.getElementById("zoomOut").onclick = () => {
    zoomScale = Math.max(zoomScale - 0.2, 0.5);
    zoomWrap.style.transform = `scale(${zoomScale}) translateZ(0)`;
    zoomLevel.textContent = `${Math.round(zoomScale * 100)}%`;
};

// Descargar PDF
document.getElementById("btnDownload").onclick = () => {
    const a = document.createElement("a");
    a.href = currentPdfUrl;
    a.download = "";
    a.click();
};

// Cerrar al hacer clic fuera
modalPDF.addEventListener("click", e => { if (e.target === modalPDF) cerrarVisor(); });


/** * ==========================================
 * 5. LÓGICA: MODAL VISOR HTML
 * ==========================================
 */
const modalHTML = document.getElementById("modalHTML");
const visorHTML = document.getElementById("visorHTML");
const tituloHTML = document.getElementById("tituloHTML");
const htmlLoading = document.getElementById("htmlLoading");
let currentHTML = "";

// Abrir Visor HTML
window.abrirHTML = function(ruta) {
    currentHTML = ruta;
    visorHTML.src = "";
    htmlLoading.style.display = "flex";

    modalHTML.style.display = "flex";
    requestAnimationFrame(() => modalHTML.classList.add("active"));
    document.body.style.overflow = "hidden";

    tituloHTML.textContent = ruta.split("/").pop(); // Extrae nombre del archivo

    setTimeout(() => { visorHTML.src = ruta; }, 200);
    visorHTML.onload = () => { htmlLoading.style.display = "none"; };
};

// Cerrar Visor HTML
window.cerrarHTML = function() {
    modalHTML.classList.remove("active");
    setTimeout(() => {
        modalHTML.style.display = "none";
        visorHTML.src = "";
        document.body.style.overflow = "";
    }, 300);
};

// Abrir en nueva pestaña
window.abrirNuevaPestana = function() {
    window.open(currentHTML, "_blank");
};

// Cerrar al hacer clic fuera
modalHTML.addEventListener("click", e => { if (e.target === modalHTML) cerrarHTML(); });