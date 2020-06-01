import Vue from 'vue'
import infiniteScroll from 'icons8-common/src/components/appInfiniteScroll.vue'
import VueMasonry from 'vue-masonry-css'
import TooltipDirective from '../plugins/tooltip'

export default () => {
  Vue.use(VueMasonry)
  Vue.directive('tooltip', TooltipDirective)

  Vue.component('infinite-scroll', infiniteScroll)
}
