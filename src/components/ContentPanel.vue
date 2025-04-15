<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import juntaCylLogo from '../assets/images/junta-footer.png';
import loveHeader from '../assets/images/love-header.png';
import MapGridMeat from "@/components/MapGridMeat.vue";
import MapGridSpeciality from "@/components/MapGridSpeciality.vue";

const route = useRoute();

const isMeatRoute = computed(() => {
  return route.path.includes('meat-cured-meat');
});

const isSpecialityRoute = computed(() => {
  return route.path.includes('speciality');
});
</script>

<template>
  <div class="content">
    <header class="header">
      <div class="logo">
        <img :src="loveHeader" alt="Love at first bite" v-once/>
      </div>
    </header>

    <transition name="slide" mode="out-in">
      <MapGridMeat v-if="isMeatRoute" />
      <MapGridSpeciality v-else-if="isSpecialityRoute"  />
    </transition>

    <footer class="footer">
        <img :src="juntaCylLogo" alt="Junta de Castilla y León" v-once/>
    </footer>
  </div>
</template>

<style scoped lang="scss">
$color-bg-light: #ebebeb;

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  display: grid;
  grid-template-rows: 35% calc(100% - 45%) 10%;
  overflow: hidden;
  height: 100%;

  .header {
    grid-row: 1;
    display: flex;
    background-color: #fff;
    justify-content: center;
    align-items: center;

    img {
      max-width: 100%;
      max-height: 80%;
      object-fit: contain;
    }
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }

  .footer {
    grid-row: 3;
    background-color: #fff;
    text-align: center;
    @include flex-center;

    img {
      max-width: 100%;
      max-height: 80%;
      object-fit: contain;
    }
  }
}

/* Responsive styles */
@media screen and (max-width: 1920px) {
  .content {
    grid-template-rows: 35% calc(100% - 45%) 10%;

    .logo {
      text-align: center;

      img {
        max-width: 50%;
        max-height: 50%;
        object-fit: contain;
      }
    }
  }
}

@media screen and (min-width: 1921px) and (max-width: 2560px) {
  .content {
    grid-template-rows: 35% calc(100% - 45%) 10%;

    .logo {
      text-align: center;

      img {
        max-width: 50%;
        max-height: 50%;
        object-fit: contain;
      }
    }
  }
}

@media screen and (min-width: 2561px) {
  .content {
    grid-template-rows: 35% calc(100% - 45%) 10%;
  }
}
</style>