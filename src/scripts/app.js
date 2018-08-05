import Vue from '../../node_modules/vue/dist/vue.min.js';
import queryString from 'querystring';
import apiresponse from '../data/apiresponse.json';
import searchform from './searchform.js';
import authorbox from './authorbox.js';
import datebox from './datebox.js';
import { EventBus } from './eventbus.js';
import VueChartkick from 'vue-chartkick';
import Chart from 'chart.js';
import Sticky from 'vue-sticky-directive'
import numeral from 'numeral';
import moment from 'moment';

Vue.use(VueChartkick, {adapter: Chart});

Vue.use(Sticky);

// Filters
Vue.filter("formatNumber", function (value) {
	if (value) {
		return numeral(value).format("0,0"); // displaying other groupings/separators is possible, look at the docs
	}
});

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('dddd') 
    	   + ' ' + moment(String(value)).format('DD') 
    	   + ' ' + moment(String(value)).format('MMMM') 
    	   + ' ' + moment(String(value)).format('YYYY');
  }
});

function shortenString(string, limit = 20, dots = false) {
	let inputString = String(string);	

	if(inputString.length > limit) {
	    inputString = inputString.substring(0, (limit - 1));	    

		if (dots) {
			inputString += '...';	
		}	    
	}  

	return inputString;	
}


