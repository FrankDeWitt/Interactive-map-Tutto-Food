<script setup>
// Importaciones de imágenes para los iconos
import redWineIcon from '../assets/images/info/red.png';
import whiteWineIcon from '../assets/images/info/white.png';
import roseWineIcon from '../assets/images/info/rose.png';
import sparklingWineIcon from '../assets/images/info/sparkling.png';
</script>

<template>
  <div class="info-box">
    <p class="info-box-title">WINE AREA: 75000 Ha</p>
    <p>VARIETIES</p>
    <div class="legend">
      <div class="legend-item">
        <img class="variety red" :src="redWineIcon" alt="Vino tinto" v-once/>
        <span>RED WINE</span>
      </div>
      <div class="legend-item">
        <img class="variety white" :src="whiteWineIcon" alt="Vino blanco" v-once/>
        <span>WHITE WINE</span>
      </div>
      <div class="legend-item">
        <img class="variety rose" :src="roseWineIcon" alt="Vino rosado" v-once/>
        <span>ROSÉ</span>
      </div>
      <div class="legend-item">
        <img class="variety sparkling" :src="sparklingWineIcon" alt="Vino espumoso" v-once/>
        <span>SPARKLING WINE</span>
      </div>
    </div>

    <p>© 2018. Instituto para la Competitividad<br> Empresarial de Castilla y León</p>
  </div>
</template>

<style scoped lang="scss">
.info-box {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 2rem;

  .info-box-title {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 0.5rem;
  }

  .legend {
    margin: 0.5rem 0 1rem 0;

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;

      .variety {
        width: 30px;
        height: 30px;
        object-fit: contain;
      }

      span {
        margin-left: 10px;
      }
    }
  }
}

/* Responsive Styles */
@media screen and (max-width: 1920px) {
  .info-box {
    padding: 1.8rem;

    .info-box-title {
      font-size: 1.8rem;
      margin-bottom: 10px;
    }

    p {
      font-size: 1.2rem;
      margin-bottom: 5px;
    }

    .legend {
      margin: 5px 0 10px 0;

      .legend-item {
        margin-bottom: 10px;

        .variety {
          width: 35px;
          height: 35px;
        }

        span {
          font-size: 1.3rem;
        }
      }
    }
  }
}

@media screen and (min-width: 1921px) and (max-width: 2560px) {
  .info-box {
    padding: 2.5rem;

    .info-box-title {
      font-size: 2.3rem;
      margin-bottom: 10px;
    }

    p {
      font-size: 1.6rem;
      margin-bottom: 10px;
    }

    .legend {
      margin: 10px 0 20px 0;

      .legend-item {
        margin-bottom: 5px;

        .variety {
          width: 42px;
          height: 42px;
        }

        span {
          font-size: 1.7rem;
        }
      }
    }
  }
}

@media screen and (min-width: 2561px) {
  .info-box {
    padding: 3rem;

    .info-box-title {
      font-size: 3.3rem;
      margin-bottom: 20px;
    }

    p {
      font-size: 2.3rem;
      margin-bottom: 20px;
    }

    .legend {
      margin: 20px 0 50px 0;

      .legend-item {
        margin-bottom: 18px;

        .variety {
          width: 50px;
          height: 50px;
        }

        span {
          font-size: 2rem;
        }
      }
    }
  }
}
</style>