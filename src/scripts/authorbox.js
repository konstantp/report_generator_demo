import Vue from '../../node_modules/vue/dist/vue.min.js';

export default Vue.component('authorbox', {
  template: '#authorbox-template',
  props: [ 'index', 'author', 'ui'],

  data: function () {
    return {
      isExpanded: false,       
  	}
  },  

  computed: {
  	togglerBtnText: function() {
      return (this.isExpanded ? 'Close ': 'Show') + ' detailed report';
    }
  },

  methods: {
    toggleReport() {
    	this.isExpanded = !this.isExpanded;
    },

    exportReport() {
    	alert('Export report to .CSV!');
    }, 

    printReport() {
    	alert('Print report!');
    },        
  }
  
});