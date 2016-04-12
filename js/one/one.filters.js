angular.module('oneFilters', [])

.filter("dateToInputFormat", function() {
	return function(inputDate) {
		//debugger;
		return new Date(inputDate)
	}
});


