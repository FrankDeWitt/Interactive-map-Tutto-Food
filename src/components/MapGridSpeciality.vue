<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { foodWineCatalog } from '@/data/foods-wines-catalog';
import { getPreloadedImageSrc, preloadImage } from '@/utils/imageService';
import { createRippleEffect } from '@/utils/gsapUtils';
import { gsap } from 'gsap';

const openCompanyModal = inject('openCompanyModal', null);

const catalogData = computed(() => {
  return foodWineCatalog[1]; // Mantiene el índice 1 que usa MapGridSpeciality
});

const companyPositions = computed(() => {
  const positions = {};

  if (catalogData.value && catalogData.value.companies) {
    // Mapea las primeras 5 compañías a las posiciones 1-5
    for (let i = 0; i < 5 && i < catalogData.value.companies.length; i++) {
      positions[i + 1] = catalogData.value.companies[i];
    }

    // Mapea las siguientes 5 compañías a las posiciones 10-14
    for (let i = 5; i < 10 && i < catalogData.value.companies.length; i++) {
      positions[i + 5] = catalogData.value.companies[i];
    }
  }

  return positions;
});

const getCompanyForPosition = (position) => {
  return companyPositions.value[position] || null;
};

const isDivEmpty = (position) => {
  // Las posiciones 6, 7, 8, 9, 15, 16, 17, 18 son vacías según el grid original
  return [6, 7, 8, 9, 15, 16, 17, 18].includes(position);
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

const isAnimating = ref(false);

const handleCompanyClick = (company, event) => {
  if (!company || isAnimating.value) return;

  // Establecemos que hay una animación en curso
  isAnimating.value = true;

  // Crear efecto ripple en la posición del clic
  const clickX = event.clientX;
  const clickY = event.clientY;
  createRippleEffect(clickX, clickY, document.body, {
    color: 'rgba(231, 76, 60, 0.3)',
    size: 50,
    scale: 3,
    duration: 0.5
  });

  // Capturamos el elemento clickeado
  const clickedElement = event.currentTarget;
  // Obtenemos su posición y dimensiones
  const rect = clickedElement.getBoundingClientRect();

  // Resaltamos el elemento clickeado
  gsap.to(clickedElement, {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
    scale: 1.03,
    duration: 0.2,
    ease: 'power1.out'
  });

  // Creamos un objeto con la información de origen para la animación
  const origin = {
    element: clickedElement,
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    logoSrc: getCompanyLogoSrc(company)
  };

  // Retrasamos la apertura del modal para que se vea el efecto
  setTimeout(() => {
    if (openCompanyModal) {
      // Pasamos el origen junto con la compañía
      openCompanyModal(company, origin);
    } else {
      window.dispatchEvent(new CustomEvent('company-selected', {
        detail: { company, origin }
      }));
    }

    // Restauramos el estado original del elemento
    gsap.to(clickedElement, {
      backgroundColor: 'white',
      boxShadow: 'none',
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        isAnimating.value = false;
      }
    });

    console.log('Empresa seleccionada:', company.name);
  }, 200); // pequeño retraso para ver el efecto
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
    <div v-for="position in 18" :key="position"
         :class="['grid-item', `div${position}`, {
           'empty': isDivEmpty(position),
           'has-company': getCompanyForPosition(position)
         }]"
         @click="(event) => handleCompanyClick(getCompanyForPosition(position), event)"
    >
      <template v-if="!isDivEmpty(position) && getCompanyForPosition(position)">
        <div class="company-content">
          <img
              v-if="getCompanyForPosition(position).logo"
              :src="getCompanyLogoSrc(getCompanyForPosition(position))"
              :alt="getCompanyForPosition(position).name"
              class="company-logo"
          />
        </div>
      </template>
      <template v-else-if="!isDivEmpty(position)">
        <span class="empty-position">{{ position }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.map-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  background-color: #212b36;
  padding: 2px;
  margin: 0 auto;
  width: 85%;
  height: 100%;
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
  transition: all 0.3s ease;

  &.has-company {
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

.company-logo {
  max-width: 80%;
  max-height: 70%;
  object-fit: contain;
  margin-bottom: 5px;
  transition: transform 0.3s ease;
}

.company-position {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
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
.div13 { grid-area: 2 / 4 / 3 / 5; }
.div14 { grid-area: 2 / 5 / 3 / 6; }
.div15 { grid-area: 2 / 6 / 3 / 7; }
.div16 { grid-area: 2 / 7 / 3 / 8; }
.div17 { grid-area: 2 / 8 / 3 / 9; }
.div18 { grid-area: 2 / 9 / 3 / 10; }

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