// Reports App
document.addEventListener('DOMContentLoaded', function() {

  const reportsapp = new Vue({
    el: '#reportsapp',
    data: {
      isLoading: true,
      appmounted: false,
      apiendpoint: 'https://example.com/stats/',

      search: {
      	options: {
      		filteroptions: {
				'referrer.host' : {
					name: 'Referrer', 
					type: 'text', 
					defaultValue: '', 
					placeholder: 'Host Name'
				}, 
				device_type: {
					name: 'Device Type',  
					type: 'select', 
					defaultValue: 'desktop',
					options: [ 
						{
							label: 'Desktop', 
							value: 'dektop'
						}, 
						{
							label: 'Tablet', 
							value: 'tablet'
						}, 
						{
							label: 'Mobile', 
							value: 'mobile'
						}, 
            		],      		
            	}
            },
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
			periodunit: [
				{
					label: 'Minute',
					value: 'm'
				},
				{
					label: 'Hour',
					value: 'h'
				},
				{
					label: 'Day',
					value: 'd'
				},
				{
					label: 'Week',
					value: 'w'
				},				
				{
					label: 'Month',
					value: 'mo'
				},			
				{
					label: 'Year',
					value: 'y'
				},																
			],
      		interval: 1,
			intervalunit: [
				{
					label: 'Minute',
					value: 'm'
				},
				{
					label: 'Hour',
					value: 'h'
				},
				{
					label: 'Day',
					value: 'd'
				},
				{
					label: 'Week',
					value: 'w'
				},					
				{
					label: 'Month',
					value: 'mo'
				},			
				{
					label: 'Year',
					value: 'y'
				},																
			],				
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
      		]     		
      	}
      }, 
      report: {
      	summary: {
      		topreferrers: [], 
      		topreferrers_chart: [],
      		metrics: {}      		
      	}, 
      	byAuthors: []
      }, 
      ui: {
      	metriccolors: {
      		'bounce-rate': '#FC0018', 
      		hits: '#FFDB00',
      		sessions: '#0058A2'
      	}
      }, 
    },

    computed: {
    	hardcodedRequest: function() {
    		return  this.apiendpoint + '?f=referrer.host!=m.facebook.com;device_type==mobile;&fields=published,title,segment.slug,segment.path,referrer.host&enclosures=author&metrics=hits,sessions,bounce-rate&limit=5&from=-7d&interval=1d&b=author.id,date,article.id';
    	}
    },

    components: {
      searchform, 
      authorbox, 
      datebox
    },

    created() {
      setTimeout(()=>{
		this.isLoading = false;
      }, 300);

      EventBus.$on('triggerSearch', (searchObj) => {
      	const requestURL = this.generateAPIRequestURL(searchObj);      	
      	this.requestAPI(requestURL);
      });

    },

    mounted() {
      this.appmounted = true;

      this.requestAPI(this.hardcodedRequest);
          
    },

    methods: { 	

    	preparePieChartData(acc, curr) {    			
    		let label = `${shortenString(curr.key, 30, true)} - ${numeral(curr.value).format("0,0")}`;    	
			return [...acc, [ `${ label }` , curr.value ]];	
    	},


    	generateAPIRequestURL(searchObj) {

			return this.apiendpoint + '?' + queryString
												.stringify(searchObj)
												.replace(/%2C/g,",")
												.replace(/%3B/g,";")
												.replace(/%3D/g,"=");
    	},


    	generateReport(response) {
    		console.log('Parse response: ');
    		console.table(response);

    		// Response contains referrer hosts data
    		if ( response.fields.hasOwnProperty('referrer.host') ) {
    			this.report.summary.topreferrers = response.fields['referrer.host'];
				this.report.summary.topreferrers_chart = this.report.summary.topreferrers.reduce(this.preparePieChartData, []);
    		}
    		
    		// Response contains metrics data
    		if ( response.hasOwnProperty('metrics') ) {
    			this.report.summary.metrics = response.metrics;
    		}
    		    	    
    		
			let reportByAuthors;
			response.dimensions.forEach((dimension) => {    			

    			if ( dimension == 'author.id' ) {		

		    		reportByAuthors = response.details.map((authorDetails) => {	    			

		    			let author = {
		    				stats: {
		    					general: authorDetails
		    				}
		    			};	

		    			author.stats.general.topreferrers_chart = author.stats.general.fields['referrer.host'].reduce(this.preparePieChartData, []).slice(0, 5);

		    			// Response contains enclosures / author data
		    			if ( response.hasOwnProperty('enclosures') ) {
							author.personal = response.enclosures['author-' + authorDetails.key]	    
						}

		    			authorDetails.dimensions.forEach((dimension) => {		

		    				if ( dimension == 'date' ) {		    	
		    					
		    					const dateDetails = author.stats['dates'] = authorDetails.details;		    							    							    				

		    					let datechart = [];
		    					author.stats['dates'].map((date, dateIndex)=>{
																		
									Object.keys(date.metrics).map((metric, metricIndex) => {		

										// By default bounce rate is disaplyed in %. To make graph more accurate bounce rate is shown in real numbers and is calculated in relation to sessions.
										let metricValue = (metric == 'bounce-rate')	? (date.metrics['sessions'] * date.metrics[metric] / 100) : date.metrics[metric];					
																				
										if ( ! datechart[metricIndex] ) {
											datechart.push({name: metric.replace('-', ' ').toUpperCase(), data: { [date.key] : metricValue }, label: 'test'});										
										} else {									
											datechart[metricIndex].data[date.key] = metricValue;
										}

									});	
		    					});	    			

		    					author.stats['dates'].datechart = datechart; 		    					

				    			dateDetails.forEach((dateDetail) => {					    				
				    				dateDetail.dimensions.forEach((dimension) => {		

					    				if ( dimension == 'article.id' ) {

					    					dateDetail.articles = dateDetail.details.map((article) => {
					    						article.topreferrers_chart = article.fields['referrer.host'].reduce(this.preparePieChartData, []);
					    						return article;
					    					});		    					
					    				}
				    				});
				    			});
		    				}

		    			});

	    				return author;
		    		});    
		    	}
    		});    	

			this.report.byAuthors = reportByAuthors;
		
    	},


		fakeAjax(url,cb) {
			const fake_response = apiresponse;

			let randomDelay = (Math.round(Math.random() * 1E4) % 8000) + 1000;		

			setTimeout(function(){
				cb(fake_response);
			},randomDelay);
		},


		requestAPI(requesturl) {		

			console.log('Requesting API: ',  requesturl);

			if ( requesturl == this.hardcodedRequest) {
				console.log('Make fake async request.');
				const responsePromise = new Promise((resolve) => {
					this.fakeAjax(requesturl,resolve);
				});      				

				responsePromise
					.then(this.generateReport)
					.then(function(){
						console.log("Complete!");
					});			
			}
		}
    }
  });
});
Vue.config.devtools = true;