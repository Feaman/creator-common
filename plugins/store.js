import storeModule from '../store/index'

export default ({ store }) => {
  store.registerModule('common', storeModule)
}
