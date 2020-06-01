import Vue from 'vue'
import BaseService from '../services/base'
import ApiService from '../services/api'

export default (data) => {
  // Set base static entities
  BaseService.error = data.error
  BaseService.api = ApiService
  BaseService.vuex = data.store
  BaseService.router = data.app.router
  BaseService.route = data.route
  BaseService.events = new Vue()

  if (process.browser) {
    // Fix 100vh for mobile
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
  }
}
