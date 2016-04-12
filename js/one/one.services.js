//zabawa z restangularem
angular.module('one.services', ['restangular'])

.config(function (RestangularProvider) {
	'use strict';

	RestangularProvider.setBaseUrl('http://0.0.0.0:5000');
})

.factory('photoService', function(Restangular) {

	return function(){
		var uploads = Restangular.all('uploads');
		Restangular.all('/test').customPOST({test:'hello1237'}).then(function(response){
			console.log("photo service is working?", response);
		});

	}

})



