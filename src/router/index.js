import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import CatalogView from '@/views/CatalogView.vue';

const routes = [
    {
        path: '/',
        component: HomeView,
    },
    {
        path: '/meat-cured-meat',
        name: 'MeatAndCuredMeat',
        component: CatalogView,
        props: {
            catalogIndex: 0
        }
    },
    {
        path: '/speciality',
        name: 'Speciality',
        component: CatalogView,
        props: {
            catalogIndex: 1
        }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;