<template lang="pug">
  .header
    .title(v-if="currentEntity") {{ currentEntity.config.title }}
    .loading(v-if="currentEntity && currentEntity.loading")
    .badge.red(v-if="isSearch && !currentEntity.loading && currentCategory.searchable && currentEntity.items.length") {{ currentEntity.total }}
</template>

<script>
import { mapState } from 'vuex'
import SortMenu from './sortMenu'
import EntityService from '../../services/entity'

export default {
  name: 'LeftPanelHeader',
  components: {
    'sort-menu': SortMenu
  },
  computed: {
    ...mapState({
      styles: state => state.common.styles,
      currentCategory: state => state.common.currentCategory,
      currentEntity: state => EntityService.getListCurrentEntity(state),
      isSearch: state => state.common.search.isSearch
    }),
    isSortable () {
      let sortings = []
      if (this.currentEntity) {
        const ModelClass = EntityService.getModelClassByClassName(this.currentEntity.name)
        sortings = ModelClass.getSortings().length
      }
      return sortings
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/mixins';

.header {
  height: 52px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 0;
  color: #fff;

  .title {
    text-transform: uppercase;
    font-weight: bold;
    font-size: 16px;
  }

  .loading {
    width: 22px;
    height: 22px;
    margin-left: 12px;
    position: relative;
    @include loading(#fff, 3px, 22px);
  }

  .badge {
    margin-left: 8px;
  }
}
</style>
