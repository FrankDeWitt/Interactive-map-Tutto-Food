<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, provide } from 'vue';
import { foodWineCatalog } from '@/data/foods-wines-catalog';
import CompaniesSidebar from '@/components/CompaniesSidebar.vue';
import ContentPanel from '@/components/ContentPanel.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import CompanyContent from '@/components/context/CompanyContent.vue';
import { preloadCatalogImages } from '@/utils/imageService';
import { gsap } from 'gsap';
import loveHeader from '../assets/images/love-header.png';
import backgroundImage from '../assets/images/background.jpg';

const props = defineProps({
  catalogIndex: {
    type: Number,
    required: true
  }
});

const isLoading = ref(true);
const loadingProgress = ref(0);
const selectedCompany = ref(null);
const loadingError = ref(false);
const isModalOpen = ref(false);
const currentCatalogId = ref(null);
const animationInProgress = ref(false);
const transitionElement = ref(null);

const catalogData = computed(() => {
  return foodWineCatalog[props.catalogIndex];
});

// Función que abre el modal con animación GSAP
// Función que abre el modal con animación GSAP mejorada
const openCompanyModal = (company, origin) => {
  // Si hay una animación en curso, no hacemos nada
  if (animationInProgress.value) return;

  selectedCompany.value = company;
  animationInProgress.value = true;

  // Creamos un elemento de transición para la animación
  const transEl = document.createElement('div');
  transEl.className = 'modal-transition-element';
  transEl.style.position = 'fixed';
  transEl.style.zIndex = '1001';

  // Configuramos la apariencia con el fondo semitransparente
  transEl.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // Más transparente
  transEl.style.backgroundImage = `url(${backgroundImage})`; // Añadimos la imagen de fondo
  transEl.style.backgroundSize = 'cover';
  transEl.style.backgroundPosition = 'center';
  transEl.style.backgroundBlendMode = 'overlay'; // Mezclamos el fondo con el color
  transEl.style.backgroundRepeat = 'no-repeat';
  transEl.style.opacity = '0.95'; // Inicialmente menos opaco

  transEl.style.borderRadius = '8px';
  transEl.style.overflow = 'hidden';
  transEl.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';

  // Añadimos el logo si existe un origen definido
  if (origin && origin.logoSrc) {
    const logoImg = document.createElement('img');
    logoImg.src = origin.logoSrc;
    logoImg.style.position = 'absolute';
    logoImg.style.top = '50%';
    logoImg.style.left = '50%';
    logoImg.style.transform = 'translate(-50%, -50%)';
    logoImg.style.maxWidth = '80%';
    logoImg.style.maxHeight = '70%';
    logoImg.style.objectFit = 'contain';
    logoImg.style.zIndex = '2'; // Aseguramos que el logo esté por encima del fondo
    transEl.appendChild(logoImg);
  }

  document.body.appendChild(transEl);
  transitionElement.value = transEl;

  // Calculamos las dimensiones finales del modal (dependiendo de la resolución)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let modalWidth, modalHeight;

  if (viewportWidth <= 1200) {
    modalWidth = '90vw';
    modalHeight = '80vh';
  } else if (viewportWidth <= 1920) {
    modalWidth = '70vw';
    modalHeight = '85vh';
  } else if (viewportWidth <= 2560) {
    modalWidth = '60vw';
    modalHeight = '75vh';
  } else {
    modalWidth = '50vw';
    modalHeight = '70vh';
  }

  // Primera parte de la animación - desde el origen hasta el centro de la pantalla
  if (origin) {
    // Configuramos la posición y tamaño iniciales
    gsap.set(transEl, {
      top: origin.y,
      left: origin.x,
      width: origin.width,
      height: origin.height,
      backgroundSize: '250%', // Empezamos con el fondo más ampliado
      backgroundPosition: 'center',
    });

    // Animamos al tamaño final del modal
    gsap.to(transEl, {
      top: '50%',
      left: '50%',
      xPercent: -50,
      yPercent: -50,
      width: modalWidth,
      height: modalHeight,
      borderRadius: '24px',
      opacity: 1, // Completamente opaco al final
      backgroundSize: 'cover', // Ajustamos el tamaño del fondo
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        // Mostrar el modal real cuando la animación termina
        isModalOpen.value = true;

        // Eliminar el elemento de transición después de un breve retraso
        setTimeout(() => {
          if (transitionElement.value) {
            document.body.removeChild(transitionElement.value);
            transitionElement.value = null;
          }
          animationInProgress.value = false;
        }, 100);
      }
    });

    // Animar el contenido dentro del elemento de transición
    if (origin.logoSrc) {
      const logoElement = transEl.querySelector('img');
      if (logoElement) {
        gsap.fromTo(logoElement,
            { maxWidth: '80%', maxHeight: '70%', opacity: 1 },
            {
              maxWidth: '60%',
              maxHeight: '40%',
              top: '30%',
              opacity: 0.8, // Hacemos que el logo se desvanezca un poco
              duration: 0.5,
              ease: 'power2.inOut'
            }
        );
      }
    }
  } else {
    // Si no hay origen (por ejemplo, desde la barra lateral), hacemos una animación simple
    gsap.set(transEl, {
      top: '50%',
      left: '50%',
      xPercent: -50,
      yPercent: -50,
      width: 0,
      height: 0,
      opacity: 0,
      backgroundSize: '250%',
    });

    gsap.to(transEl, {
      width: modalWidth,
      height: modalHeight,
      opacity: 1,
      backgroundSize: 'cover',
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        isModalOpen.value = true;
        setTimeout(() => {
          if (transitionElement.value) {
            document.body.removeChild(transitionElement.value);
            transitionElement.value = null;
          }
          animationInProgress.value = false;
        }, 100);
      }
    });
  }
};
const closeModal = () => {
  // Si hay una animación en curso, no hacemos nada
  if (animationInProgress.value) return;

  isModalOpen.value = false;

  // Podríamos también hacer una animación inversa al cerrar
  // pero lo dejamos simple por ahora
};

