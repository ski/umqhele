import { createRouter, createWebHistory } from 'vue-router'
import BlankLayout from '../layouts/BlankLayout.vue'
import Home from '../pages/Home.vue';
import NewEntry from '../pages/NewEntry.vue'
const routes = [
  {
    path: "/",
    component: BlankLayout,
    children: [
      {
        path: "",
        name: 'Home',
        component: Home
      },
      {
        path: "/new",
        name: 'NewEntry',
        component: NewEntry
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
