import Vue from '../../node_modules/vue/dist/vue.min.js';
import { EventBus } from './eventbus.js';

export default Vue.component('filter-field', {
    template: '#filter-field-template',
    props: ['options', 'filter', 'index'],

  	methods: {
      changeFilter(index, slug) {               
        EventBus.$emit('changeFilterEvent', [index, slug]);        
        return false;
      }, 

  		removeFilter(index) { 			  			
        EventBus.$emit('removeFilterEvent', index);        
  			return false;
  		}
  	}
 });