// Hacer disponible la función openCompanyModal para los componentes hijos
provide('openCompanyModal', openCompanyModal);

const loadImages = async () => {
  // Si el catálogo actual ya está en proceso de carga, no iniciar otra carga
  if (currentCatalogId.value === catalogData.value?.id && isLoading.value) {
    return;
  }

  isLoading.value = true;
  loadingProgress.value = 0;
  loadingError.value = false;

  // Actualizar el ID del catálogo actual
  currentCatalogId.value = catalogData.value?.id;

  try {
    // Siempre cargar imágenes al cambiar de catálogo
    if (catalogData.value && catalogData.value.companies) {
      const totalImagesToLoad = catalogData.value.companies.length + (catalogData.value.logo ? 1 : 0);
      let loadedImages = 0;

      // Animación para el progreso de carga
      gsap.to(loadingProgress, {
        value: 5, // Comenzamos desde 5% para dar sensación de arranque inmediato
        duration: 0.5,
        ease: "power1.in"
      });

      await preloadCatalogImages(catalogData.value, () => {
        loadedImages++;
        const newProgress = Math.floor((loadedImages / totalImagesToLoad) * 100);

        // Animación suave del progreso
        gsap.to(loadingProgress, {
          value: newProgress,
          duration: 0.3,
          ease: "power1.out"
        });
      });
    } else {
      await preloadCatalogImages(catalogData.value);
    }
  } catch (error) {
    console.error('Error al cargar imágenes del catálogo:', error);
    loadingError.value = true;
  } finally {
    // Completar el progreso visualmente
    gsap.to(loadingProgress, {
      value: 100,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        // Animar transición de salida de la pantalla de carga
        setTimeout(() => {
          // Animar salida del cargador
          const loadingOverlay = document.querySelector('.loading-overlay');
          if (loadingOverlay) {
            gsap.to(loadingOverlay, {
              opacity: 0,
              duration: 0.4,
              onComplete: () => {
                isLoading.value = false;
              }
            });
          } else {
            isLoading.value = false;
          }
        }, 300);
      }
    });
  }
};

const handleCompanySelectEvent = (event) => {
  if (event.detail && event.detail.company) {
    openCompanyModal(event.detail.company, event.detail.origin);
  }
};

watch(() => props.catalogIndex, (newIndex) => {
  if (foodWineCatalog[newIndex]) {
    loadImages();
  }
}, { immediate: true });

onMounted(() => {
  window.addEventListener('company-selected', handleCompanySelectEvent);

  // Aplicar animación a la barra de progreso cuando se monta
  const progressBar = document.querySelector('.loading-progress-bar');
  if (progressBar) {
    gsap.set(progressBar, { width: '0%' });
  }

  // Animación para el logo en la pantalla de carga
  const loadingLogo = document.querySelector('.loading-logo');
  if (loadingLogo) {
    gsap.fromTo(loadingLogo,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
    );
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('company-selected', handleCompanySelectEvent);

  // Limpiar el elemento de transición si existe
  if (transitionElement.value) {
    document.body.removeChild(transitionElement.value);
    transitionElement.value = null;
  }
});
</script>

<template>
  <div class="app">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <img :src="loveHeader" alt="Love Wines & Food" class="loading-logo" />
        <div class="loading-progress-container">
          <div class="loading-progress-bar" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <div class="loading-percentage">{{ loadingProgress }}%</div>
      </div>
    </div>

    <div v-else-if="loadingError" class="error-overlay">
      <div class="error-container">
        <img :src="loveHeader" alt="Love Wines & Food" class="error-logo" />
        <p>Ha ocurrido un error al cargar las imágenes</p>
        <button @click="loadImages" class="retry-button">Reintentar</button>
      </div>
    </div>

    <template v-else>
      <CompaniesSidebar
          :companies="catalogData"
          @select-company="openCompanyModal"
      />

      <ContentPanel />

      <BaseModal
          :background-image="backgroundImage"
          :is-open="isModalOpen"
          @close="closeModal"
      >
        <CompanyContent :company="selectedCompany" />
      </BaseModal>
    </template>
  </div>
</template>

<style scoped lang="scss">
.app {
  display: grid;
  grid-template-columns: 40% minmax(0, 1fr);
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* Elemento de transición para la animación */
.modal-transition-element {
  position: fixed;
  z-index: 1001;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  pointer-events: none;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-logo,
.error-logo {
  width: 300px;
  height: auto;
  margin-bottom: 30px;
}

.loading-progress-container {
  width: 300px;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.loading-progress-bar {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s ease;
}

.loading-percentage {
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

.error-container {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;

  p {
    margin: 15px 0;
    color: #e74c3c;
    font-size: 18px;
  }
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 16px;

  &:hover {
    background-color: #2980b9;
  }
}

@media screen and (max-width: 1920px) {
  .app {
    grid-template-columns: 30% minmax(0, 1fr);
  }

  .loading-logo,
  .error-logo {
    width: 250px;
  }
}

@media screen and (min-width: 1921px) and (max-width: 2560px) {
  .app {
    grid-template-columns: 30% minmax(0, 1fr);
  }

  .loading-logo,
  .error-logo {
    width: 350px;
  }
}

@media screen and (min-width: 2561px) {
  .app {
    grid-template-columns: 32% minmax(0, 1fr);
  }

  .loading-logo,
  .error-logo {
    width: 400px;
  }
}
</style>