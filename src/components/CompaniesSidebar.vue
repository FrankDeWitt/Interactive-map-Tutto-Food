<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getPreloadedImageSrc, preloadImage } from '@/utils/imageService';

const props = defineProps({
  companies: {
    type: Object,
    required: true
  },
});

const emit = defineEmits(['select-company']);
const hoveredItemIndex = ref(null);
const activeItemIndex = ref(null);
const rippleInterval = ref(null);
const touchStartTime = ref(0);
const touchEndTime = ref(0);

const selectCompany = (company, index) => {
  // Aplica animación al elemento seleccionado
  activeItemIndex.value = index;

  // Emite el evento hacia arriba
  emit('select-company', company);

  window.dispatchEvent(new CustomEvent('company-change'));

  if (rippleInterval.value) {
    clearInterval(rippleInterval.value);
    rippleInterval.value = null;
  }

  startRippleEffect();

  // Restaurar estado activo después de un tiempo
  setTimeout(() => {
    activeItemIndex.value = null;
  }, 800);
};

const startRippleEffect = () => {
  rippleInterval.value = setInterval(() => {
    const rippleElement = document.querySelector('.ripple-container');
    if (rippleElement) {
      rippleElement.classList.remove('animate-ripple');
      void rippleElement.offsetWidth;
      rippleElement.classList.add('animate-ripple');
    }
  }, 3000);
};


const handleTouchEnd = (company, index) => {
  touchEndTime.value = Date.now();

  // Sólo activar si el toque fue rápido (menos de 300ms), comportamiento típico de tap
  if (touchEndTime.value - touchStartTime.value < 300) {
    selectCompany(company, index);
  }
};

// Función para normalizar rutas similar a la del imageService
const normalizePath = (src) => {
  // Si ya es una URL o una ruta absoluta, devolverla tal cual
  if (src.startsWith('http') || src.startsWith('/')) {
    return src;
  }

  // Convertir rutas relativas a absolutas basadas en la raíz de la aplicación
  return `/src/assets/logos/${src}`;
};

const getCompanyLogoSrc = (company) => {
  if (!company || !company.logo) return '/logos/dummy.png';

  const preloadedSrc = getPreloadedImageSrc(`company_${company.id}`);
  if (preloadedSrc) return preloadedSrc;

  return normalizePath(company.logo);
};

// Función para asegurar que las imágenes estén cargadas
const ensureImagesLoaded = async () => {
  if (props.companies && props.companies.companies) {
    const logoPromises = [];

    // Cargar todas las imágenes de empresas
    props.companies.companies.forEach(company => {
      if (company && company.logo) {
        // Intentamos precargar la imagen si aún no está en caché
        if (!getPreloadedImageSrc(`company_${company.id}`)) {
          logoPromises.push(preloadImage(company.logo, `company_${company.id}`));
        }
      }
    });

    if (logoPromises.length > 0) {
      try {
        await Promise.all(logoPromises);
        console.log(`Se han cargado ${logoPromises.length} imágenes adicionales para la barra lateral`);
      } catch (err) {
        console.error('Error al cargar imágenes para la barra lateral:', err);
      }
    }
  }
};

onMounted(async () => {
  // Iniciar el efecto de onda
  startRippleEffect();

  // Asegurar que las imágenes estén cargadas
  await ensureImagesLoaded();

  // Añadir detección para tablet/móvil
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    document.documentElement.classList.add('touch-device');
  }
});

onBeforeUnmount(() => {
  if (rippleInterval.value) {
    clearInterval(rippleInterval.value);
  }
});
</script>
<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>EXHIBITORS</h2>
      <div class="sidebar-instructions">
        <div class="instruction-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 12H3"></path><path d="m16 7 5 5-5 5"></path><path d="M7.8 7.8 3 12l4.8 4.8"></path></svg>
        </div>
        <p>Touch to see details</p>
      </div>
    </div>

    <ul class="region-list">
      <li
          v-for="(company, index) in companies.companies"
          :key="company.id"
          :class="{
            'first-item': company.id === 1,
            'active': activeItemIndex === index,
            'hovered': hoveredItemIndex === index,
            'animated-item': true
          }"
          :style="{ '--animation-delay': `${index * 0.05}s` }"
          @click="selectCompany(company, index)"
          @touchend="handleTouchEnd(company, index)"
      >
        <div class="region-item">
          <div class="region-content">
            <span class="region-number">{{ company.id }}.</span>
            <span class="region-name">{{ company.name }}</span>
          </div>
          <div class="logo-container">
            <img :src="getCompanyLogoSrc(company)" :alt="company.name" class="region-logo" />
          </div>
          <div class="ripple-container"></div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
