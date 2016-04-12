angular.module('one', ['oneController', 'restangular', 'ngFileUpload', 'app'])

.config(function($stateProvider){
	$stateProvider
              
    .state('one', {
      url: '/one/{id:[0-9]+}',
      templateUrl: 'js/one/templates/editAForm.html',
      controller: 'EditController',
    })

})