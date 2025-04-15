<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { getPreloadedImageSrc } from '@/utils/imageService';
import dummyLogo from "@/assets/logos/dummy.png";
import LazyImage from "@/components/ui/LazyImage.vue";

const props = defineProps({
  company: {
    type: Object,
    default: () => ({})
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const modalVisible = ref(false);

const currentCompany = ref(null);

watch(() => props.company, (newCompany) => {
  if (newCompany) {
    currentCompany.value = newCompany;
  }
}, { immediate: true, deep: true });

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      modalVisible.value = true;
    }, 50);
  } else {
    modalVisible.value = false;
  }
}, { immediate: true });

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

const handleClose = () => {
  modalVisible.value = false;
  setTimeout(() => {
    emit('close');
  }, 400);
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
    <transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" :class="{ 'visible': modalVisible }" @click="handleClose">
        <div
            class="modal-content"
            @click.stop
        >
          <div class="modal-info" v-if="currentCompany">
            <div key="company-detail" class="company-detail">
              <div class="company-card">
                <button class="close-button" @click="handleClose">&times;</button>
                <div class="company-logo-container">
                  <div class="logo-wrapper">
                    <LazyImage
                        :src="getCompanyModalImage"
                        :alt="currentCompany.name"
                        :img-class="'company-detail-logo fade-in'"
                    />
                  </div>
                </div>

                <div class="company-info">
                  <div class="column column-left">
                    <div class="info-item" v-if="currentCompany.manager">
                      <div class="info-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div class="info-text">{{ currentCompany.manager }}</div>
                    </div>

                    <div class="info-item" v-if="currentCompany.address">
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
                    <div class="info-item" v-if="currentCompany.phone">
                      <div class="info-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div class="info-text">{{ currentCompany.phone }}</div>
                    </div>

                    <div class="info-item" v-if="currentCompany.email">
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

                    <div class="info-item" v-if="currentCompany.website">
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
                  <div class="info-item stand" v-if="currentCompany.stand">
                    <div class="stand-text">STAND {{ currentCompany.stand }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
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
  transition: backdrop-filter 0.5s ease;

  &.visible {
    backdrop-filter: blur(3px);
  }
}

.modal-content {
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 50%;
}

.modal-info {
  padding: 30px;
  width: 100%;
}

.company-name {
  font-size: 2.5rem;
  margin: 0 0 15px 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.company-details {
  font-size: 1.2rem;
  line-height: 1.5;
  max-width: 80%;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}

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

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1) rotate(90deg);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.company-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 2rem;

  .company-card {
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 24px;
    width: 90%;
    padding: 3.3rem;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    backdrop-filter: blur(10px);
    transform: translateY(0);

    .company-logo-container {
      text-align: center;
      margin: 2rem 0;
      height: 300px;
      opacity: 0;
      transform: translateY(20px);

      .logo-wrapper {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .company-detail-logo {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;

        &.fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      }

      .logo-placeholder {
        width: 100%;
        height: 100%;
        background-color: transparent;
      }
    }

    .company-info {
      display: flex;
      gap: 1.2rem;
      margin-bottom: 2rem;

      .column {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 20px;
        flex: 1;
      }

      .info-item {
        display: flex;
        align-items: center;
        font-size: 1.15rem;
        opacity: 0;
        transform: translateY(20px);

        .info-icon {
          width: 36px;
          height: 36px;
          margin-right: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: black;
          border-radius: 50%;
          color: white;
        }

        .info-text {
          color: #000;
          flex: 1;
          font-size: 1.8rem;

          a {
            color: #000;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        &.stand {
          position: absolute;
          bottom: 20px;
          right: 20px;
          margin-top: 1rem;
          justify-content: flex-end;
          opacity: 0;
          transform: translateX(20px);

          .stand-text {
            font-size: 2rem;
            font-weight: bold;
          }
        }
      }
    }

    .back-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      position: absolute;
      bottom: 12px;
      left: 20px;

      .back-arrow {
        margin-right: 0.5rem;
      }
    }
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  .modal-content {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .modal-content {
    opacity: 0;
    transform: scale(0.85) translateY(30px);
  }
}

.modal-overlay.visible {
  .company-logo-container {
    animation: fadeInUp 0.6s 0.2s forwards;
  }

  .column-left .info-item:nth-child(1) {
    animation: fadeInUp 0.5s 0.3s forwards;
  }

  .column-left .info-item:nth-child(2) {
    animation: fadeInUp 0.5s 0.4s forwards;
  }

  .column-right .info-item:nth-child(1) {
    animation: fadeInUp 0.5s 0.5s forwards;
  }

  .column-right .info-item:nth-child(2) {
    animation: fadeInUp 0.5s 0.6s forwards;
  }

  .info-item.stand {
    animation: fadeInRight 0.5s 0.7s forwards;
  }

  .close-button {
    animation: fadeInRotate 0.4s 0.7s forwards;
  }
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

@keyframes fadeInRotate {
  from {
    opacity: 0;
    transform: rotate(-90deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}

/* Responsive styles */
@media screen and (max-width: 1920px) {
  .company-name {
    font-size: 1.8rem;
  }

  .company-details {
    font-size: 1rem;
  }

  .close-button {
    font-size: 28px;
    width: 40px;
    height: 40px;
    top: 12px;
    right: 12px;
  }
}

@media screen and (min-width: 1921px) and (max-width: 2560px) {
  .company-name {
    font-size: 2.5rem;
  }

  .company-details {
    font-size: 1.2rem;
  }

  .close-button {
    font-size: 32px;
    width: 48px;
    height: 48px;
  }
}

@media screen and (min-width: 2561px) {
  .company-name {
    font-size: 3rem;
  }

  .company-details {
    font-size: 1.5rem;
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