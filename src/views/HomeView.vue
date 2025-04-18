<script setup>
import { useRouter } from 'vue-router';
import { foodWineCatalog } from '@/data/foods-wines-catalog';
import { ref, onMounted } from 'vue';
import loveHeader from '@/assets/images/love-header.png';

const router = useRouter();
const isAnimating = ref(false);
const isLoaded = ref(false);

const navigateTo = (path) => {
  if (isAnimating.value) return;

  isAnimating.value = true;

  // Añade una clase para animar la salida
  document.querySelector('.home-container').classList.add('exit-animation');

  // Espera a que termine la animación antes de navegar
  setTimeout(() => {
    router.push(path);
    isAnimating.value = false;
  }, 600);
};

onMounted(() => {
  // Simular carga inicial con animación
  setTimeout(() => {
    isLoaded.value = true;
  }, 300);

  // Efecto de interactividad para los botones
  const buttons = document.querySelectorAll('.catalog-button');

  buttons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      button.style.setProperty('--mouse-x', `${x}px`);
      button.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});
</script>

<template>
  <div class="home-container" :class="{ 'loaded': isLoaded }">
    <div class="background-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="header" :class="{ 'loaded': isLoaded }">
      <img :src="loveHeader" alt="Love at first bite" class="logo-image" />
      <h1>Foods & Wines from Castilla y León</h1>
      <p class="subtitle">Select a stand to explore</p>
    </div>

    <div class="catalog-buttons" :class="{ 'loaded': isLoaded }">
      <div
          class="catalog-button"
          @click="navigateTo('/meat-cured-meat')"
          :style="{ '--delay': '0.2s' }"
      >
        <div class="btn-background"></div>
        <div class="catalog-content">
          <h2>{{ foodWineCatalog[0].name }}</h2>
          <p>{{ foodWineCatalog[0].hall }}</p>
          <div class="icon-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </div>
        </div>
      </div>

      <div
          class="catalog-button"
          @click="navigateTo('/speciality')"
          :style="{ '--delay': '0.4s' }"
      >
        <div class="btn-background"></div>
        <div class="catalog-content">
          <h2>{{ foodWineCatalog[1].name }}</h2>
          <p>{{ foodWineCatalog[1].hall }}</p>
          <div class="icon-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <p>Touch a button to explore the exhibitors</p>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.home-container.exit-animation {
  transform: scale(0.95) translateY(-30px);
  opacity: 0;
}

.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(233, 30, 99, 0.1), rgba(156, 39, 176, 0.1));
  animation: floatCircle 20s infinite ease-in-out;
}

.circle-1 {
  width: 600px;
  height: 600px;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  right: -100px;
  background: linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(0, 188, 212, 0.1));
  animation-delay: -5s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  bottom: 30%;
  left: 10%;
  background: linear-gradient(45deg, rgba(255, 193, 7, 0.1), rgba(255, 87, 34, 0.1));
  animation-delay: -10s;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.header.loaded {
  opacity: 1;
  transform: translateY(0);
}

.logo-image {
  max-width: 300px;
  animation: floatingElement 4s ease-in-out infinite;
}

.header h1 {
  font-size: 2.5rem;
  color: #212529;
  margin: 1.5rem 0 0.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  animation: pulse 2s infinite ease-in-out;
}

.catalog-buttons {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.catalog-buttons.loaded {
  opacity: 1;
  transform: translateY(0);
}

.catalog-button {
  position: relative;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding: 2rem;
  width: 300px;
  height: 200px;
  text-align: center;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
  animation-delay: var(--delay);
}

.catalog-button:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
      600px circle at var(--mouse-x) var(--mouse-y),
      rgba(255, 255, 255, 0.8),
      transparent 40%
  );
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.catalog-button:hover .btn-background {
  opacity: 1;
}

.catalog-content {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  z-index: 2;
}

.catalog-button h2 {
  margin-bottom: 1rem;
  color: #343a40;
  font-weight: 700;
  transition: transform 0.3s ease;
}

.catalog-button p {
  color: #6c757d;
  margin: 0.5rem 0;
  transition: transform 0.3s ease;
}

.catalog-button:hover h2 {
  transform: scale(1.05);
}

.catalog-button:hover p {
  transform: scale(1.05);
}

.icon-arrow {
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  color: #dc3545;
}

.catalog-button:hover .icon-arrow {
  opacity: 1;
  transform: translateX(0);
}

.footer-note {
  margin-top: 3rem;
  text-align: center;
  color: #adb5bd;
  font-weight: 500;
  opacity: 0;
  animation: fadeIn 1s 1s forwards;
  position: relative;
  z-index: 1;
}

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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes floatCircle {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(30px, 20px) rotate(5deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

@keyframes floatingElement {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* Media queries para diferentes resoluciones */
@media screen and (max-width: 1024px) {
  .catalog-buttons {
    flex-direction: column;
    align-items: center;
  }

  .catalog-button {
    width: 90%;
    max-width: 300px;
  }

  .header h1 {
    font-size: 2rem;
  }
}

@media screen and (min-width: 1920px) and (max-width: 2559px) {
  .catalog-button {
    width: 400px;
    height: 250px;
    padding: 2.5rem;
  }

  .header h1 {
    font-size: 3rem;
  }

  .header p {
    font-size: 1.5rem;
  }

  .catalog-button h2 {
    font-size: 1.8rem;
  }

  .catalog-button p {
    font-size: 1.2rem;
  }

  .catalog-buttons {
    gap: 3rem;
  }
}

@media screen and (min-width: 2560px) {
  .catalog-button {
    width: 500px;
    height: 300px;
    padding: 3rem;
  }

  .header h1 {
    font-size: 3.5rem;
  }

  .header p {
    font-size: 1.8rem;
  }

  .catalog-button h2 {
    font-size: 2.2rem;
  }

  .catalog-button p {
    font-size: 1.4rem;
  }

  .catalog-buttons {
    gap: 4rem;
  }
}
</style>