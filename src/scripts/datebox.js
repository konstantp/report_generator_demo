import Vue from '../../node_modules/vue/dist/vue.min.js';
import moment from 'moment';

export default Vue.component('datebox', {
  template: '#datebox-template',
  props: [ 'timestamp' ], 
  computed: {
    date: function() {

      const timestamp = String(this.timestamp);
      return {
        weekday: moment(timestamp).format('dddd'), 
        day: moment(timestamp).format('DD'), 
        month: moment(timestamp).format('MMMM'), 
        year: moment(timestamp).format('YYYY'), 
      }
    }
        
  }  
});