var message;

// initialise database and tables: Entry and gasStations
var example = angular.module('app', ['ionic', 'restangular', 'angularMoment', 'ionMdInput', 'ngCordova', 'ionic-datepicker',
    'add', 'list', 'one', 'app.controllers', 'app.routes', 'app.services', 'app.directives'])

    .run(function ($ionicPlatform, $cordovaSQLite, dbService) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            var createQuery = "CREATE TABLE IF NOT EXISTS Entry (\
                    entryId integer primary key autoincrement,\
                    totalCost float,\
                    litres float,\
                    pricePerLiter float,\
                    kmStart integer,\
                    kmEnd integer,\
                    tankDate date,\
                    fuelLevelStart float,\
                    fuelLevelEnd float,\
                    gasStation text(20),\
                    comment text(300),\
                    imagePath text(800))";

            var keepGasStations = "CREATE TABLE IF NOT EXISTS GasStations (\
                stationId integer primary key autoincrement,\
                name text(20),\
                foreign key(name) references Entry(gasStation)\
            )";

            var db = null;
            console.log("wohohohoh");
            var dbFunc = function () {
                dbService.handleDb().then(function (result) {
                        db = result;
                        //console.log("database before execute: ", db);
                        $cordovaSQLite.execute(db, createQuery, []).then(function (res) {
                            console.log("Tablica Entries utworzona");
                        }, function (error) {
                            console.log('nie utworzono tablicy entries ', error);
                        });

                        $cordovaSQLite.execute(db, keepGasStations, []).then(function (res) {
                            console.log("Tablica GasStations utworzona");
                        }, function (err) {
                            console.log('nie utworzono tablicy stacji ', err);
                        });

                    })
                    .catch(function (message) {
                        message = message;
                        console.log("meesss: ", message);
                    });

            }();
        });
    });


