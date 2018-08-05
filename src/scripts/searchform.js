import Vue from '../../node_modules/vue/dist/vue.min.js';
import vSelect from 'vue-select';
import { EventBus } from './eventbus.js';
import filterField from './filter-field.js';

export default Vue.component('searchform', {
    template: '#searchform-template',
    props: ['searchprops'],
    data() {
      return {
        filters: [
          {
            name: 'Refferrer', 
            slug: 'referrer.host', 
            comparison: '!=', 
            value: 'm.facebook.com'
          }, 
          {
            name: 'Device Type', 
            slug: 'device_type', 
            comparison: '==', 
            value: 'mobile'
          }
        ],        
        fields: [
            {
              label: 'Publication date', 
              value: 'published',
            }, 
            {
              label: 'Title', 
              value: 'title',
            }, 
            {
              label: 'Segment slug', 
              value: 'segment.slug',
            }, 
            {
              label: 'Segment path', 
              value: 'segment.path',
            }, 
            {
              label: 'Referrer host', 
              value: 'referrer.host',
            }                                               
          ],
        enclosures: [
            {
              label: 'Author', 
              value: 'author',
            }           
          ],
        metrics: [
            {
              label: 'Hits', 
              value: 'hits',
            }, 
            {
              label: 'Sessions', 
              value: 'sessions',
            }, 
            {
              label: 'Bounce rate', 
              value: 'bounce-rate',
            }                       
          ],                
        periodduration: 7,        
        periodunit: {
            label: 'Day',
            value: 'd'
          },
        interval: 1,
        intervalunit: {
            label: 'Day',
            value: 'd'
          },
        limit: 5, 
        breakdown: [
            {
              label: 'Author', 
              value: 'author.id',
            }, 
            {
              label: 'Date', 
              value: 'date',
            }, 
            {
              label: 'Article', 
              value: 'article.id',
            }                       
        ], 
      }
    },
    components: {
      'v-select': vSelect, 
      'filter-field': filterField,
    },

    created: function(){
      EventBus.$on('removeFilterEvent', (index) => {
        this.removeFilter(index);
      });      

      EventBus.$on('changeFilterEvent', (args) => {        
        this.changeFilter(...args);
      });        

    },

    mounted: function(){
    },

    methods: {

      addFilter() {
        // console.log('add filter');        
        const options = this.searchprops.options.filteroptions;
        const defaultOptionSlug = Object.keys(options)[0];
        const defaultOption = options[defaultOptionSlug];

        this.filters.push({
          name: defaultOption.name, 
          slug: defaultOptionSlug, 
          comparison: '==', 
          value: defaultOption.defaultValue
        });

        return false;
      },       

      removeFilter(index) {
        // console.log('remove filter');       
        this.filters.splice(index, 1);
        return false;
      },  

      changeFilter(index, slug) {
        // console.log(index, slug);   
        const options = this.searchprops.options.filteroptions;
        this.filters[index].value = options[slug].defaultValue;
        return false;
      },            

      clearForm() {   
        this.filters = [];
        this.fields = [];
        this.enclosures = [];
        this.metrics = [];             
        this.periodduration = 7;
        this.periodunit = {
            label: 'Day',
            value: 'd'
          };
        this.interval = 1;
        this.intervalunit = {
            label: 'Day',
            value: 'd'
          };
        this.limit = 5;
        this.breakdown = [];

      },

      emitSearchEvent() {

        const searchObj = {};

        if ( this.filters.length ) {
          searchObj.f = this.filters.map((filter) => filter.slug + filter.comparison + filter.value ).join(';') + ';';
        }

        if ( this.fields.length ) {
          searchObj.fields = this.fields.map((param) => param.value).join(',');
        }

        if ( this.enclosures.length ) {
          searchObj.enclosures = this.enclosures.map((param) => param.value).join(',');
        }  

        if ( this.metrics.length ) {
          searchObj.metrics = this.metrics.map((param) => param.value).join(',');
        }                

        searchObj.limit = this.limit;
        searchObj.from =  -this.periodduration + this.periodunit.value;
        searchObj.interval = this.interval + this.intervalunit.value;

        if ( this.breakdown.length ) {
          searchObj.b = this.breakdown.map((param) => param.value).join(',');
        }                                

        EventBus.$emit('triggerSearch', searchObj);

      },

      handleSubmit() {

        // console.log('handleSubmit');        
        this.emitSearchEvent();        

      },
    }
  });
