<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { foodWineCatalog } from '@/data/foods-wines-catalog';
import { getPreloadedImageSrc, preloadImage } from '@/utils/imageService';
import loveHeader from '@/assets/images/love-header.png';
import { gsap } from 'gsap'; // Importamos GSAP para animaciones suaves

const props = defineProps({
  timeout: {
    type: Number,
    default: 60000 // 1 minuto de inactividad antes de mostrar
  }
});

const isVisible = ref(false);
const inactivityTimer = ref(null);
const phraseIndex = ref(0);
const companyIndex = ref(0);
const imagesLoaded = ref(false);
const router = useRouter();
const route = useRoute();
const colorIndex = ref(0);
const isTransitioning = ref(false);
const backgroundElement = ref(null);

// Colores para la transición del fondo (paleta mejorada)
const backgroundColors = [
  { start: '#FF7E5F', end: '#FFA87D' },    // Naranja-rojizo a naranja claro
  { start: '#FFA87D', end: '#FFD166' },    // Naranja claro a amarillo dorado
  { start: '#FFD166', end: '#FF6B6B' },    // Amarillo dorado a rojo coral
  { start: '#FF6B6B', end: '#FF8C94' },    // Rojo coral a rosa-rojo
  { start: '#FF8C94', end: '#FF5F86' },    // Rosa-rojo a rosa intenso
  { start: '#FF5F86', end: '#FF7E5F' },    // Rosa intenso a naranja-rojizo (vuelve al inicio)
];

// Determinar el catálogo actual basado en la URL
const currentCatalog = computed(() => {
  const path = route.path;
  if (path.includes('meat-cured-meat')) {
    return foodWineCatalog[0];
  } else if (path.includes('speciality')) {
    return foodWineCatalog[1];
  } else {
    // Si estamos en la página principal, no mostrar ningún catálogo específico
    return null;
  }
});

// Estilo calculado para el fondo con gradiente
const backgroundStyle = computed(() => {
  const colors = backgroundColors[colorIndex.value];
  return {
    background: `linear-gradient(135deg, ${colors.start}, ${colors.end})`,
  };
});

// Lista de empresas a mostrar
const companies = computed(() => {
  if (!currentCatalog.value) return [];
  return currentCatalog.value.companies || [];
});

// Empresa actual para mostrar
const currentCompany = computed(() => {
  if (companies.value.length === 0) return null;
  return companies.value[companyIndex.value];
});

// Función para obtener la URL de la imagen de la empresa
const getCompanyLogoSrc = (company) => {
  if (!company || !company.logo) return '';

  const preloadedSrc = getPreloadedImageSrc(`company_${company.id}`);
  if (preloadedSrc) return preloadedSrc;

  return company.logo.startsWith('/')
      ? company.logo
      : `/src/assets/logos/${company.logo}`;
};

// Frases promocionales generales
const generalPhrases = [
  "Discover the authentic flavors of Castilla y León",
  "Experience the tradition of Spanish cuisine",
  "Quality foods and wines waiting for you",
  "Touch to explore our exhibitors",
  "The best selection of Spanish delicacies"
];

// Frases relacionadas con empresas
const getCompanyPhrases = (company) => {
  if (!company) return [];

  return [
    `Visit ${company.name} at ${company.stand}`,
    `Explore ${company.name}'s products`,
    `${company.name} - Quality from Castilla y León`,
    `Discover ${company.name} at our fair`
  ];
};

// Frases a mostrar (generales o específicas de empresa)
const currentPhrases = computed(() => {
  if (!currentCompany.value) return generalPhrases;

  // Alternar entre frases generales y específicas de la empresa
  return [...getCompanyPhrases(currentCompany.value), ...generalPhrases];
});

// Función mejorada para animar la transición de color de fondo usando GSAP
const animateBackgroundTransition = () => {
  if (!backgroundElement.value) return;

  const nextIndex = (colorIndex.value + 1) % backgroundColors.length;
  const nextColors = backgroundColors[nextIndex];

  gsap.to(backgroundElement.value, {
    background: `linear-gradient(135deg, ${nextColors.start}, ${nextColors.end})`,
    duration: 3.5,
    ease: "power2.inOut",
    onComplete: () => {
      colorIndex.value = nextIndex;
    }
  });
};

// Función para ocultar completamente el screensaver
const hideScreensaver = () => {
  isTransitioning.value = true;
  isVisible.value = false;

  // Esperar a que se complete la transición antes de eliminar los eventos
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500); // Mismo tiempo que la duración de la transición CSS
};

