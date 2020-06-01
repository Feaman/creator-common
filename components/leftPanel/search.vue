<template lang="pug">
  .search
    input.center(
      v-bind:value="searchQuery"
      v-on:input="input"
      v-on:focus="focus()"
      v-on:click="focus()"
      v-on:keydown.enter="search()"
      v-on:keydown.up.prevent="selectSuggestion(SELECT_SUGGESTION_UP)"
      v-on:keydown.down.prevent="selectSuggestion(SELECT_SUGGESTION_DOWN)"
      :placeholder="placeholder"
      tabindex="0"
      ref="input"
    )
    .button-clear.icon.small(
      v-if="searchQuery"
      v-on:click="clear()"
      v-html="$creatorCommonIcons.clear"
    )
    .suggestions(
      v-if="showSuggestions"
      ref="suggestions"
    )
      .not-found(v-if="!suggestionsLoading && !suggestions.length")
        span We have nothing similar to&nbsp;
        strong {{ searchQuery }}
        span . Try different word.
      .suggestion(
        v-if="suggestions.length"
        v-for="(suggestion, index) in suggestions"
        v-on:click="search(suggestion.name)"
        v-bind:class="{ 'border-bottom': suggestionsLoading || index !== suggestions.length - 1, active: suggestion.active }"
      )
        div(v-html="suggestion.title")
      .loader(
        v-if="suggestionsLoading"
        :class="{ inner: suggestions.length }"
      )
</template>

<script>
import { mapState } from 'vuex'
import EntityService from '../../services/entity'

const SELECT_SUGGESTION_UP = 'up'
const SELECT_SUGGESTION_DOWN = 'down'

