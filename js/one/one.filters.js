angular.module('oneFilters', [])

.filter("dateToInputFormat", function() {
	return function(inputDate) {
		return new Date(inputDate)
	}
});