// Función para reiniciar el temporizador de inactividad
const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer.value);

  if (isVisible.value) {
    // Si el screensaver está visible, ocultarlo completamente
    hideScreensaver();
  } else {
    // Configurar nuevo temporizador
    inactivityTimer.value = setTimeout(() => {
      isVisible.value = true;
      startAnimations();
    }, props.timeout);
  }
};

// Precargar imágenes de empresas
const preloadCompanyImages = async () => {
  if (companies.value.length === 0) return;

  const imagePromises = companies.value.map(company => {
    if (company && company.logo) {
      if (!getPreloadedImageSrc(`company_${company.id}`)) {
        return preloadImage(company.logo, `company_${company.id}`);
      }
    }
    return Promise.resolve();
  });

  try {
    await Promise.all(imagePromises);
    imagesLoaded.value = true;
  } catch (error) {
    console.error('Error al precargar imágenes para el screensaver:', error);
  }
};

// Intervalos para las animaciones
let phraseInterval = null;
let companyInterval = null;
let colorInterval = null;

// Iniciar animaciones cíclicas
const startAnimations = () => {
  // Limpiar intervalos existentes si los hay
  clearAnimationIntervals();

  // Cambiar frase cada 4 segundos
  phraseInterval = setInterval(() => {
    phraseIndex.value = (phraseIndex.value + 1) % currentPhrases.value.length;
  }, 4000);

  // Cambiar empresa cada 8 segundos (cada 2 frases)
  companyInterval = setInterval(() => {
    if (companies.value.length > 1) {
      companyIndex.value = (companyIndex.value + 1) % companies.value.length;
    }
  }, 8000);

  // Cambiar color de fondo cada 15 segundos con transición más suave
  colorInterval = setInterval(() => {
    animateBackgroundTransition();
  }, 15000);

  // Iniciar la primera animación de fondo
  nextTick(() => {
    animateBackgroundTransition();
  });
};

// Limpiar todos los intervalos de animación
const clearAnimationIntervals = () => {
  if (phraseInterval) clearInterval(phraseInterval);
  if (companyInterval) clearInterval(companyInterval);
  if (colorInterval) clearInterval(colorInterval);

  phraseInterval = null;
  companyInterval = null;
  colorInterval = null;
};

// Manejar toques en el screensaver
const handleScreensaverClick = () => {
  hideScreensaver();
  resetInactivityTimer();
};

// Ver detalles de la empresa actual
const viewCompanyDetails = (event) => {
  if (!currentCompany.value) return;

  // Detener la propagación para evitar que se oculte el screensaver
  event.stopPropagation();

  // Emitir evento para abrir el modal de la empresa
  window.dispatchEvent(new CustomEvent('company-selected', {
    detail: { company: currentCompany.value }
  }));

  // Ocultar el screensaver completamente
  hideScreensaver();
  resetInactivityTimer();
};

// Asegúrarse de que las animaciones se detengan cuando el componente se oculta
watch(isVisible, (newValue) => {
  if (!newValue) {
    clearAnimationIntervals();
  }
});

// Importar nextTick desde Vue para asegurarnos de que el DOM esté listo
import { nextTick } from 'vue';

onMounted(async () => {
  // Precargar imágenes
  await preloadCompanyImages();

  // Configurar detectores de eventos para reiniciar el temporizador
  document.addEventListener('mousemove', resetInactivityTimer);
  document.addEventListener('mousedown', resetInactivityTimer);
  document.addEventListener('keypress', resetInactivityTimer);
  document.addEventListener('touchstart', resetInactivityTimer);
  document.addEventListener('scroll', resetInactivityTimer);

  // Iniciar el temporizador por primera vez
  resetInactivityTimer();
});

onBeforeUnmount(() => {
  // Limpiar eventos y temporizadores
  document.removeEventListener('mousemove', resetInactivityTimer);
  document.removeEventListener('mousedown', resetInactivityTimer);
  document.removeEventListener('keypress', resetInactivityTimer);
  document.removeEventListener('touchstart', resetInactivityTimer);
  document.removeEventListener('scroll', resetInactivityTimer);

  clearTimeout(inactivityTimer.value);
  clearAnimationIntervals();
});
</script>

