const botonSubir = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    botonSubir.classList.toggle('visible', window.scrollY > 400);
});

botonSubir.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* FILTRO */
const botonesFiltro = document.querySelectorAll('.filter-btn');
const tarjetas = document.querySelectorAll('.card-item');

botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {

    botonesFiltro.forEach(b => b.classList.remove('active'));
    boton.classList.add('active');

    const categoria = boton.dataset.filter;

    tarjetas.forEach(tarjeta => {
        const coincide = categoriaSeleccionada === 'all' || 
                tarjeta.dataset.type.includes(categoriaSeleccionada);
        tarjeta.style.display = coincide ? '' : 'none';
    });

    });
});


/* NAVBAR ACTIVO */
const secciones = document.querySelectorAll('section[id]');
const enlacesNav = document.querySelectorAll('.nav-link');

const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
        enlacesNav.forEach(enlace => {
        enlace.classList.toggle(
            'active',
            enlace.getAttribute('href') === '#' + entrada.target.id
        );
        });
    }
    });
}, { threshold: 0.4 });

secciones.forEach(sec => observador.observe(sec));

particlesJS("particles-js", {
  particles: {
    number: { value: 80 },
    color: { value: "#f0a500" },
    shape: { type: "circle" },
    opacity: { value: 0.5 },
    size: { value: 3 },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.3,
      width: 1
    },
    move: {
      enable: true,
      speed: 2
    }
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "repulse" }
    }
  }
});

