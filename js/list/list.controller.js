angular.module('listController', ['ngFileUpload', 'chart.js', 'app'])

    //load entries into list
    .controller("List2Controller", ['$scope', '$state', '$ionicPlatform', '$cordovaSQLite', 'dbService', '$timeout',
        function ($scope, $state, $ionicPlatform, $cordovaSQLite, dbService, $timeout) {

            console.log("lista");

            dbService.handleDb().then(function (result) {
                    var db = result;
                    console.log("dbb: ", db);

                    // loads entry from database
                    $scope.loadEntries = function () {
                        var entries = [];
                        $scope.entries = [];

                        $ionicPlatform.ready(function () {
                            //https://stackoverflow.com/questions/28464389/cordova-sqlite-cannot-read-property-transaction-of-null

                            var query2 = "select * from Entry";
                            $cordovaSQLite.execute(db, query2).then(function (res) {
                                // if there are entries in table
                                if (res.rows.length > 0) {
                                    console.log('res.rows', res.rows);
                                    for (var i = 0; i < res.rows.length; i++) {
                                        var year;

                                        //console.log("rows: ", res.rows.item(i));
                                        // assign correct date format to entry
                                        if (res.rows.item(i).tankDate !== null && moment(res.rows.item(i).tankDate)._f !== 'YYYY-MM-DD') {
                                            year = moment(res.rows.item(i).tankDate, 'ddd MMM DD YYYY HH:mm:SS').format('YYYY-MM-DD');
                                            //console.log("format daty: ", moment(year)._f);
                                        } else if (res.rows.item(i).tankDate === null) {
                                            year = moment().format('YYYY-MM-DD');
                                        }
                                        if (moment(res.rows.item(i).tankDate)._f === 'YYYY-MM-DD') {
                                            year = res.rows.item(i).tankDate;
                                        }

                                        if (moment(res.rows.item(i).tankDate)._f !== 'YYYY-MM-DD') {
                                            // update database, set correct date format
                                            var queryUpdateDate = "update Entry set tankDate=? where entryId=?";
                                            $cordovaSQLite.execute(db, queryUpdateDate, [year, res.rows.item(i).entryId]).then(function (result) {
                                                //console.log("update powiodl sie");
                                            }, function (error) {
                                                console.log("error update: " + error);
                                            });

                                        }

                                        // we push to scope "entries" values associated with each entry
                                        $scope.entries.push({
                                            entryId: res.rows.item(i).entryId,
                                            totalCost: res.rows.item(i).totalCost,
                                            litres: res.rows.item(i).litres,
                                            pricePerLiter: res.rows.item(i).pricePerLiter,
                                            tankDate: year,
                                            fuelLevelStart: res.rows.item(i).fuelLevelStart,
                                            fuelLevelEnd: res.rows.item(i).fuelLevelEnd,
                                            kmStart: res.rows.item(i).kmStart,
                                            kmEnd: res.rows.item(i).kmEnd,
                                            gasStation: res.rows.item(i).gasStation,
                                            comment: res.rows.item(i).comment,
                                            imagePath: res.rows.item(i).imagePath
                                        });
                                        entries.push(res.rows[i]); //push the whole object res.rows[i] to the array "entries"
                                        //console.log("entries push res.rows.item(i): ", res.rows.item(i));
                                    }
                                }
                                else {
                                    console.log("no results found");
                                }

                            }, function (error) {
                                console.log("loadEntries error: ", error);
                            });
                        });


                    };

                $scope.loadEntries();

                    // load entries after every edit or add or delete event
                    //$scope.$on('$stateChangeSuccess', function () {
                    //    loadEntries();
                    //
                    //});


                    //$scope.reloadRoute = function() {
                    //    $route.reload();
                    //};

                    $scope.goToEditView = function (entryId) {
                        $state.go('one', {
                            id: entryId
                        });

                    };




                    // deletes entry from table Entry
                    $scope.deleteEntry = function (item, entries) {
                        var queryDelete = "delete from Entry where entryId = ?";
                        $cordovaSQLite.execute(db, queryDelete, [item.entryId]).then(function (res) {
                            console.log("deleted entry no " + item.entryId);
                        }, function (error) {
                            console.log("delete entry error ", error);
                        });

                        var index = entries.indexOf(item);
                        if (index !== -1) {
                            delete entries[index];
                            $scope.loadEntries();
                        }

                    };



                $scope.deleteGas = function () {
                    var query = "delete from GasStations";
                    console.log("jestem w deletegas");
                    $cordovaSQLite.execute(db, query, []).then(function (res) {
                        console.log("deleted gasstations", res);
                    }, function (error) {
                        console.log("delete gasstations error ", error);
                    });
                };

                }

            );
        }
    ]);




