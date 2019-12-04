const AppointmentsAppspaceTemplate 	= require('./appointments-appspace.template.js');


module.exports = AppointmentsAppspace = {

    render(app, data) {

      document.querySelector(".email-appspace").innerHTML = AppointmentsAppspaceTemplate();

      var calendarEl = document.getElementById('appointments-calendar');

      var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [ 'dayGrid' ],
	events: [
   	  {
      	    	title: 'Meeting',
      		start: '2019-12-15T16:30:00',
      		extendedProps: {
        		status: 'done'
          	***REMOVED***
      ***REMOVED***,
          {
      		title: 'Birthday Party',
      		start: '2019-12-12T10:00:00',
      		backgroundColor: 'green',
      		borderColor: 'green'
    	  ***REMOVED***,
        ],
  	dayRender: function(dayRenderInfo) {
          dayRenderInfo.el.innerHTML = '<div class="appointments-calendar-day">custom view</div>';
  	***REMOVED***,
  ***REMOVED***);

      calendar.render();

***REMOVED***,

    attachEvents(app, data) {
***REMOVED***

***REMOVED***
