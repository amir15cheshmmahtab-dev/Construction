import { defineStore } from 'pinia'
import type { CustomerType } from '~/types/marketplace'

interface UiState {
  menuOpen: boolean
  location: string
  customerType: CustomerType
  favoriteIds: string[]
  toast: string | null
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    menuOpen: false,
    location: 'تهران',
    customerType: 'individual',
    favoriteIds: [],
    toast: null,
  }),
  actions: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen
    },
    closeMenu() {
      this.menuOpen = false
    },
    toggleFavorite(id: string) {
      this.favoriteIds = this.favoriteIds.includes(id)
        ? this.favoriteIds.filter((favoriteId) => favoriteId !== id)
        : [...this.favoriteIds, id]
    },
    notify(message: string) {
      this.toast = message
    },
    dismissToast() {
      this.toast = null
    },
    selectLocation(city: string) {
      this.location = city
    },
  },
})
