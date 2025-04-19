<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { gsap } from 'gsap';
import ScreensaverEnhanced from './components/ScreenSaver.vue';

const isScreensaverEnabled = ref(true);
const route = useRoute();
const isTransitioning = ref(false);
const oldPath = ref(route.path);

// Configurar observador de cambios de ruta
watch(() => route.path, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    // Activar transición
    isTransitioning.value = true;
  }
});

// Controlar animaciones de página
const onBeforeLeave = (el) => {
  // Guardar la posición de desplazamiento
  el.dataset.scrollY = window.scrollY;

  // Congelar la posición para que la animación se vea bien
  gsap.set(el, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1
  });

  // Animación de salida
  gsap.to(el, {
    opacity: 0,
    x: -30,
    duration: 0.5,
    ease: 'power2.inOut'
  });
};

const onLeave = (el, done) => {
  gsap.to(el, {
    duration: 0.1,
    onComplete: done
  });
};

const onEnter = (el, done) => {
  // Configurar estado inicial
  gsap.set(el, {
    opacity: 0,
    x: 30
  });

  // Animación de entrada
  gsap.to(el, {
    opacity: 1,
    x: 0,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => {
      isTransitioning.value = false;
      done();
    }
  });
};

const onAfterEnter = (el) => {
  // Restablecer estilos
  gsap.set(el, {
    clearProps: 'all'
  });
};

onMounted(() => {
  // Configurar la animación inicial de entrada
  const mainContent = document.querySelector('.page-content');
  if (mainContent) {
    gsap.fromTo(mainContent,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }
});
</script>

<template>
  <div class="app-container">
<!--    <ScreensaverEnhanced v-if="isScreensaverEnabled" :timeout="60000" />-->

    <!-- Transición entre rutas -->
    <transition
        @before-leave="onBeforeLeave"
        @leave="onLeave"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        :css="false"
    >
      <router-view class="page-content" :key="route.path" />
    </transition>
  </div>
</template>

<style>
/* Estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', Arial, sans-serif;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.page-content {
  position: relative;
  height: 100%;
  width: 100%;
}

/* Personalización de la barra de desplazamiento */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Mejoras para dispositivos táctiles */
.touch-device button,
.touch-device a,
.touch-device [role="button"],
.touch-device [tabindex="0"] {
  min-height: 44px;
  min-width: 44px;
}

/* Clases de utilidad para animaciones */
.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.animate-slide-up {
  animation: slideUp 0.5s ease forwards;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>