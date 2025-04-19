<script setup>
import { ref, computed, watch } from 'vue';
import { getPreloadedImageSrc } from '@/utils/imageService';
import LazyImage from "@/components/ui/LazyImage.vue";
import dummyLogo from "@/assets/logos/dummy.png";

const props = defineProps({
  company: {
    type: Object,
    default: () => ({})
  },
});

const activeSection = ref('info'); // 'info' o 'products'
const isSectionChanging = ref(false);
const currentCompany = ref(null);

watch(() => props.company, (newCompany) => {
  if (newCompany) {
    currentCompany.value = newCompany;
    // Reiniciar a la sección de información al recibir una nueva compañía
    activeSection.value = 'info';
  }
}, { immediate: true, deep: true });

const getCompanyModalImage = computed(() => {
  if (!currentCompany.value || !currentCompany.value.id) return dummyLogo;

  const modalImageKey = `company_modal_${currentCompany.value.id}`;
  const preloadedModalImage = getPreloadedImageSrc(modalImageKey);

  if (preloadedModalImage) {
    return preloadedModalImage;
  }

  const logoImageKey = `company_${currentCompany.value.id}`;
  const preloadedLogoImage = getPreloadedImageSrc(logoImageKey);

  if (preloadedLogoImage) {
    return preloadedLogoImage;
  }

  if (currentCompany.value.modalImage) {
    return currentCompany.value.modalImage;
  }

  if (currentCompany.value.logo) {
    return currentCompany.value.logo.startsWith('/')
        ? currentCompany.value.logo
        : `/src/assets/logos/${currentCompany.value.logo}`;
  }

  return dummyLogo;
});

const toggleSection = (section) => {
  if (section === activeSection.value) return;

  isSectionChanging.value = true;

  setTimeout(() => {
    activeSection.value = section;

    setTimeout(() => {
      isSectionChanging.value = false;
    }, 300);
  }, 300);
};
</script>

<template>
  <div key="company-detail" class="company-detail">
    <div class="company-card">
      <!-- Navegación de tabs -->
      <div class="card-tabs">
        <button
            :class="['tab-btn', { 'active': activeSection === 'info' }]"
            @click="toggleSection('info')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          <span>Company Info</span>
        </button>
        <button
            :class="['tab-btn', { 'active': activeSection === 'products' }]"
            @click="toggleSection('products')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21h10a2 2 0 0 0 2-2V9.5a2 2 0 0 0-2-2"></path><path d="M3 9.5V19a2 2 0 0 0 2 2h2"></path><path d="M13 2v3.5a2 2 0 0 0 2 2h3.5L13 2z"></path><path d="M9.5 10.5 7 13l2.5 2.5"></path><path d="M7 13h8"></path></svg>
          <span>Products</span>
        </button>
      </div>

      <div class="company-logo-container">
        <div class="logo-wrapper">
          <LazyImage
              :src="getCompanyModalImage"
              :alt="currentCompany?.name"
              :img-class="'company-detail-logo fade-in'"
          />
        </div>
      </div>

      <div class="content-container">
        <!-- Sección de información de la empresa -->
        <div
            class="company-info"
            :class="{
            'active': activeSection === 'info',
            'inactive': activeSection === 'products',
            'changing': isSectionChanging
          }"
        >
          <div class="column column-left">
            <div class="info-item" v-if="currentCompany?.manager">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="info-text">{{ currentCompany.manager }}</div>
            </div>

            <div class="info-item" v-if="currentCompany?.address">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="info-text">{{ currentCompany.address }}</div>
            </div>
          </div>
          <div class="column column-right">
            <div class="info-item" v-if="currentCompany?.phone">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div class="info-text">{{ currentCompany.phone }}</div>
            </div>

            <div class="info-item" v-if="currentCompany?.email">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div class="info-text">
                <a :href="'mailto:' + currentCompany.email">{{ currentCompany.email }}</a>
              </div>
            </div>
            <div class="info-item" v-if="currentCompany?.website">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <div class="info-text">
                <a :href="'https://' + currentCompany.website" target="_blank" rel="noopener noreferrer">
                  {{ currentCompany.website }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de productos -->
        <div
            class="products-container"
            :class="{
            'active': activeSection === 'products',
            'inactive': activeSection === 'info',
            'changing': isSectionChanging
          }"
        >
          <div class="products-columns">
            <div class="column column-left" v-if="currentCompany?.iproducts">
              <span class="flag">
                <img src="https://hatscripts.github.io/circle-flags/flags/it.svg" width="36">
              </span>
              <h4 class="products-subtitle">Prodotti (D.O/IGP)_</h4>
              <div class="products-list">
                {{ currentCompany.iproducts }}
              </div>
            </div>
            <div class="column column-right" v-if="currentCompany?.products">
              <span class="flag">
                <img src="https://hatscripts.github.io/circle-flags/flags/uk.svg" width="36">
              </span>
              <h4 class="products-subtitle">Products (D.O/IGP)_</h4>
              <div class="products-list">
                {{ currentCompany.products }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="info-item stand" v-if="currentCompany?.stand">
        <div class="stand-text">STAND {{ currentCompany.stand }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Animaciones
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

// Estilos para el detalle de la compañía
.company-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 2rem;
}

// Tarjeta de la compañía
.company-card {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 24px;
  width: 75%;
  padding: 2rem 3rem 3rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  position: relative;
  backdrop-filter: blur(10px);
  transform: translateY(0);
  overflow: hidden;
}

// Tabs de navegación
.card-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.9);
    }

    &.active {
      background: #e74c3c;
      color: white;
      box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3);
    }
  }
}

