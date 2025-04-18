<script setup>
import { computed, inject, onMounted } from 'vue';
import { foodWineCatalog } from '@/data/foods-wines-catalog';
import { getPreloadedImageSrc, preloadImage } from '@/utils/imageService';

const openCompanyModal = inject('openCompanyModal', null);

const catalogData = computed(() => {
  return foodWineCatalog[0];
});

const companyPositions = computed(() => {
  const positionMap = {};

  if (catalogData.value && catalogData.value.companies) {
    catalogData.value.companies.forEach(company => {
      if (company.position) {
        positionMap[company.position] = company;
      }
    });
  }

  return positionMap;
});

const getCompanyForPosition = (position) => {
  return companyPositions.value[position] || null;
};

const isDivEmpty = (position) => {
  return position === 5 || position === 13;
};

const getCompanyLogoSrc = (company) => {
  if (!company || !company.logo) return '/logos/dummy.png';

  const preloadedSrc = getPreloadedImageSrc(`company_${company.id}`);
  if (preloadedSrc) return preloadedSrc;

  return normalizePath(company.logo);
};

const normalizePath = (src) => {
  if (src.startsWith('http') || src.startsWith('/')) {
    return src;
  }

  return `/src/assets/logos/${src}`;
};

const handleCompanyClick = (company) => {
  if (!company) return;

  if (openCompanyModal) {
    openCompanyModal(company);
  } else {
    window.dispatchEvent(new CustomEvent('company-selected', {
      detail: { company }
    }));
  }

  console.log('Empresa seleccionada:', company.name);
};

const ensureImagesLoaded = async () => {
  if (catalogData.value && catalogData.value.companies) {
    const logoPromises = [];

    Object.values(companyPositions.value).forEach(company => {
      if (company && company.logo) {
        if (!getPreloadedImageSrc(`company_${company.id}`)) {
          logoPromises.push(preloadImage(company.logo, `company_${company.id}`));
        }
      }
    });

    if (logoPromises.length > 0) {
      try {
        await Promise.all(logoPromises);
        console.log(`Se han cargado ${logoPromises.length} imágenes adicionales para el mapa`);
      } catch (err) {
        console.error('Error al cargar imágenes para el mapa:', err);
      }
    }
  }
};

onMounted(async () => {
  await ensureImagesLoaded();
});
</script>

<template>
  <div class="map-grid">
    <div class="map-grid-container">
      <!-- Fondo con partículas o efecto visual -->
      <div class="background-effect"></div>

      <div v-for="position in 17" :key="position"
           :class="['grid-item', `div${position}`, {
             'empty': isDivEmpty(position),
             'has-company': getCompanyForPosition(position),
             'pulse-animation': getCompanyForPosition(position)
           }]"
           @click="handleCompanyClick(getCompanyForPosition(position))"
      >
        <template v-if="!isDivEmpty(position) && getCompanyForPosition(position)">
          <div class="company-content">
            <div class="logo-wrapper">
              <img
                  v-if="getCompanyForPosition(position).logo"
                  :src="getCompanyLogoSrc(getCompanyForPosition(position))"
                  :alt="getCompanyForPosition(position).name"
                  class="company-logo"
              />
            </div>
            <div class="hover-info">
              <span class="company-name">{{ getCompanyForPosition(position).name }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="!isDivEmpty(position)">
          <span class="empty-position">{{ position }}</span>
          <div class="empty-slot-indicator">
            <span>Disponible</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

@keyframes pulse {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

.map-grid {
  position: relative;
  overflow: hidden;

  .map-grid-container {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(2, 1fr);
    padding: 2px;
    margin: 0 auto;
    width: 80%;
    height: 100%;
    position: relative;
    z-index: 2;
  }

  .background-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    opacity: 0.7;
    z-index: 1;
    pointer-events: none;
  }
}

.grid-item {
  background-color: white;
  border: 1px solid #212b36;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  padding: 10px;
  text-align: center;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.has-company {
    cursor: pointer;

    &:hover {
      transform: scale(1.05) translateY(-5px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
      z-index: 10;

      .hover-info {
        opacity: 1;
        transform: translateY(0);
      }

      .company-logo {
        transform: scale(1.1);
      }
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &.pulse-animation {
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.3);
      border-radius: inherit;
      opacity: 0;
      z-index: 0;
      animation: pulse 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
    }
  }
}

.company-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.logo-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.company-logo {
  max-width: 80%;
  max-height: 70%;
  object-fit: contain;
  margin-bottom: 5px;
  transition: transform 0.4s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.hover-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
  font-size: 0.8rem;
  font-weight: bold;
}

.empty-slot-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  color: #aaa;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.grid-item:not(.has-company):not(.empty):hover .empty-slot-indicator {
  opacity: 1;
}

.empty-position {
  font-size: 0.9rem;
  color: #888;
}

/* Divs vacíos */
.empty {
  background-color: #212b36;
  border-color: #212b36;
  cursor: default;
}

/* Primera fila - items 1-9 */
.div1 { grid-area: 1 / 1 / 2 / 2; }
.div2 { grid-area: 1 / 2 / 2 / 3; }
.div3 { grid-area: 1 / 3 / 2 / 4; }
.div4 { grid-area: 1 / 4 / 2 / 5; }
.div5 { grid-area: 1 / 5 / 2 / 6; }
.div6 { grid-area: 1 / 6 / 2 / 7; }
.div7 { grid-area: 1 / 7 / 2 / 8; }
.div8 { grid-area: 1 / 8 / 2 / 9; }
.div9 { grid-area: 1 / 9 / 2 / 10; }

/* Segunda fila - items 10-17 */
.div10 { grid-area: 2 / 1 / 3 / 2; }
.div11 { grid-area: 2 / 2 / 3 / 3; }
.div12 { grid-area: 2 / 3 / 3 / 4; }
.div13 { grid-area: 2 / 4 / 3 / 6; } /* Ocupa 2 columnas */
.div14 { grid-area: 2 / 6 / 3 / 7; }
.div15 { grid-area: 2 / 7 / 3 / 8; }
.div16 { grid-area: 2 / 8 / 3 / 9; }
.div17 { grid-area: 2 / 9 / 3 / 10; }

/* Responsive styles */
@media screen and (min-width: 1921px) and (max-width: 2560px) {
  .company-position {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  .empty-position {
    font-size: 1.1rem;
  }
}

@media screen and (min-width: 2561px) {
  .company-position {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .empty-position {
    font-size: 1.3rem;
  }
}
</style>