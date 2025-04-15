<script setup>
import { useRouter } from 'vue-router';
import { foodWineCatalog } from '@/data/foods-wines-catalog';

const router = useRouter();

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="home-container">
    <div class="header">
      <h1>Foods & Wines from Castilla y León</h1>
      <p>Select stand</p>
    </div>

    <div class="catalog-buttons">
      <div
          class="catalog-button"
          @click="navigateTo('/meat-cured-meat')"
      >
        <h2>{{ foodWineCatalog[0].name }}</h2>
        <p>{{ foodWineCatalog[0].hall }}</p>
      </div>

      <div
          class="catalog-button"
          @click="navigateTo('/speciality')"
      >
        <h2>{{ foodWineCatalog[1].name }}</h2>
        <p>{{ foodWineCatalog[1].hall }}</p>
      </div>
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
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #212529;
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 1.2rem;
  color: #6c757d;
}

.catalog-buttons {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.catalog-button {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  padding: 2rem;
  width: 300px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.catalog-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.catalog-button h2 {
  margin-bottom: 1rem;
  color: #343a40;
}

.catalog-button p {
  color: #6c757d;
  margin: 0.5rem 0;
}

/* Media queries para diferentes resoluciones */

/* Dispositivos móviles y tablets */
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

/* Full HD (1920x1080) */
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

/* QHD (2560x1440) */
@media screen and (min-width: 2560px) and (max-width: 3839px) {
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

/* 4K UHD (3840x2160) */
@media screen and (min-width: 3840px) {
  .catalog-button {
    width: 700px;
    height: 400px;
    padding: 4rem;
    border-radius: 1rem;
  }

  .header h1 {
    font-size: 5rem;
  }

  .header p {
    font-size: 2.5rem;
  }

  .catalog-button h2 {
    font-size: 3rem;
    margin-bottom: 2rem;
  }

  .catalog-button p {
    font-size: 2rem;
    margin: 1rem 0;
  }

  .catalog-buttons {
    gap: 6rem;
  }

  .home-container {
    padding: 4rem;
  }
}
</style>