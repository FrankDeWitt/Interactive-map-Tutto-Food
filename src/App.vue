<script setup>
import { ref } from 'vue';
import ScreensaverEnhanced from './components/ScreenSaver.vue';

const isScreensaverEnabled = ref(true);
</script>

<template>
  <div class="app-container">
    <ScreensaverEnhanced v-if="isScreensaverEnabled" :timeout="6000" />
    <router-view />
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