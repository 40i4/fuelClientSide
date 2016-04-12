angular.module('addController', [])

    .controller("addEntryController", ['$scope', '$cordovaFileTransfer', 'Upload', 'Restangular', 'dbService',
      '$location', '$cordovaSQLite', '$ionicModal', '$cordovaCamera', '$cordovaFile', '$ionicActionSheet',
      function($scope, $cordovaFileTransfer, Upload, Restangular, dbService, $location, $cordovaSQLite, $ionicModal,
               $cordovaCamera, $cordovaFile, $ionicActionSheet) {

        $scope.newPathImg = [];
        $scope.allGasStations = [];
        $scope.gasStationsToSelect = [];
        $scope.tankDate = new Date();
        $scope.imagesPaths = [];
        $scope.imagesToAdd = [];
        $scope.images = [];
        $scope.allImages = [];
        $scope.backendHost = '<insert correct data here>';
        var name = '';

        $scope.dataToInsert = {
          totalCost:0,
          litres:0,
          pricePerLiter:0,
          fuelLevelStart:100,
          fuelLevelEnd:0,
          imagePath:'',
          kmStart:0,
          kmEnd:0,
          gasStation:'',
          comment:''
        };



        $scope.getElements = dbService.handleDb().then(function (result) {
          var db = result;

          function selectGasStations() {
            var query4 = "select * from GasStations";
            var gasStationMap = [];

            $cordovaSQLite.execute(db, query4, []).then(function(res) {

              console.log("result: ", res);
              console.log("res.rows.length w add.controller: ", res.rows.length);
              for (var i = 0; i < res.rows.length; i++){
                if(res.rows.length > 0) {

                  console.log("res.rows.item(i).name: ", res.rows.item(i).name);
                  //$scope.gasStationsToSelect.push(res.rows[i].name);

                  //don't make duplicates on list
                  if (!gasStationMap[res.rows.item(i).name]) { // if we haven't tanked in this gas station yet
                    gasStationMap[res.rows.item(i).name] = 1;
                    $scope.gasStationsToSelect.push(res.rows.item(i).name);
                  }
                  else {
                    gasStationMap[res.rows.item(i).name]++;
                  }
                }
              }

            }, function(err) {
              console.log('select gas stations error ', err);
            });
          };

          selectGasStations();



          // inserts new gas station into table GasStations
          $scope.addNewGasStation = function(newGasStation) {
            $scope.allGasStations.push(newGasStation);
            $scope.dataToInsert.gasStation = "";

            var query3 = "insert or ignore into GasStations (name) values (?)";
            $cordovaSQLite.execute(db, query3, [newGasStation]).then(function(res) {
              console.log("new gas station added: ", res);
              $scope.allGasStations.push(newGasStation);
              $scope.dataToInsert.gasStation = newGasStation;
            }, function(err) {
              console.log('add new gas stations error ', err);
            });
          };


          $scope.addImage = function() {
            var options = {
              //destinationType: Camera.DestinationType.DATA_URL,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
              allowEdit: false,
              encodingType: Camera.EncodingType.JPEG,
              popoverOptions: CameraPopoverOptions,
              saveToPhotoAlbum: false,
            };

            $cordovaCamera.getPicture(options).then(function(imageData) {
              console.log("imagedatatatatata: ", imageData);
              $scope.images.push(imageData);
              $scope.allImages.push(imageData);
              $scope.newPathImg.push(imageData);
              $scope.imagesToAdd.push(imageData);

              console.log("$scope.images: ", $scope.images);
              console.log("$scope.allImages: ", $scope.allImages);

              $scope.sendFileToServer(imageData);
            });

          };

          $scope.sendFileToServer = function(imageData) {

            var win = function (r) {
              console.log("Code = " + r.responseCode);
              console.log("Response = " + r.response);
              console.log("Sent = " + r.bytesSent);
              console.log("response img_path: ", JSON.parse(r.response).img_path);
              $scope.fileNameToSave = JSON.parse(r.response).img_path;
              console.log("path: ", $scope.backendHost + $scope.fileNameToSave);
              //path = $scope.backendHost + $scope.fileNameToSave;
              $scope.allImages.push($scope.backendHost + $scope.fileNameToSave);
              $scope.images.push($scope.backendHost + $scope.fileNameToSave);
              $scope.newPathImg.push($scope.backendHost + $scope.fileNameToSave);
              $scope.imagesToAdd.push($scope.backendHost + $scope.fileNameToSave);

              console.log("all images yeah: ", $scope.allImages);

            };

            var fail = function (error) {
              alert("An error has occurred: Code = " + error.code);
              console.log("upload error source " + error.source);
              console.log("upload error target " + error.target);
            };
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
            options.mimeType = "text/plain";

            var ft = new FileTransfer();
            ft.upload(imageData,  $scope.backendHost + '/test', win, fail, options);

            console.log("sendfiletoserv");

          };



          $scope.insert = function(dataToInsert, tankDate) {
            $scope.newPathImg = escape(JSON.stringify($scope.imagesToAdd));

            console.log("new path immgg: ", $scope.newPathImg);
            if ($scope.newPathImg == null) {
              console.log("newimgpath is undefined: ", $scope.newPathImg);
              $scope.newPathImg = '';
            }

            var query2 = "insert or ignore into Entry (totalCost, litres, pricePerLiter, tankDate, fuelLevelStart, fuelLevelEnd, kmStart, kmEnd, gasStation, imagePath, comment) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $cordovaSQLite.execute(db, query2, [dataToInsert.totalCost, dataToInsert.litres, dataToInsert.pricePerLiter, tankDate, dataToInsert.fuelLevelStart, dataToInsert.fuelLevelEnd, dataToInsert.kmStart, dataToInsert.kmEnd, dataToInsert.gasStation, $scope.newPathImg, dataToInsert.comment]).then(function (result) {
              if (tankDate) {
                tankDate = moment(tankDate, 'ddd MMM DD YYYY HH:mm:SS').format('YYYY-MM-DD');
              } else {
                tankDate = moment().format('YYYY-MM-DD');
              }

              var id1 = result.insertId;
              console.log("insert\nINSERT: " + dataToInsert.totalCost + " " + dataToInsert.litres + " " + dataToInsert.pricePerLiter + " " + dataToInsert.kmStart + " " + dataToInsert.kmEnd + " " + tankDate + " " + dataToInsert.fuelLevelStart + " " + dataToInsert.fuelLevelEnd + " " + dataToInsert.gasStation + " " + dataToInsert.comment + " " + $scope.newPathImg);
              console.log("entry: " + id1);

              $location.path('/list'); //redirect to first page

            }, function (error) {
              console.log("insert error " + error);
            });
          };


          // goes to zoom view of photo
          $scope.showImages = function(index) {
            $scope.activeSlide = index;
            $scope.showModal('js/add/templates/zoomView.html');
            console.log("imagesToAdd: ", $scope.imagesToAdd);
          };

          $scope.showModal = function(templateUrl) {
            $ionicModal.fromTemplateUrl(templateUrl, {
              scope: $scope
            }).then(function(modal) {
              $scope.modal = modal;
              $scope.modal.show();
            });
          };

          $scope.closeModal = function() {
            $scope.modal.hide();
            $scope.modal.remove();
          };


          //deletes photo from list
          $scope.deletePhoto = function(imageId, entryId) {
            console.log("id of image to be deleted: ", imageId);
            var unescapedNewPath = [];

            console.log("old path: ", $scope.imagesToAdd);
            if($scope.imagesToAdd.length > 0){
              if (imageId > -1) {
                //unescapedNewPath = JSON.parse(unescape($scope.newPathImg));
                //unescapedNewPath.splice(imageId, 1);
                $scope.imagesToAdd.splice(imageId, 1);
                $scope.allImages.splice(imageId, 1);
                $scope.images.splice(imageId, 1);
            }


              console.log("imagesToAdd po usunieciu zdjecia", $scope.imagesToAdd);
              console.log("allImages po usunieciu zdjecia", $scope.allImages);
              console.log("images po usunieciu zdjecia", $scope.images);
            }
          };


          $scope.images = [];


        });

      }

    ])