// Contenedor del logo
.company-logo-container {
  text-align: center;
  margin: 1rem 0 2rem;
  height: 250px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s 0.2s forwards;

  .logo-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .company-detail-logo {
    max-width: 100%;
    max-height: 250px;
    object-fit: contain;
    filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.1));

    &.fade-in {
      animation: fadeIn 0.3s ease-in;
    }
  }
}

// Contenedor para facilitar la transición entre secciones
.content-container {
  position: relative;
  min-height: 200px; // Altura mínima para evitar saltos
}

// Información de la compañía y contenedor de productos compartiendo estilos
.company-info,
.products-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
    z-index: 2;
  }

  &.inactive {
    opacity: 0;
    z-index: 1;
  }

  &.changing {
    transition: opacity 0.3s ease;
  }
}

// Columnas compartidas en ambas secciones
.company-info,
.products-columns {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;

  .column {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 15px;
    flex: 1;
  }
}

// Elementos de información
.info-item {
  display: flex;
  align-items: center;
  font-size: 1.15rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s 0.3s forwards;

  &:nth-child(2) {
    animation-delay: 0.4s;
  }

  &:nth-child(3) {
    animation-delay: 0.5s;
  }

  .info-icon {
    width: 40px;
    height: 40px;
    margin-right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e74c3c;
    border-radius: 50%;
    color: white;
    box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3);
  }

  .info-text {
    color: #000;
    flex: 1;

    a {
      color: #e74c3c;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;

      &:hover {
        color: darken(#e74c3c, 15%);
        text-decoration: underline;
      }
    }
  }

  &.stand {
    position: absolute;
    top: 5%;
    right: 5%;
    margin-top: 1rem;
    justify-content: flex-end;
    opacity: 0;
    transform: translateX(20px);
    animation: fadeInRight 0.5s 0.8s forwards;

    .stand-text {
      font-size: 2rem;
      font-weight: bold;
      color: #e74c3c;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
  }
}

// Subtítulo de productos
.products-subtitle {
  font-size: 1.5rem;
  color: #000;
  font-weight: bold;
  margin-bottom: 1rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s 0.4s forwards;
}

// Lista de productos
.products-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  color: #000;
  flex: 1;
  font-size: 1.5rem;
  line-height: 1.4;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s 0.5s forwards;
}

.flag {
  margin-bottom: 0.5rem;
  img {
    display: block;
  }
}

// Estilos responsivos
// Pantallas pequeñas y medianas
@media screen and (max-width: 1200px) {
  .company-card {
    width: 95%;
    padding: 1.5rem;
  }

  .company-logo-container {
    height: 180px;

    .company-detail-logo {
      max-height: 180px;
    }
  }

  .products-columns {
    flex-direction: column;
    gap: 1.5rem;
  }

  .info-text, .products-list {
    font-size: 1rem;
  }

  .products-subtitle {
    font-size: 1.3rem;
  }

  .info-item.stand .stand-text {
    font-size: 1.6rem;
  }

  .card-tabs .tab-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .content-container {
    min-height: 220px;
  }
}

// Pantallas FullHD (1080p)
@media screen and (min-width: 1201px) and (max-width: 1920px) {
  .company-logo-container {
    .company-detail-logo {
      max-height: 220px;
    }
  }

  .company-card {
    width: 85%;
    padding: 2rem;
  }

  .info-text, .products-list {
    font-size: 1.2rem;
  }

  .info-item {
    &.stand{
      top: 5%;
      right: 5%;

      .stand-text {
        font-size: 1.6rem;
      }
    }
  }

  .content-container {
    min-height: 250px;
  }
}

// Pantallas 2K (1440p)
@media screen and (min-width: 1921px) and (max-width: 2560px) {
  .company-card {
    width: 80%;
  }

  .info-text, .products-list {
    font-size: 1.4rem;
  }

  .content-container {
    min-height: 300px;
  }
}

// Pantallas 4K y superiores
@media screen and (min-width: 2561px) {
  .company-card {
    width: 75%;
    padding: 4rem;
  }

  .company-logo-container {
    height: 350px;

    .company-detail-logo {
      max-height: 350px;
    }
  }

  .info-text, .products-list {
    font-size: 1.8rem;
  }

  .products-subtitle {
    font-size: 1.8rem;
  }

  .info-item.stand .stand-text {
    font-size: 2.5rem;
  }

  .card-tabs .tab-btn {
    padding: 12px 24px;
    font-size: 1.4rem;
    border-radius: 30px;
  }

  .content-container {
    min-height: 400px;
  }
}
</style>