<template>
  <!-- Solo renderizar el screensaver si está visible o en transición -->
  <transition name="fade">
    <div
        v-if="isVisible || isTransitioning"
        class="screensaver"
        @click="handleScreensaverClick"
        :style="backgroundStyle"
        ref="backgroundElement"
    >
      <div class="screensaver-content">
        <img :src="loveHeader" alt="Love Wines & Food" class="main-logo" />

        <div class="title-area">
          <h1 class="title">Foods & Wines from Castilla y León</h1>

          <transition name="phrase-slide" mode="out-in">
            <p :key="phraseIndex" class="promo-phrase">{{ currentPhrases[phraseIndex] }}</p>
          </transition>
        </div>

        <div v-if="currentCatalog" class="catalog-info">
          <div class="catalog-card">
            <h2>{{ currentCatalog.name }}</h2>
            <p>{{ currentCatalog.hall }}</p>
          </div>
        </div>

        <!-- Sección de empresas -->
        <transition name="fade-scale" mode="out-in">
          <div v-if="currentCompany" :key="currentCompany.id" class="company-showcase">
            <div class="company-card">
              <div class="company-logo-wrapper">
                <img
                    :src="getCompanyLogoSrc(currentCompany)"
                    :alt="currentCompany.name"
                    class="company-logo"
                />
              </div>
              <div class="company-info">
                <h3>{{ currentCompany.name }}</h3>
                <div v-if="currentCompany.stand" class="company-stand">
                  STAND {{ currentCompany.stand }}
                </div>
                <button
                    @click="viewCompanyDetails($event)"
                    class="company-detail-btn"
                >
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </transition>

        <div class="touch-indicator">
          <div class="touch-ripple"></div>
          <div class="touch-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
          </div>
          <p>Touch to Explore</p>
        </div>
      </div>

      <!-- Elementos decorativos flotantes mejorados -->
      <div class="floating-elements">
        <div class="float-element element-1"></div>
        <div class="float-element element-2"></div>
        <div class="float-element element-3"></div>
        <div class="float-element element-4"></div>
        <div class="float-element element-5"></div>
        <div class="float-element element-6"></div>
        <div class="float-element element-7"></div>
        <div class="float-element element-8"></div>
        <div class="float-element element-9"></div>
        <div class="float-element element-10"></div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.screensaver {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  overflow: hidden;
  pointer-events: auto; /* Asegura que los eventos mouse/touch funcionen */
  transition: opacity 0.5s ease;
}

/* Importante: cuando el screensaver no es visible,
   no debe interceptar los eventos de mouse/touch */
.fade-leave-active.screensaver {
  pointer-events: none;
}

.screensaver-content {
  text-align: center;
  max-width: 800px;
  width: 90%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.main-logo {
  width: 60%;
  max-width: 400px;
  margin-bottom: 20px;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3));
  animation: float 4s ease-in-out infinite;
}

.title-area {
  margin-bottom: 20px;
}

.title {
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  opacity: 0;
  animation: fadeSlideUp 1s forwards 0.5s;
}

.promo-phrase {
  font-size: 2rem;
  font-weight: 300;
  font-style: italic;
  text-shadow: 0 2px 6px rgba(0,0,0,0.3);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.catalog-info {
  margin-bottom: 20px;
  opacity: 0;
  animation: fadeSlideUp 1s forwards 1s;
}

.catalog-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  animation: pulse 3s infinite;
}

.catalog-card h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.catalog-card p {
  font-size: 1.2rem;
  opacity: 0.8;
}

/* Estilos para showcase de empresa */
.company-showcase {
  width: 100%;
  margin: 20px 0;
}

.company-card {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 30px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
}

.company-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.company-logo-wrapper {
  width: 120px;
  height: 120px;
  background-color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.company-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.company-info {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.company-info h3 {
  font-size: 1.8rem;
  margin: 0;
  font-weight: 600;
}

.company-stand {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffcc00;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  animation: pulse 2s infinite;
}

.company-detail-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-top: 10px;
}

.company-detail-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.touch-indicator {
  position: relative;
  margin-top: 30px;
  opacity: 0;
  animation: fadeSlideUp 1s forwards 1.5s;
}

.touch-ripple {
  position: absolute;
  width: 70px;
  height: 70px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 2s infinite;
}

.touch-icon {
  position: relative;
  color: white;
  margin-bottom: 10px;
  animation: float 2s ease-in-out infinite;
}

.touch-indicator p {
  font-size: 1.2rem;
  margin-top: 15px;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.float-element {
  position: absolute;
  background-color: rgba(255,255,255,0.1);
  border-radius: 50%;
  opacity: 0.15;
  transform-origin: center center;
  filter: blur(2px);
  backdrop-filter: blur(3px);
}

.element-1 {
  width: 150px;
  height: 150px;
  top: 10%;
  left: 10%;
  animation: float1 45s infinite alternate ease-in-out;
}

.element-2 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  right: 15%;
  animation: float2 50s infinite alternate ease-in-out;
}

.element-3 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: 20%;
  animation: float3 60s infinite alternate ease-in-out;
}

