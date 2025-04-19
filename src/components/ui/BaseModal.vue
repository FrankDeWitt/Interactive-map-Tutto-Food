<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  withDecorations: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);
const modalVisible = ref(false);
const contentVisible = ref(false);
const isModalClosing = ref(false);

watch(() => props.isOpen, (newValue) => {
  isModalClosing.value = false;

  if (newValue) {
    // El modal ya está visible debido a la animación en CatalogView
    modalVisible.value = true;

    // Animamos la aparición del contenido
    gsap.delayedCall(0.2, () => {
      contentVisible.value = true;

      // Animamos los elementos decorativos si están habilitados
      if (props.withDecorations) {
        const decorations = document.querySelectorAll('.modal-decoration');
        gsap.fromTo(decorations,
            {
              opacity: 0,
              x: (i) => {
                // Diferentes direcciones según la posición
                if (i % 2 === 0) return -50;
                return 50;
              },
              y: (i) => {
                // Diferentes direcciones según la posición
                if (i < 2) return -50;
                return 50;
              }
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: "power3.out"
            }
        );
      }

      // Animamos el botón de cierre
      const closeButton = document.querySelector('.close-button');
      if (closeButton) {
        gsap.fromTo(closeButton,
            { opacity: 0, rotation: -90, scale: 0.8 },
            {
              opacity: 1,
              rotation: 0,
              scale: 1,
              duration: 0.5,
              delay: 0.2,
              ease: "back.out(1.7)"
            }
        );
      }

      // Animamos el contenido interno
      const modalInner = document.querySelector('.modal-inner');
      if (modalInner) {
        gsap.fromTo(modalInner,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              delay: 0.1,
              ease: "power2.out"
            }
        );
      }
    });
  } else {
    // Animación de cierre
    isModalClosing.value = true;
    contentVisible.value = false;

    // Animamos la salida del contenido
    const modalInner = document.querySelector('.modal-inner');
    if (modalInner) {
      gsap.to(modalInner, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in"
      });
    }

    // Esperamos un poco y cerramos el modal
    gsap.delayedCall(0.3, () => {
      modalVisible.value = false;
      setTimeout(() => {
        emit('close');
      }, 300);
    });
  }
}, { immediate: true });

const handleClose = () => {
  if (isModalClosing.value) return;

  isModalClosing.value = true;

  // Animar cierre con GSAP
  gsap.to('.modal-content', {
    scale: 0.9,
    opacity: 0,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      contentVisible.value = false;

      gsap.delayedCall(0.1, () => {
        modalVisible.value = false;
        emit('close');
      });
    }
  });
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    handleClose();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <teleport to="body">
    <div v-if="isOpen"
         class="modal-overlay"
         :class="{ 'visible': modalVisible, 'closing': isModalClosing }"
         @click="handleClose">
      <div
          class="modal-content"
          :class="{ 'content-visible': contentVisible }"
          :style="backgroundImage ? `background-image: url(${backgroundImage})` : ''"
          @click.stop
      >
        <!-- Decoración visual opcional -->
        <template v-if="withDecorations">
          <div class="modal-decoration top-left"></div>
          <div class="modal-decoration top-right"></div>
          <div class="modal-decoration bottom-left"></div>
          <div class="modal-decoration bottom-right"></div>
        </template>

        <button class="close-button" @click="handleClose">&times;</button>

        <div class="modal-inner" :class="{ 'visible': contentVisible }">
          <slot></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
// Estructura principal del modal
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(0px);
  transition: backdrop-filter 0.5s ease, background-color 0.5s ease;

  &.visible {
    backdrop-filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.65);
  }

  &.closing {
    backdrop-filter: blur(0px);
    background-color: rgba(0, 0, 0, 0.45);
    transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
  }
}

// Contenido del modal
.modal-content {
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 50%;
  height: 75%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  transform: scale(1);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.content-visible {
    transform: scale(1);
  }
}

// Decoración del modal
.modal-decoration {
  position: absolute;
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  opacity: 0;

  &.top-left {
    top: 0;
    left: 0;
    border-bottom-right-radius: 100%;
  }

  &.top-right {
    top: 0;
    right: 0;
    border-bottom-left-radius: 100%;
  }

  &.bottom-left {
    bottom: 0;
    left: 0;
    border-top-right-radius: 100%;
  }

  &.bottom-right {
    bottom: 0;
    right: 0;
    border-top-left-radius: 100%;
  }
}

// Contenedor interior del modal
.modal-inner {
  width: 100%;
  height: 100%;
  overflow: auto;
  opacity: 0;

  &.visible {
    opacity: 1;
  }
}

// Botón de cierre
.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 32px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s, transform 0.2s;
  opacity: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1) rotate(90deg);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

// Estilos responsivos
// Pantallas pequeñas y medianas
@media screen and (max-width: 1200px) {
  .modal-content {
    width: 90%;
    height: 80%;
  }

  .close-button {
    font-size: 28px;
    width: 40px;
    height: 40px;
    top: 12px;
    right: 12px;
  }
}

// Pantallas FullHD (1080p)
@media screen and (min-width: 1201px) and (max-width: 1920px) {
  .modal-content {
    width: 70%;
    height: 85%;
  }

  .close-button {
    font-size: 28px;
    width: 40px;
    height: 40px;
    top: 12px;
    right: 12px;
  }
}

// Pantallas 2K (1440p)
@media screen and (min-width: 1921px) and (max-width: 2560px) {
  .modal-content {
    width: 60%;
    height: 75%;
  }

  .close-button {
    font-size: 32px;
    width: 48px;
    height: 48px;
  }
}

// Pantallas 4K y superiores
@media screen and (min-width: 2561px) {
  .modal-content {
    width: 50%;
    height: 70%;
  }

  .close-button {
    font-size: 38px;
    width: 60px;
    height: 60px;
    top: 20px;
    right: 20px;
  }
}
</style>