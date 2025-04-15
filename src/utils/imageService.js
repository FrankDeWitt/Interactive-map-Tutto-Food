const preloadedImages = new Map();

/**
 * Normaliza la ruta de una imagen para asegurar que sea absoluta
 * @param {string} src - Ruta de la imagen
 * @returns {string} - Ruta normalizada
 */
const normalizePath = (src) => {
    if (src.startsWith('http') || src.startsWith('/')) {
        return src;
    }

    return new URL(`/src/assets/logos/${src}`, import.meta.url).href;
};

/**
 * Precarga una imagen y la guarda en el mapa de imágenes
 * @param {string} src - Ruta de la imagen
 * @param {string} key - Clave para identificar la imagen (opcional, por defecto usa src)
 * @param {Function} onProgress - Función de callback para notificar progreso (opcional)
 * @returns {Promise} - Promesa que se resuelve cuando la imagen se ha cargado
 */
export const preloadImage = (src, key = src, onProgress = null) => {
    return new Promise((resolve, reject) => {
        const normalizedSrc = normalizePath(src);
        const img = new Image();

        img.onload = () => {
            preloadedImages.set(key, img);
            if (onProgress) onProgress();
            resolve(img);
        };

        img.onerror = (err) => {
            console.error(`Error al cargar la imagen ${normalizedSrc}:`, err);
            if (onProgress) onProgress();
            reject(err);
        };

        img.src = `${normalizedSrc}?t=${Date.now()}`;
    });
};

/**
 * Precarga un conjunto de imágenes de un catálogo
 * @param {Array} catalog - Catálogo de empresas
 * @param {Function} onProgress - Función de callback para notificar progreso (opcional)
 * @returns {Promise} - Promesa que se resuelve cuando todas las imágenes se han cargado
 */
export const preloadCatalogImages = async (catalog, onProgress = null) => {
    if (!catalog || !catalog.companies) {
        console.warn('Catálogo inválido para precargar imágenes');
        return;
    }

    const logoPromises = [];

    if (catalog.logo) {
        logoPromises.push(preloadImage(catalog.logo, `catalog_${catalog.id}`, onProgress));
    }

    catalog.companies.forEach(company => {
        if (company.logo) {
            logoPromises.push(preloadImage(company.logo, `company_${company.id}`, onProgress));
        }
    });

    try {
        await Promise.all(logoPromises);
        console.log(`Precargadas ${logoPromises.length} imágenes para el catálogo ${catalog.name}`);
    } catch (err) {
        console.error('Error al precargar imágenes del catálogo:', err);
        throw err;
    }
};

/**
 * Limpia las imágenes precargadas de un catálogo específico
 * @param {Object} catalog - Catálogo de empresas
 */
export const clearCatalogPreloadedImages = (catalog) => {
    if (!catalog || !catalog.companies) return;

    if (catalog.logo) {
        preloadedImages.delete(`catalog_${catalog.id}`);
    }

    catalog.companies.forEach(company => {
        if (company.logo) {
            preloadedImages.delete(`company_${company.id}`);
        }
    });

    console.log(`Limpiadas imágenes precargadas del catálogo ${catalog.name}`);
};

/**
 * Obtiene una imagen precargada por su clave
 * @param {string} key - Clave de la imagen
 * @returns {HTMLImageElement|null} - Elemento de imagen o null si no existe
 */
export const getPreloadedImage = (key) => {
    return preloadedImages.get(key) || null;
};

/**
 * Obtiene la URL de una imagen precargada
 * @param {string} key - Clave de la imagen
 * @returns {string|null} - URL de la imagen o null si no existe
 */
export const getPreloadedImageSrc = (key) => {
    const img = getPreloadedImage(key);
    return img ? img.src : null;
};

/**
 * Comprueba si todas las imágenes de un catálogo están precargadas
 * @param {Object} catalog - Catálogo de empresas
 * @returns {boolean} - True si todas las imágenes están precargadas
 */
export const areCatalogImagesPreloaded = (catalog) => {
    if (!catalog || !catalog.companies) return false;

    if (catalog.logo && !preloadedImages.has(`catalog_${catalog.id}`)) {
        return false;
    }

    for (const company of catalog.companies) {
        if (company.logo && !preloadedImages.has(`company_${company.id}`)) {
            return false;
        }
    }

    return true;
};

export default {
    preloadImage,
    preloadCatalogImages,
    getPreloadedImage,
    getPreloadedImageSrc,
    areCatalogImagesPreloaded,
    clearCatalogPreloadedImages
};