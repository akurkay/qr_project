import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: () => import('./components/FixedAssetsList')
        },
        {
            path: '/inventory',
            component: () => import('./components/Inventory')
        },
        {
            path:'/active',
            component: () => import('./components/ActiveInventory')
        },
        {
            path: '/scan',
            component: () => import('./components/ScanInventory')
        }
    ]
})
