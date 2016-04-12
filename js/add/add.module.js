angular.module('add', ['addController', 'add'])

.config(function($stateProvider){
	$stateProvider
           
    //add new entry          
    .state('add', {
      url: '/add',
      templateUrl: 'js/add/templates/fillAForm.html',
      controller: 'addEntryController',

    })

})