.element-4 {
  width: 80px;
  height: 80px;
  top: 40%;
  right: 10%;
  animation: float4 40s infinite alternate ease-in-out;
}

.element-5 {
  width: 120px;
  height: 120px;
  top: 60%;
  left: 5%;
  animation: float5 55s infinite alternate ease-in-out;
}

/* Elementos flotantes mejorados */
.element-6 {
  width: 180px;
  height: 180px;
  top: 15%;
  right: 20%;
  animation: float6 65s infinite alternate ease-in-out;
}

.element-7 {
  width: 90px;
  height: 90px;
  bottom: 15%;
  left: 40%;
  animation: float7 42s infinite alternate ease-in-out;
}

.element-8 {
  width: 160px;
  height: 160px;
  top: 70%;
  right: 30%;
  animation: float8 58s infinite alternate ease-in-out;
}

.element-9 {
  width: 70px;
  height: 70px;
  top: 30%;
  left: 25%;
  animation: float9 48s infinite alternate ease-in-out;
}

.element-10 {
  width: 140px;
  height: 140px;
  top: 50%;
  right: 45%;
  animation: float10 52s infinite alternate ease-in-out;
}

/* Transiciones mejoradas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.phrase-slide-enter-active,
.phrase-slide-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.phrase-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.phrase-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Animaciones */
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0); }
}

@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.05); filter: brightness(1.1); }
  100% { transform: scale(1); filter: brightness(1); }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

@keyframes float1 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 0.15;
  }
  25% {
    transform: translate(120px, 50px) scale(1.2) rotate(90deg);
    opacity: 0.2;
  }
  50% {
    transform: translate(80px, 200px) scale(0.9) rotate(180deg);
    opacity: 0.18;
  }
  75% {
    transform: translate(-100px, 150px) scale(1.3) rotate(270deg);
    opacity: 0.2;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    opacity: 0.15;
  }
}

@keyframes float2 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 0.15;
  }
  30% {
    transform: translate(-150px, -80px) scale(1.4) rotate(120deg);
    opacity: 0.2;
  }
  60% {
    transform: translate(-50px, -180px) scale(0.8) rotate(240deg);
    opacity: 0.18;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    opacity: 0.15;
  }
}

@keyframes float3 {
  0% {
    transform: translate(0, 0) scale(0.9) rotate(0deg);
    opacity: 0.15;
  }
  20% {
    transform: translate(200px, -100px) scale(1.1) rotate(60deg);
    opacity: 0.2;
  }
  40% {
    transform: translate(150px, -250px) scale(0.8) rotate(120deg);
    opacity: 0.18;
  }
  60% {
    transform: translate(-100px, -200px) scale(1.2) rotate(240deg);
    opacity: 0.2;
  }
  80% {
    transform: translate(-150px, -50px) scale(0.95) rotate(300deg);
    opacity: 0.18;
  }
  100% {
    transform: translate(0, 0) scale(0.9) rotate(360deg);
    opacity: 0.15;
  }
}

@keyframes float4 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 0.15;
  }
  20% {
    transform: translate(-80px, 120px) scale(1.5) rotate(90deg);
    opacity: 0.2;
  }
  40% {
    transform: translate(-200px, 50px) scale(0.7) rotate(180deg);
    opacity: 0.18;
  }
  60% {
    transform: translate(-150px, -100px) scale(1.3) rotate(270deg);
    opacity: 0.2;
  }
  80% {
    transform: translate(-50px, -80px) scale(0.9) rotate(330deg);
    opacity: 0.18;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    opacity: 0.15;
  }
}

@keyframes float5 {
  0% {
    transform: translate(0, 0) scale(0.8) rotate(0deg);
    opacity: 0.15;
  }
  33% {
    transform: translate(150px, -120px) scale(1.3) rotate(120deg);
    opacity: 0.2;
  }
  66% {
    transform: translate(30px, -250px) scale(0.7) rotate(240deg);
    opacity: 0.18;
  }
  100% {
    transform: translate(0, 0) scale(0.8) rotate(360deg);
    opacity: 0.15;
  }
}