/* Variables para reutilización */
$color-bg-light: #f5f5f5;
$color-bg-dark: #212b36;
$color-border: #e0e0e0;
$color-active: #ff3d3d;
$color-hover: #f8f8f8;
$color-text: #333;
$color-accent: #e74c3c;
$transition-bezier: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Mixins para reutilización */
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Animaciones */
@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.8;
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
  }

  70% {
    width: 250px;
    height: 250px;
    opacity: 0;
    box-shadow: 0 0 0 45px rgba(231, 76, 60, 0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.sidebar {
  background-color: $color-bg-light;
  overflow: hidden;
  border-right: 1px solid $color-border;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: inset -5px 0 15px rgba(0, 0, 0, 0.03);
}

.sidebar-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid $color-border;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.sidebar-header h2 {
  margin: 0 0 0.5rem 0;
  color: $color-bg-dark;
  font-weight: 600;
  letter-spacing: 1px;
}

.sidebar-instructions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.instruction-icon {
  color: $color-accent;
  animation: pulse 2s infinite;
}

.sidebar-instructions p {
  margin: 0;
}

.region-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  height: calc(100% - 110px);
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  flex: 1;
}

.region-list li {
  position: relative;
  opacity: 0;
  animation: fadeInLeft 0.5s forwards;
  animation-delay: var(--animation-delay);
  flex: 1;
  min-height: 0;
  display: flex;
  padding: 0.45rem 0;
}

.region-list li.active .region-item {
  background-color: rgba(231, 76, 60, 0.1);
  transform: translateX(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-left: 4px solid $color-accent;
}

.region-list li.active .region-item .region-name {
  color: $color-accent;
  font-weight: 600;
}

.region-list li.hovered .hover-overlay {
  opacity: 1;
  visibility: visible;
}

.region-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $color-border;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s $transition-bezier;
  position: relative;
  overflow: hidden;
  padding: 0.4rem 0.6rem;
  margin: 0 0.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  flex: 1;
  min-height: 0;
}

.region-item:hover {
  background-color: $color-hover;
  transform: translateX(5px);
}

.region-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: calc(100% - 80px);
}

.region-number {
  font-weight: bold;
  color: $color-accent;
  font-size: 1rem;
  min-width: 20px;
}

.region-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: $color-text;
  transition: color 0.3s ease;
  font-weight: 500;
}

.logo-container {
  display: flex;
  align-items: center;
  background-color: #ededed;
  justify-content: center;
  height: 40px;
  width: 70px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.region-logo {
  max-height: 90%;
  max-width: 90%;
  object-fit: contain;
  display: block;
  transition: transform 0.3s ease;
}

.region-item:hover .region-logo {
  transform: scale(1.05);
}

.ripple-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: rgba(0, 0, 0, 0);
  border-radius: 50%;
  pointer-events: none;
}

.animate-ripple {
  animation: ripple 3s ease-out;
}

/* Responsive styles */
@media screen and (max-width: 1920px) {
  .region-item {
    padding: 0.3rem 0.5rem;
    /* Removido: altura fija */
  }

  .region-content {
    gap: 0.3rem;
  }

  .region-number {
    margin-right: 4px;
    font-size: 0.9rem;
  }

  .region-name {
    font-size: 0.85rem;
  }

  .logo-container {
    height: 36px;
    width: 60px;
  }

  .sidebar-header {
    padding: 1rem;
  }

  .sidebar-header h2 {
    font-size: 1.2rem;
  }

  .region-list {
    height: calc(100% - 90px);
  }

  @keyframes ripple {
    0% {
      width: 0;
      height: 0;
      opacity: 0.8;
    }

    70% {
      width: 250px;
      height: 250px;
      opacity: 0;
    }
  }
}

@media screen and (min-width: 1921px) and (max-width: 2560px) {
  .region-item {
    padding: 0.5rem 0.8rem;
  }

  .region-number {
    margin-right: 8px;
    font-size: 1.1rem;
  }

  .region-name {
    font-size: 1rem;
  }

  .logo-container {
    height: 45px;
    width: 75px;
  }

  @keyframes ripple {
    0% {
      width: 0;
      height: 0;
      opacity: 0.8;
    }

    70% {
      width: 320px;
      height: 320px;
      opacity: 0;
    }
  }
}

@media screen and (min-width: 2561px) {
  .region-item {
    padding: 0.6rem 1rem;
  }

  .region-number {
    margin-right: 10px;
    font-size: 1.3rem;
  }

  .region-name {
    font-size: 1.8rem;
  }

  .logo-container {
    height: 100px;
    width: 180px;
  }

  .sidebar-header {
    padding: 1.5rem;
  }

  .sidebar-header h2 {
    font-size: 1.6rem;
  }

  .sidebar-instructions p {
    font-size: 1rem;
  }

  .region-list {
    height: calc(100% - 100px);
  }

  @keyframes ripple {
    0% {
      width: 0;
      height: 0;
      opacity: 0.8;
    }

    70% {
      width: 400px;
      height: 400px;
      opacity: 0;
    }
  }
}
</style>