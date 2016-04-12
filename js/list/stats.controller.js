angular.module('statsController', ['chart.js', 'app'])

    .controller("StatsController", ['$scope', '$cordovaSQLite', 'dbService', '$timeout',
        function ($scope, $cordovaSQLite, dbService, $timeout) {

            console.log("statsss");

            dbService.handleDb().then(function (result) {
                    var db = result;

                    $scope.$on('$ionicView.beforeEnter', function () {
                    });

                    $scope.onClick = function (points, evt) {
                        console.log(points, evt);
                    };

                   // $scope.$on('$stateChangeSuccess', function () {

                        $scope.series2 = [], $scope.data2 = [], $scope.labels2 = [];
                        $scope.series3 = [], $scope.data3 = [], $scope.labels3 = [];
                        $scope.series4 = [], $scope.data4 = [], $scope.labels4 = [];
                        $scope.series5 = [], $scope.data5 = [], $scope.labels5 = [];
                        $scope.localArrayLabels = [];
                        $scope.localArrayData = [];
                        $scope.localArrayData2 = [];
                        var tabPricePerLiter = [];
                        var tabDate = [];

                        var query = "select * from Entry";
                        $cordovaSQLite.execute(db, query).then(function (res) {
                            console.log("stats");

                            /**
                             * PRICE PER LITER CHART
                             */
                            for (var i = 0; i < res.rows.length; i++) {
                                //change display date format
                                var datee = moment(res.rows.item(i).tankDate, 'YYYY-MM-DD').format('MM-DD');

                                if (res.rows.item(i).pricePerLiter != 0 && !!res.rows.item(i).pricePerLiter) {
                                    tabPricePerLiter.push(res.rows.item(i).pricePerLiter);
                                    tabDate.push(datee);
                                }
                            }

                            // sort by date ascending
                            var zipped = [];
                            for (i = 0; i < tabPricePerLiter.length; i++) {
                                zipped.push({
                                    array1elem: tabDate[i],
                                    array2elem: tabPricePerLiter[i]
                                });
                            }

                            zipped.sort(function (left, right) {
                                var leftArray1elem = left.array1elem,
                                    rightArray1elem = right.array1elem;

                                return leftArray1elem === rightArray1elem ? 0 : (leftArray1elem < rightArray1elem ? -1 : 1);
                            });

                            for (i = 0; i < zipped.length; i++) {
                                $scope.localArrayLabels.push(zipped[i].array1elem);
                                $scope.localArrayData.push(zipped[i].array2elem);
                            }


                            //data (x axis) must be an array of array(-s)
                            $scope.localArrayData2.push($scope.localArrayData);

                            //console.log("$scope.localArrayData2: ", $scope.localArrayData2);
                            //console.log("$scope.localArrayLabels: ", $scope.localArrayLabels);


                            /**
                             * DOUGHNUT CHART
                             */

                            var localArrayData = [];
                            var localArrayLabels = [];
                            var gasStationMap = [];
                            gasStationMap["other"] = 0;

                            for (i = 0; i < res.rows.length; i++) {
                                if (res.rows.item(i).gasStation !== "") { //if gas station name exists in entry
                                    if (!gasStationMap[res.rows.item(i).gasStation]) { // if we haven't tanked in this gas station yet
                                        gasStationMap[res.rows.item(i).gasStation] = 1;
                                    }
                                    else {
                                        gasStationMap[res.rows.item(i).gasStation]++;
                                    }
                                } else { // if user didn't write gas station name
                                    gasStationMap["other"]++;
                                }
                            }


                            for (var key in gasStationMap) {
                                localArrayData.push(gasStationMap[key]);
                                localArrayLabels.push(key);
                            }
                            //console.log("no. of tanks: ", localArrayData);
                            //console.log("gas stations: ", localArrayLabels);

                            $scope.data3 = localArrayData;
                            $scope.labels3 = localArrayLabels;

                            /**
                             * DISTANCE CHART
                             */

                            localArrayData = [];
                            localArrayLabels = [];
                            var diff = 0;

                            for (i = 0; i < res.rows.length; i++) {
                                diff = res.rows.item(i).kmEnd - res.rows.item(i).kmStart;
                                localArrayData.push(diff);
                                localArrayLabels.push(i);
                                //console.log(localArrayData)
                            }
                            $scope.labels4 = localArrayLabels;
                            $scope.data4.push(localArrayData);


                            /**
                             * LITRES PER KM
                             */
                            localArrayData = [];
                            localArrayLabels = [];
                            var kmPerLiter;
                            var gasSt = "";

                            for (i = 0; i < res.rows.length; i++) {
                                kmPerLiter = (res.rows.item(i).kmEnd - res.rows.item(i).kmStart) / res.rows.item(i).litres;
                                gasSt = res.rows.item(i).gasStation;
                                if (kmPerLiter) {
                                    kmPerLiter = kmPerLiter.toFixed(2);
                                    localArrayData.push(kmPerLiter);
                                } else {
                                    localArrayData.push(0);
                                }

                                if (gasSt) {
                                    localArrayLabels.push(gasSt);
                                } else {
                                    localArrayLabels.push("other");
                                }

                            }

                            //console.log("localArrayData ", localArrayData);
                            //console.log("localArrayLabels ", localArrayLabels);
                            $scope.labels5 = localArrayLabels;
                            $scope.data5.push(localArrayData);

                        });
                   // });
                }
            );

            //$timeout(function(){
            //    $scope.$apply();
            //},0);

        }]);
