'use strict'

import BaseService from './base'

export default class User extends BaseService {
  static TAB_TEMPLATES = 'TAB_TEMPLATES'
  static TAB_COLLAGES = 'TAB_COLLAGES'

  static getUser () {
    try {
      // Handle user session hash
      let userSessionHash
      if (typeof window !== 'undefined') {
        userSessionHash = window.localStorage.getItem('editorUserSessionHash')
        if (!userSessionHash) {
          userSessionHash = require('nanoid')()
        }
        window.localStorage.setItem('editorUserSessionHash', userSessionHash)
      }

      return this.api.getUser({ guest_id: userSessionHash })
        .then(user => {
          this.vuex.dispatch('common/setUser', user)

          if (user && user.roles.find(role => role === 'user')) {
            this.updateLicenseInfo()
          }

          return user
        })
        .catch(error => {
          this.error(error)
        })
    } catch (error) {
      this.error(error)
      return Promise.reject(error)
    }
  }

  static updateLicenseInfo () {
    try {
      if (this.vuex.state.common.user && (!this.vuex.state.common.user.license || (this.vuex.state.common.user.license && this.vuex.state.common.user.license.expired))) {
        this.vuex.dispatch('fillUserInfo')
          .then(() => {
            let lastLicense = 0

            // Find most later license
            if (Array.isArray(this.vuex.state.auth.user.licenses)) {
              this.vuex.state.auth.user.licenses.forEach(license => {
                if (license.expire > lastLicense) {
                  lastLicense = license.expire
                }
              })
            }

            // If any active license - update photo user info
            if (lastLicense * 1000 > Date.now()) {
              this.api.user({ sync: 1 })
                .then(user => {
                  this.vuex.dispatch('common/setUser', user)
                  this.vuex.dispatch('common/setLicenseVerified', true)
                })
            } else {
              this.vuex.dispatch('common/setLicenseVerified', true)
            }
          })
          .catch(error => {
            this.error(error)
          })
      } else {
        this.vuex.dispatch('common/setLicenseVerified', true)
      }
    } catch (error) {
      this.error(error)
    }
  }

  static getTemplates () {
    return this.api.getTemplates()
      .then(templatesData => {
        let templates = []
        templatesData.collages.forEach(collage => {
          templates.push({
            id: collage.id,
            preview: collage.preview,
            data: JSON.parse(collage.json).collage
          })
        })
        BaseService.vuex.dispatch('common/setTemplates', templates)
      })
      .catch(error => {
        this.error(error)
      })
  }

  static getNotifications (page) {
    this.api.getNotifications({ page })
      .then(notificationsData => {
        this.vuex.dispatch(
          'common/setNotifications',
          {
            items: notificationsData.notifications,
            total: notificationsData.total,
            page
          }
        )
        this.vuex.dispatch('common/setNotificationsLoading', false)
      })
      .catch(() => {
        this.vuex.dispatch('common/setNotificationsLoading', false)
      })
  }

  static markNotificationAsRead (notificationId) {
    let notification = this.vuex.state.common.notifications.items.find(notification => notification.id === notificationId)
    if (notification) {
      this.api.markNotificationAsRead(notification)
        .then(() => this.vuex.dispatch('common/setNotification', { notification, data: { readAt: true } }))
    }
  }

  static loadMoreNotifications () {
    const notifications = this.vuex.state.common.notifications
    if (notifications.items.length < notifications.total) {
      const page = notifications.page + 1
      return this.api.getNotifications({ page })
        .then(notificationsData => {
          this.vuex.dispatch(
            'common/setNotifications',
            {
              items: [...notifications.items, ...notificationsData.notifications],
              page,
              total: notificationsData.total
            }
          )
        })
    } else {
      return Promise.resolve()
    }
  }
}