export default {
  name: 'LeftPanelSearch',
  props: {
    placeholder: {
      default: '',
      type: String
    },
    debounce: {
      default: true,
      type: Boolean
    }
  },
  data () {
    return {
      suggestions: [],
      currentSuggestionIndex: null,
      suggestionsLoading: false,
      showSuggestions: false,
      SELECT_SUGGESTION_UP,
      SELECT_SUGGESTION_DOWN
    }
  },
  computed: {
    ...mapState({
      currentEntity: state => EntityService.getListCurrentEntity(state)
    }),
    searchQuery () {
      return this.currentEntity.searchQuery
    },
    searchQueryClean () {
      return (this.currentEntity.searchQuery || '').replace(/[^'0-9A-Za-za-zа-яА-Я-\s]/g, '').trim()
    }
  },
  watch: {
    searchQuery () {
      if (!this.searchQuery) {
        this.clear()
      }
    },
    showSuggestions () {
      if (this.showSuggestions) {
        this.$store.dispatch('common/setSuggesting', true)
      } else {
        this.currentSuggestionIndex = null
        this.$store.dispatch('common/setSuggesting', false)
      }
    }
  },
  created: function () {
    this.debouncedSuggestions = this.debounce ? this.$utils.debounce(this.suggest, 400) : this.suggest
  },
  mounted () {
    document.addEventListener('mousedown', this.outsideClick)
  },
  destroyed () {
    document.removeEventListener('mousedown', this.outsideClick)
  },
  methods: {
    search (query) {
      if (query) {
        EntityService.setEntity(this.currentEntity, { searchQuery: query.replace(/[^'0-9A-Za-zа-яА-Я-\s]/gu, '').trim() })
      }

      if (!this.searchQuery) {
        return
      }

      this.showSuggestions = false
      this.$store.dispatch('common/setSearch', { isSearch: true })

      const ModelClass = EntityService.getModelClassByClassName(this.currentEntity.name)
      ModelClass
        .fetchItems(this.currentEntity)
        .catch(error => {
          console.error(error)
        })
    },
    suggest () {
      if (this.searchQueryClean) {
        const ModelClass = EntityService.getModelClassByClassName(this.currentEntity.name)
        const params = { query: this.searchQueryClean }

        // Add current style to params
        const currentStyle = this.$store.state.styles.current
        if (currentStyle) {
          params.style_ids = currentStyle.id
        }

        ModelClass.searchSuggest(params)
          .then(suggestionsData => {
            const suggestions = []
            suggestionsData.slice(0, 10).forEach(suggestion => {
              const regex = new RegExp(params.query, params.query.length > 1 ? 'g' : '')
              suggestions.push({
                title: suggestion.title.toLowerCase().replace(regex, `<strong>${params.query.toLowerCase()}</strong>`),
                name: suggestion.title,
                active: false
              })
            })
            this.suggestions = suggestions
            this.suggestionsLoading = false
          })
      }
    },
    selectSuggestion (direction) {
      if (this.suggestions.length) {
        if (direction === this.SELECT_SUGGESTION_UP) {
          if (this.currentSuggestionIndex === null) {
            this.currentSuggestionIndex = this.suggestions.length - 1
          } else {
            this.suggestions[this.currentSuggestionIndex].active = false
            this.currentSuggestionIndex -= 1
            if (this.currentSuggestionIndex < 0) {
              this.currentSuggestionIndex = this.suggestions.length - 1
            }
          }
        } else if (direction === this.SELECT_SUGGESTION_DOWN) {
          if (this.currentSuggestionIndex === null) {
            this.currentSuggestionIndex = 0
          } else {
            this.suggestions[this.currentSuggestionIndex].active = false
            this.currentSuggestionIndex += 1
            if (this.currentSuggestionIndex > this.suggestions.length - 1) {
              this.currentSuggestionIndex = 0
            }
          }
        }

        this.suggestions[this.currentSuggestionIndex].active = true
        EntityService.setEntity(this.currentEntity, { searchQuery: this.suggestions[this.currentSuggestionIndex].name })
        this.$nextTick(() => this.$refs.input.select())
      }
    },
    input (event) {
      EntityService.setEntity(this.currentEntity, { searchQuery: event.target.value })
      this.startSuggesting()
    },
    startSuggesting () {
      this.debouncedSuggestions()
      this.showSuggestions = true
      this.suggestionsLoading = true
    },
    focus (event) {
      this.$refs.input.select()
      if (this.searchQuery) {
        this.startSuggesting()
      }
    },
    clear () {
      this.$store.dispatch('common/clearSearch', this.currentEntity)
      const ModelClass = EntityService.getModelClassByClassName(this.currentEntity.name)
      ModelClass.clearSearch()
      this.suggestions = []
      this.showSuggestions = false
      this.$refs.input.focus()
    },
    handleEnter () {
      this.search()
    },
    outsideClick (event) {
      if (!this.$refs.input.contains(event.target)) {
        this.$refs.input.selectionEnd = this.$refs.input.selectionStart
      }
      if (this.$refs.suggestions && !this.$refs.suggestions.contains(event.target)) {
        this.showSuggestions = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/mixins';
@import '../../assets/css/variables';

.search {
  width: 100%;
  height: 40px;
  position: relative;
  z-index: 20;
  margin: 16px 0 0 0;
  padding: 0 16px 0 0;

  &:before {
    content: '';
    width: 100%;
    height: 24px;
    position: absolute;
    z-index: -1;
    bottom: -18px;
    background: linear-gradient(180deg, rgba(33, 33, 33, 0.7) 0%, rgba(33, 33, 33, 0) 100%);
    margin: 0 0 0 -4px;
  }

  input {
    width: 100%;
    height: 100%;
    display: flex;
    flex: 1;
    outline: 0;
    color: #fff;
    font-size: 16px;
    padding: 0 36px 0 16px;
    background: #252525;
    border: 1px solid $transparent-white-color;
    border-radius: 6px;

    &:hover {
      border: 1px solid rgba(255, 255, 255, 0.4);
      transition: 0.2s;
    }

    &:focus {
      background: #323232;
      border: 1px solid rgba(255, 255, 255, 0.6);
    }

    &::selection {
      background-color: #84acc2;
      color: #fff;
    }

    &::-moz-selection {
      background-color: #84acc2;
      color: #fff;
    }
  }

  .button-clear {
    width: 16px;
    max-width: 16px;
    position: absolute;
    top: 12px;
    right: 28px;
    display: flex;
    flex: 1;
    fill: $half-white-color;
    cursor: pointer;

    &:hover {
      fill: #fff;
      transition: 0.2s;
    }
  }

  .suggestions {
    width: calc(100% - 16px);
    position: absolute;
    top: 52px;
    padding: 8px 0;
    background-color: #fff;
    border-radius: 6px;
    color: #000;

    .suggestion {
      display: flex;
      flex-direction: row;
      padding: 8px 16px;

      &.border-bottom {
        border-bottom: 1px solid rgba(26, 26, 26, 0.05);
      }

      &.active, &:hover {
        background-color: rgba(26, 26, 26, 0.05);
        cursor: pointer;
      }
    }
  }

  .loader {
    width: 24px;
    height: 24px;
    margin: 8px auto;
    position: relative;
    @include loading(#1a1a1a, 3px, 24px);

    &.inner {
      margin: 16px auto 8px auto;
    }
  }

  .not-found {
    padding: 16px 48px;
    text-align: center;
  }
}
</style>
