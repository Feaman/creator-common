<template lang="pug">
  .sort-menu.center(
    @click="showMenu = !showMenu"
    ref="menuButton"
  )
    div {{ currentItem.title }}
    .icon.small(v-html="$creatorCommonIcons.menuArrowDown")
    transition(name="scale-fade")
      .sub-menu(
        v-show="showMenu"
        ref="menu"
      )
        .sub-menu-row(
          v-for="item in items"
          :key="item.id"
          :class="{ active: item.id === currentItem.id }"
          @click="select(item)"
        )
          .link {{ item.title }}
</template>

<script>
import { mapState } from 'vuex'
import EntityService from '../../services/entity'

export default {
  name: 'SelectMenu',
  data () {
    return {
      showMenu: false
    }
  },
  computed: {
    ...mapState({
      currentEntity: state => EntityService.getListCurrentEntity(state),
      isSearch: state => state.common.search.isSearch
    }),
    items () {
      const ModelClass = EntityService.getModelClassByClassName(this.currentEntity.name)
      return ModelClass.getSortings()
    },
    currentItem () {
      return this.items.find(item => item.id === this.currentEntity.sorting)
    }
  },
  mounted () {
    document.addEventListener('mousedown', this.outsideClick)
  },
  destroyed () {
    document.removeEventListener('mousedown', this.outsideClick)
  },
  methods: {
    select (item) {
      const ModelClass = EntityService.getModelClassByClassName(this.currentEntity.name)
      EntityService.setEntity(this.currentEntity, { sorting: item.id })
      ModelClass.fetchItems(this.currentEntity)
    },
    outsideClick (event) {
      if (this.$refs.menu && this.$refs.menuButton && !this.$refs.menu.contains(event.target) && !this.$refs.menuButton.contains(event.target)) {
        this.showMenu = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/variables';
@import '../../assets/css/effects';

.sort-menu {
  position: relative;
  display: flex;
  flex-direction: row;
  font-size: 16px;
  font-weight: normal;
  text-transform: none;
  margin-right: 6px;
  cursor: pointer;

  .icon {
    fill: $half-white-color;
    margin: 0 0 0 10px;
  }

  .sub-menu {
    width: 88px;
    min-width: 88px;
    top: 28px;
    right: -4px;
    color: #fff;
    background-color: #2C2C2C;

    .link {
      justify-content: flex-end;
      padding-right: 24px;
    }
  }
}

</style>
