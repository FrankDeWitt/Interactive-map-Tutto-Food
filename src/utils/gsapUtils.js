import { gsap } from 'gsap';

/**
 * Crea un efecto de ripple en las coordenadas especificadas
 * @param {number} x - Coordenada X donde se producirá el efecto
 * @param {number} y - Coordenada Y donde se producirá el efecto
 * @param {HTMLElement} container - Elemento contenedor del efecto (opcional)
 * @param {Object} options - Opciones adicionales
 * @returns {HTMLElement} El elemento creado para el efecto ripple
 */
export const createRippleEffect = (x, y, container = document.body, options = {}) => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';

    const {
        color = 'rgba(255, 255, 255, 0.4)',
        size = 100,
        duration = 0.6,
        scale = 4
    } = options;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.style.backgroundColor = color;

    container.appendChild(ripple);

    gsap.to(ripple, {
        scale: scale,
        opacity: 0,
        duration: duration,
        ease: 'power1.out',
        onComplete: () => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }
    });

    return ripple;
};

/**
 * Anima el elemento origen al destino con un efecto de morfismo
 * @param {Object} origin - Datos del elemento origen {x, y, width, height}
 * @param {Object} target - Datos del elemento destino {x, y, width, height}
 * @param {Object} options - Opciones de animación
 */
export const morphElementToModal = (origin, target, options = {}) => {
    const {
        duration = 0.5,
        ease = 'power2.inOut',
        onUpdate = null,
        onComplete = null,
        backgroundColor = 'white',
        className = 'modal-transition-element',
        appendTo = document.body
    } = options;

    // Crear elemento de transición
    const transitionEl = document.createElement('div');
    transitionEl.className = className;
    transitionEl.style.position = 'fixed';
    transitionEl.style.zIndex = '1001';
    transitionEl.style.backgroundColor = backgroundColor;
    transitionEl.style.borderRadius = '8px';
    transitionEl.style.overflow = 'hidden';
    transitionEl.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';

    // Si hay contenido para mostrar dentro del elemento de transición
    if (options.content) {
        transitionEl.innerHTML = options.content;
    }

    // Si hay un logo para mostrar
    if (origin.logoSrc) {
        const logoImg = document.createElement('img');
        logoImg.src = origin.logoSrc;
        logoImg.style.position = 'absolute';
        logoImg.style.top = '50%';
        logoImg.style.left = '50%';
        logoImg.style.transform = 'translate(-50%, -50%)';
        logoImg.style.maxWidth = '80%';
        logoImg.style.maxHeight = '70%';
        logoImg.style.objectFit = 'contain';
        transitionEl.appendChild(logoImg);
    }

    // Añadir al DOM
    appendTo.appendChild(transitionEl);

    // Configurar posición inicial
    gsap.set(transitionEl, {
        top: origin.y,
        left: origin.x,
        width: origin.width,
        height: origin.height
    });

    // Animar al tamaño final
    return gsap.to(transitionEl, {
        top: target.y,
        left: target.x,
        width: target.width,
        height: target.height,
        borderRadius: target.borderRadius || '24px',
        duration: duration,
        ease: ease,
        onUpdate: onUpdate,
        onComplete: () => {
            if (onComplete) {
                onComplete(transitionEl);
            }
        }
    });
};

/**
 * Crea un efecto de pulsación en un elemento
 * @param {HTMLElement} element - Elemento a animar
 * @param {Object} options - Opciones del efecto
 */
export const createPulseEffect = (element, options = {}) => {
    const {
        scale = 1.05,
        duration = 0.2,
        repeat = 1,
        color = 'rgba(231, 76, 60, 0.3)',
        returnToOriginal = true
    } = options;

    // Guardamos los estilos originales
    const originalBg = element.style.backgroundColor;
    const originalShadow = element.style.boxShadow;
    const originalTransform = element.style.transform;

    // Crear la animación de pulso
    const tl = gsap.timeline();

    tl.to(element, {
        backgroundColor: color,
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
        scale: scale,
        duration: duration / 2,
        ease: 'power1.out'
    }).to(element, {
        backgroundColor: originalBg,
        boxShadow: originalShadow,
        scale: 1,
        duration: duration / 2,
        ease: 'power1.in'
    });

    // Repetir si es necesario
    if (repeat > 1) {
        tl.repeat(repeat - 1);
    }

    // Regresar al estado original
    if (returnToOriginal) {
        tl.to(element, {
            backgroundColor: originalBg,
            boxShadow: originalShadow,
            transform: originalTransform,
            clearProps: 'backgroundColor,boxShadow,transform',
            duration: 0.1
        });
    }

    return tl;
};

/**
 * Anima elementos entrando con diferentes efectos
 * @param {string|Element} elements - Selector o elementos a animar
 * @param {Object} options - Opciones de animación
 */
export const animateElementsIn = (elements, options = {}) => {
    const {
        type = 'fade-up',
        duration = 0.5,
        stagger = 0.1,
        delay = 0,
        ease = 'power2.out',
        from = {},
        to = {}
    } = options;

    // Definir animaciones según el tipo
    let fromVars = {
        opacity: 0,
        y: 20,
        ...from
    };

    let toVars = {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        delay,
        ease,
        ...to
    };

    // Ajustar animación según el tipo
    switch (type) {
        case 'fade':
            fromVars = { opacity: 0, ...from };
            toVars = { opacity: 1, duration, stagger, delay, ease, ...to };
            break;
        case 'fade-down':
            fromVars = { opacity: 0, y: -20, ...from };
            toVars = { opacity: 1, y: 0, duration, stagger, delay, ease, ...to };
            break;
        case 'fade-left':
            fromVars = { opacity: 0, x: -20, ...from };
            toVars = { opacity: 1, x: 0, duration, stagger, delay, ease, ...to };
            break;
        case 'fade-right':
            fromVars = { opacity: 0, x: 20, ...from };
            toVars = { opacity: 1, x: 0, duration, stagger, delay, ease, ...to };
            break;
        case 'zoom-in':
            fromVars = { opacity: 0, scale: 0.8, ...from };
            toVars = { opacity: 1, scale: 1, duration, stagger, delay, ease, ...to };
            break;
        case 'zoom-out':
            fromVars = { opacity: 0, scale: 1.2, ...from };
            toVars = { opacity: 1, scale: 1, duration, stagger, delay, ease, ...to };
            break;
    }

    return gsap.fromTo(elements, fromVars, toVars);
};

export default {
    createRippleEffect,
    morphElementToModal,
    animateElementsIn,
    createPulseEffect
};