/* Animaciones para los elementos adicionales */
@keyframes float6 {
  0% {
    transform: translate(0, 0) scale(0.9) rotate(0deg);
    opacity: 0.15;
  }
  25% {
    transform: translate(-180px, 120px) scale(1.2) rotate(90deg);
    opacity: 0.2;
  }
  50% {
    transform: translate(-90px, 250px) scale(0.8) rotate(180deg);
    opacity: 0.18;
  }
  75% {
    transform: translate(150px, 100px) scale(1.1) rotate(270deg);
    opacity: 0.2;
  }
  100% {
    transform: translate(0, 0) scale(0.9) rotate(360deg);
    opacity: 0.15;
  }
}

@keyframes float7 {
  0% {
    transform: translate(0, 0) scale(1.1) rotate(0deg);
    opacity: 0.15;
  }
  33% {
    transform: translate(120px, -90px) scale(0.9) rotate(120deg);
    opacity: 0.2;
  }
  66% {
    transform: translate(200px, 70px) scale(1.2) rotate(240deg);
    opacity: 0.18;
  }
  100% {
    transform: translate(0, 0) scale(1.1) rotate(360deg);
    opacity: 0.15;
  }
}

@keyframes float8 {
  0% {
    transform: translate(0, 0) scale(0.95) rotate(0deg);
    opacity: 0.15;
  }
  20% {
    transform: translate(-120px, -150px) scale(1.1) rotate(60deg);
    opacity: 0.2;
  }
  40% {
    transform: translate(-220px, -50px) scale(0.85) rotate(120deg);
    opacity: 0.18;
  }
  60% {
    transform: translate(-100px, 150px) scale(1.15) rotate(240deg);
    opacity: 0.2;
  }
  80% {
    transform: translate(50px, 100px) scale(0.9) rotate(300deg);
    opacity: 0.18;
  }
  100% {
    transform: translate(0, 0) scale(0.95) rotate(360deg);
    opacity: 0.15;
  }
}

@keyframes float9 {
  0% {
    transform: translate(0, 0) scale(1.05) rotate(0deg);
    opacity: 0.15;
  }
  25% {
    transform: translate(80px, 100px) scale(0.9) rotate(90deg);
    opacity: 0.2;
  }
  50% {
    transform: translate(150px, 30px) scale(1.15) rotate(180deg);
    opacity: 0.18;
  }
  75% {
    transform: translate(70px, -80px) scale(0.95) rotate(270deg);
    opacity: 0.2;
  }
  100% {
    transform: translate(0, 0) scale(1.05) rotate(360deg);
    opacity: 0.15;
  }
}

@keyframes float10 {
  0% {
    transform: translate(0, 0) scale(0.85) rotate(0deg);
    opacity: 0.15;
  }
  20% {
    transform: translate(130px, 80px) scale(1.1) rotate(72deg);
    opacity: 0.2;
  }
  40% {
    transform: translate(90px, 200px) scale(0.95) rotate(144deg);
    opacity: 0.18;
  }
  60% {
    transform: translate(-50px, 170px) scale(1.05) rotate(216deg);
    opacity: 0.2;
  }
  80% {
    transform: translate(-120px, 50px) scale(0.9) rotate(288deg);
    opacity: 0.18;
  }
  100% {
    transform: translate(0, 0) scale(0.85) rotate(360deg);
    opacity: 0.15;
  }
}

/* Media queries para responsividad */
@media screen and (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .promo-phrase {
    font-size: 1.5rem;
    min-height: 60px;
  }

  .company-card {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .company-info {
    text-align: center;
  }

  .company-detail-btn {
    margin: 10px auto 0;
  }
}

@media screen and (min-width: 768px) and (max-width: 1280px) {
  .screensaver-content {
    max-width: 700px;
  }
}

@media screen and (min-width: 1920px) {
  .screensaver-content {
    max-width: 1000px;
  }

  .title {
    font-size: 4rem;
  }

  .promo-phrase {
    font-size: 2.5rem;
    min-height: 100px;
  }

  .company-logo-wrapper {
    width: 150px;
    height: 150px;
  }

  .company-info h3 {
    font-size: 2.2rem;
  }

  .company-stand {
    font-size: 1.6rem;
  }

  .company-detail-btn {
    padding: 10px 20px;
    font-size: 1.2rem;
  }
}
</style>