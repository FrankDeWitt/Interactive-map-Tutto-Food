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

const rippleInterval = ref(null);

const selectCompany = (company) => {
  emit('select-company', company);

  window.dispatchEvent(new CustomEvent('company-change'));

  if (rippleInterval.value) {
    clearInterval(rippleInterval.value);
    rippleInterval.value = null;
  }

  startRippleEffect();
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
});

onBeforeUnmount(() => {
  if (rippleInterval.value) {
    clearInterval(rippleInterval.value);
  }
});
</script>
<template>
  <div class="sidebar">
    <ul class="region-list">
      <li
          v-for="company in companies.companies"
          :key="company.id"
          :class="{
          'first-item': company.id === 1
        }"
          @click="selectCompany(company)"
      >
        <div class="region-item">
          <span class="region-number">{{ company.id }}.</span>
          <span class="region-name">{{ company.name }}</span>
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
$color-bg-light: #ebebeb;
$color-bg-dark: #595758;
$color-border: #ddd;
$color-active: #aedae7;
$color-hover: #e0e0e0;

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
    box-shadow: 0 0 0 0 rgba(74, 178, 222, 0.7);
  }

  70% {
    width: 250px;
    height: 250px;
    opacity: 0;
    box-shadow: 0 0 0 45px rgba(74, 178, 222, 0);
  }
}

.sidebar {
  background-color: #d7d7d7;
  overflow-y: auto;
  border-right: 1px solid $color-border;
  width: 100%;
  @include flex-center;
}

.region-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 80%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;

  li {
    &.active .region-item {
      background-color: $color-active;
      font-weight: bold;
      transition: all 0.3s ease;
      transform: translateX(10px);
      box-shadow: -5px 0 10px rgba(0, 0, 0, 0.1);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;

      .region-item {
        cursor: not-allowed;
      }
    }

    &.return-item, &.first-item {
      position: relative;
      overflow: hidden;
    }
  }
}

.region-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid $color-border;
  background-color: $color-bg-light;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: $color-hover;
  }

  .region-number {
    font-weight: bold;
  }

  .region-name {
    flex: 1;
  }

  .logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    background-color: white;
  }

  .region-logo {
    height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
    padding: 2px;
    background-color: white;
  }

  &.return {
    display: flex;
    justify-content: space-between;
    position: relative;
  }

  .return-text, .return-arrow {
    font-weight: bold;
  }
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
  .region-list {
    width: 65%;
  }

  .region-item {
    padding: 5px 15px;
    height: 55px;

    .region-number {
      margin-right: 12px;
      font-size: 1rem;
    }

    .region-name {
      font-size: 0.9rem;
      margin-right: 50px;
    }

    .logo-container {
      height: 55px; /* Misma altura que .region-item */
      width: 95px;
    }

    .region-logo {
      max-height: 100%;
      max-width: 95px;
    }

    &.return {
      padding: 16px 20px;
    }

    .return-text {
      font-size: 1.3rem;
      margin: 0 5px 5px 0;
    }

    .return-arrow {
      font-size: 1.4rem;
      margin: 6px 5px 5px 0;
    }
  }

  @keyframes ripple {
    0% {
      width: 0;
      height: 0;
      opacity: 0.8;
      box-shadow: 0 0 0 0 rgba(74, 178, 222, 0.7);
    }

    70% {
      width: 250px;
      height: 250px;
      opacity: 0;
      box-shadow: 0 0 0 45px rgba(74, 178, 222, 0);
    }
  }
}

@media screen and (min-width: 1921px) and (max-width: 2560px) {
  .region-list {
    width: 75%;
  }

  .region-item {
    padding: 10px 20px;
    height: 70px;

    .region-number {
      margin-right: 20px;
      font-size: 1.6rem;
    }

    .region-name {
      font-size: 1.5rem;
    }

    .logo-container {
      height: 70px; /* Misma altura que .region-item */
      width: 110px;
    }

    .region-logo {
      max-height: 100%;
      max-width: 110px;
    }

    &.return {
      padding: 18px 22px;
    }

    .return-text {
      font-size: 2rem;
      margin: 0 5px 5px 0;
    }

    .return-arrow {
      font-size: 2.5rem;
      margin: 10px 5px 5px 0;
    }
  }

  @keyframes ripple {
    0% {
      width: 0;
      height: 0;
      opacity: 0.8;
      box-shadow: 0 0 0 0 rgba(74, 178, 222, 0.7);
    }

    70% {
      width: 320px;
      height: 320px;
      opacity: 0;
      box-shadow: 0 0 0 60px rgba(74, 178, 222, 0);
    }
  }
}

@media screen and (min-width: 2561px) {
  .region-list {
    width: 65%;
  }

  .region-item {
    padding: 20px 125px 20px 50px;
    height: 100px;

    .region-number {
      margin-right: 30px;
      font-size: 2.2rem;
    }

    .region-name {
      font-size: 1.9rem;
    }

    .logo-container {
      height: 100px;
      width: 120px;
    }

    .region-logo {
      max-height: 100%;
      max-width: 120px;
    }

    &.return {
      padding: 20px 25px;
    }

    .return-text {
      font-size: 3rem;
      margin: 0 5px 5px 0;
    }

    .return-arrow {
      font-size: 3rem;
      margin: 14px 5px 5px 0;
    }
  }

  @keyframes ripple {
    0% {
      width: 0;
      height: 0;
      opacity: 0.8;
      box-shadow: 0 0 0 0 rgba(74, 178, 222, 0.7);
    }

    70% {
      width: 400px;
      height: 400px;
      opacity: 0;
      box-shadow: 0 0 0 70px rgba(74, 178, 222, 0);
    }
  }
}
</style>