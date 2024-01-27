import { createRouter, createWebHistory } from 'vue-router'
import Game from '../views/Game.vue'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/tic-tac-chess',
      name: 'tic-tac-chess',
      component: Game
    },

  ]
})

export default router
