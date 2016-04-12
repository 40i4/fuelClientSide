angular.module('list', ['listController', 'statsController'])

    .config(function($stateProvider){
        $stateProvider

        //.state('tab', {
        //    url: "/tab",
        //    abstract: true,
        //    templateUrl: "templates/tabs.html"
        //})

            //cache bylo: false
            .state('list', {
                cache: false,
                url: '/list',
                templateUrl: 'js/list/templates/collect.html',
                controller: 'List2Controller'
            })

            .state('stats', {
                cache: false,
                url: '/stats',
                templateUrl: 'js/list/templates/stats.html',
                controller: 'StatsController'
            });

    });
