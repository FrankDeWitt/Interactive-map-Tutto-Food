<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, provide } from 'vue';
import { foodWineCatalog } from '@/data/foods-wines-catalog';
import CompaniesSidebar from '@/components/CompaniesSidebar.vue';
import ContentPanel from '@/components/ContentPanel.vue';
import CompanyModal from '@/components/ui/CompanyModal.vue';
import { preloadCatalogImages, areCatalogImagesPreloaded } from '@/utils/imageService';
import loveHeader from '../assets/images/love-header.png';

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

const catalogData = computed(() => {
  return foodWineCatalog[props.catalogIndex];
});

const openCompanyModal = (company) => {
  selectedCompany.value = company;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

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

      await preloadCatalogImages(catalogData.value, () => {
        loadedImages++;
        loadingProgress.value = Math.floor((loadedImages / totalImagesToLoad) * 100);
      });
    } else {
      await preloadCatalogImages(catalogData.value);
    }
  } catch (error) {
    console.error('Error al cargar imágenes del catálogo:', error);
    loadingError.value = true;
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  }
};

const handleCompanySelectEvent = (event) => {
  if (event.detail && event.detail.company) {
    openCompanyModal(event.detail.company);
  }
};

watch(() => props.catalogIndex, (newIndex) => {
  if (foodWineCatalog[newIndex]) {
    loadImages();
  }
}, { immediate: true });

onMounted(() => {
  window.addEventListener('company-selected', handleCompanySelectEvent);
});

onBeforeUnmount(() => {
  window.removeEventListener('company-selected', handleCompanySelectEvent);
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

      <CompanyModal
          :company="selectedCompany"
          :is-open="isModalOpen"
          @close="closeModal"
      />
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
  animation: pulse 2s infinite;
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

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
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