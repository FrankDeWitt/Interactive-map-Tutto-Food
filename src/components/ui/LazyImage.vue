<script>
import { ref, onMounted, computed, watch } from 'vue';

const globalImageCache = new Map();

export default {
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    imgClass: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['load'],
  setup(props, { emit }) {
    const isLoaded = ref(false);
    const hasError = ref(false);
    const uniqueKey = ref(Date.now());

    const loadedSrc = computed(() => {
      if (globalImageCache.has(props.src)) {
        return props.src;
      }
      return isLoaded.value ? props.src : props.placeholder;
    });

    const preloadImage = () => {
      if (globalImageCache.has(props.src)) {
        isLoaded.value = true;
        emit('load');
        return;
      }

      const img = new Image();

      img.onload = () => {
        isLoaded.value = true;
        hasError.value = false;
        globalImageCache.set(props.src, true);
        emit('load');
      };

      img.onerror = () => {
        hasError.value = true;
        isLoaded.value = false;
        console.error(`Failed to load image: ${props.src}`);
      };

      img.fetchPriority = 'high';
      img.decoding = 'async';
      img.src = props.src;
    };

    const onLoaded = () => {
      globalImageCache.set(props.src, true);
      emit('load');
    };

    const resetComponent = () => {
      isLoaded.value = false;
      hasError.value = false;
      uniqueKey.value = Date.now();
      preloadImage();
    };

    onMounted(() => {
      preloadImage();
    });

    watch(() => props.src, (newSrc, oldSrc) => {
      if (newSrc !== oldSrc) {
        resetComponent();
      }
    }, { immediate: false });

    return {
      loadedSrc,
      onLoaded,
      isLoaded,
      hasError,
      uniqueKey
    };
  }
}
</script>

<template>
  <img
      v-if="loadedSrc"
      :src="loadedSrc"
      :alt="alt"
      :class="imgClass"
      loading="eager"
      fetchpriority="high"
      decoding="async"
      @load="onLoaded"
      :key="uniqueKey"
  />
  <div v-else :class="imgClass" style="background-color: #f5f5f5; width: 100%; height: 100%;" />
</template>