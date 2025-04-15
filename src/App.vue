<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { foodWineCatalog } from '@/data/foods-wines-catalog';

const route = useRoute();
const router = useRouter();

const navLinks = computed(() => {
  return foodWineCatalog.map(category => ({
    id: category.id,
    name: category.name,
    path: category.name === 'MEAT AND CURED MEAT' ? '/meat-cured-meat' : '/speciality',
    active: route.path.includes(category.name === 'MEAT AND CURED MEAT' ? 'meat-cured-meat' : 'speciality')
  }));
});

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.catalog-nav {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;

  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      padding: 1rem;
      cursor: pointer;
      font-weight: 500;

      &.active {
        background-color: #e9ecef;
        color: #495057;
      }

      &:hover {
        background-color: #e2e6ea;
      }
    }
  }
}
</style>