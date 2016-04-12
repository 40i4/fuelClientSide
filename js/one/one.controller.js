angular.module('oneController', ['oneFilters', 'one.services'])

	.controller('EditController',
		function($scope, $q, Upload, Restangular, $state, $cordovaSQLite, dbService, $stateParams, photoService,
				 $ionicSlideBoxDelegate, $ionicBackdrop, $ionicModal, $ionicScrollDelegate, $cordovaCamera,
				 $cordovaFile, $ionicActionSheet) {

			console.log("jestes w edicie");

			var entryId = $stateParams.id;
			var newPathImg;

			$scope.backendHost = '<insert correct data here';
			$scope.images = [];
			$scope.zoomMin = 1;
			$scope.allGasStations = [];
			$scope.tempImages = [];
			$scope.testingPath = [];
			$scope.trueOrigins = [];
			$scope.fileNameToSave = '';
			//$scope.imagesSuffixes = [];


			//$scope.images = FileService.images();

			dbService.handleDb().then(function (result) {
				var db = result;

				//$ionicPlatform.ready(function() {
				//
				//	//$scope.$apply();
				//});

				// #DB updates imagePath in table Entry after deleting one photo
				$scope.updateDbAfterDelete = function(newImagePath, entryId) {
					console.log("nip w udad: ", newImagePath);
					var queryUpdateEntry = "update Entry set imagePath=? where entryId=?";
					$cordovaSQLite.execute(db, queryUpdateEntry, [newImagePath, entryId]).then(function(result) {
						console.log("recent entry: ", newImagePath);
						console.log("update entry correct");
						//$scope.get();
					}, function(err) {
						console.log("update entry error", err);
					});
				};


				// #DB deletes image path from set of image paths assigned to entry
				$scope.deletePhoto = function(imageId, entryId) {
					var newImagePath = "";

					//var pathToBeDeleted = "";
					console.log("id of image to be deleted: ", imageId);

					var queryLoadAllPhotos = "select imagePath from Entry where entryId = ?";
					$cordovaSQLite.execute(db, queryLoadAllPhotos, [entryId]).then(function(result) {
						console.log("przed usunieciem zdjecia: ", result.rows.item(0).imagePath);

						var entryImagesTab = JSON.parse(unescape(result.rows.item(0).imagePath)); //all images unJSONed

						// update gallery after delete
						if (imageId > -1) {
							entryImagesTab.splice(imageId, 1); //images tab without deleted element
							$scope.allImages.splice(imageId, 1);
							console.log("all images po usunieciu zdjecia", $scope.allImages);
						}

						console.log("newimgpath: ", entryImagesTab);
						newImagePath = escape(JSON.stringify(entryImagesTab)); //change path to json
						console.log("aaaa: ", newImagePath);

						$scope.updateDbAfterDelete(newImagePath, entryId);
					});
				};


				// #CSS goes to zoom view of photo
				$scope.showImages = function(index) {
					$scope.activeSlide = index;
					$scope.showModal('js/one/templates/zoomView.html');
				};

				// #CSS
				$scope.showModal = function(templateUrl) {
					$ionicModal.fromTemplateUrl(templateUrl, {
						scope: $scope
					}).then(function(modal) {
						$scope.modal = modal;
						$scope.modal.show();
					});
				};

				// #CSS
				$scope.closeModal = function() {
					$scope.modal.hide();
					$scope.modal.remove();
				};

				// #CSS for showing photo purposes
				$scope.updateSlideStatus = function(slide) {
					var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
					if (zoomFactor == $scope.zoomMin) {
						$ionicSlideBoxDelegate.enableSlide(true);
					} else {
						$ionicSlideBoxDelegate.enableSlide(false);
					}
				};

				// triggers function $scope.get()
				$scope.goToListView = function() {
					$scope.get();
				};


				// #DB deletes entry from database
				$scope.deleteEntry = function(item) {
					var queryDelete = "delete from Entry where entryId = ?";
					$cordovaSQLite.execute(db, queryDelete, [item.entryId]).then(function(res) {
						console.log("deleted entry no " + item.entryId);
					}, function(error) {
						console.log("delete entry error " + error);
					});

				};


				// #DB loads entry from database, adds values to $scope.entry
				$scope.get = function() {
					$scope.entry = {};
					$scope.imagesPaths = []; //list of all images' paths

					var query = "select * from Entry where entryId = ?";
					$cordovaSQLite.execute(db, query, [entryId]).then(function(res) {
						if(res.rows.length > 0) {
							console.log("entry: ", res);
						}
						else {
							console.log("No results found");
						}


						$scope.entry = {
							entryId: res.rows.item(0).entryId,
							totalCost: res.rows.item(0).totalCost,
							litres: res.rows.item(0).litres,
							pricePerLiter: res.rows.item(0).pricePerLiter,
							tankDate: new Date(res.rows.item(0).tankDate),
							fuelLevelStart: res.rows.item(0).fuelLevelStart,
							fuelLevelEnd: res.rows.item(0).fuelLevelEnd,
							kmStart: res.rows.item(0).kmStart,
							kmEnd: res.rows.item(0).kmEnd,
							gasStation: res.rows.item(0).gasStation,
							comment: res.rows.item(0).comment,
							imagePath: res.rows.item(0).imagePath,
						};
						console.log("imagePath: aaaaa ", $scope.entry.imagePath);

						if (res.rows.item(0).imagePath) {
							$scope.imagesPaths = unescape(res.rows.item(0).imagePath);
							$scope.imagesPaths = JSON.parse($scope.imagesPaths);
						} else {
							console.log("no images in database for this entry");
						}

						//keep all images in scope so we are able to show them in entry view
						var arr;
						var nameOfFile;
						var srcPath;
						$scope.allImages = [];
						console.log("### length of imagesPaths: ", $scope.imagesPaths.length);
						for (var i = 0; i < $scope.imagesPaths.length; i++) {
							srcPath = $scope.imagesPaths[i];
							console.log("srcpath: " + srcPath);
							$scope.allImages.push(srcPath); //form: http://0.0.0.0:5000/static/bcd596073dd24e22949f8d6a904f1bf3_t.jpg
						}
						console.log("all images: " + $scope.allImages);
					}, function(err) {
						console.log('get error ', err);
					});

					// load all gas stations from table GasStations
					var query2 = "select name from GasStations";
					var gasStationMap = [];

					$cordovaSQLite.execute(db, query2, []).then(function(res) {
						//console.log("gasStations: ", res);
						//console.log("res.rows.item(0).name: ", res.rows.item(0).name);
						//don't make duplicates on list
						for (var el = 0; el < res.rows.length; el++) {

							if (!gasStationMap[res.rows.item(el).name]) { // if we haven't tanked in this gas station yet
								gasStationMap[res.rows.item(el).name] = 1;
								$scope.allGasStations.push(res.rows.item(el).name);
							}
							else {
								gasStationMap[res.rows.item(el).name]++;
							}
						}
						//console.log("$scope.allGasStations: ", $scope.allGasStations);
						//console.log("gasstationmap: ", gasStationMap);

					}, function(err) {
						console.log('get gas stations error ', err);
					});
				};

				$scope.get();

				// #DB add gas station to database
				$scope.addNewGasStation = function(newGasStation) {
					console.log("dat iz new gas station: ", newGasStation);
					$scope.allGasStations.push(newGasStation);
					$scope.entry.gasStation = "";

					var query3 = "insert or ignore into GasStations (name) values (?)";
					$cordovaSQLite.execute(db, query3, [newGasStation]).then(function(res) {
						console.log("new gas station added?: ", res);
						$scope.allGasStations.push(newGasStation);
						$scope.entry.gasStation = newGasStation;
					}, function(err) {
						console.log('add new gas stations error ', err);
					});
				};


				$scope.disabled = function() {
					if($scope.addInviteesDisabled) { return false;}
				}

				$scope.addInviteesDisabled = function() {
					return $scope.event.status === form.$invalid || form.$error.min;
				};

				$scope.clearGallery = function() {
					$scope.images = [];
					$scope.trueOrigins = [];
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

						console.log("$scope.images: ", $scope.images);
						console.log("$scope.allImages: ", $scope.allImages);

						$scope.sendFileToServer(imageData);
					});

				};


				$scope.sendFileToServer = function(imageData){

					//var path = '';
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


						//$scope.imagesSuffixes.push($scope.fileNameToSave);

						//console.log("images suffixes: ", $scope.imagesSuffixes);

						//$scope.images.push($scope.fileNameToSave);
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


				//$scope.images : table of paths to images newly added
				//$scope.imagesPaths : table of jsoned paths
				//pathFromDb : jsoned path of image
				//$scope.allImages: table of path to images from database and added, they are shown in gallery
				//update database
				$scope.sendPhoto = function() {

					console.log("$scope.images: ", $scope.images);
					var noOfImages = $scope.images.length;
					console.log("##** noofimages: ", noOfImages);
					console.log("##** noofimagespaths: ", $scope.imagesPaths.length);


					//console.log("$scope.imagePath: ", $scope.imagePath);

					//if there are images in entry
					if ($scope.imagesPaths.length > 0) {
						console.log("$scope.imagesPaths: ", $scope.imagesPaths);
						console.log("$scope.imagesPaths.length: ", $scope.imagesPaths.length);

					} else {
						$scope.imagesPaths = [];

					}
					for (var i = 0; i < $scope.images.length ; i++) {
						$scope.imagesPaths.push($scope.images[i]);

					}
					console.log("BBBB $scope.imagesPaths: ", $scope.imagesPaths);

					$scope.images = [];

					console.log("BBBB $scope.allImages: ", $scope.allImages);

					newPathImg = escape(JSON.stringify($scope.allImages));
					console.log("!!! newpathimg: ", newPathImg);

					console.log("entryId: ", entryId);
					console.log("noOfImages: ", noOfImages);

					if (noOfImages > 0) {
						console.log("sss $scope.images.length: ", $scope.images.length);
						console.log("entryId: ", entryId);
						var query = "update Entry set imagePath=? where entryId=?";
						$cordovaSQLite.execute(db, query, [newPathImg, entryId]).then(function (result) {
							console.log("database updated");
						}, function (err) {
							console.log("database update error ", err);
						});
					}


				};



				// #DB updates entry in database
				// this function doesn't save new image file, because sendPhoto() is doing that
				$scope.edit = function(entry) {
					console.log("jestem w funkcji edit one.controller, czyli nacisnales button >>update entry<<");

					var query = "update Entry set totalCost=?, litres=?, pricePerLiter=?, tankDate=?," +
						"fuelLevelStart = ?, fuelLevelEnd = ?, kmStart=?, kmEnd=?, gasStation=?, comment=?" +
						"where entryId = ?";

					$cordovaSQLite.execute(db, query, [entry.totalCost, entry.litres, entry.pricePerLiter, entry.tankDate, entry.fuelLevelStart, entry.fuelLevelEnd, entry.kmStart, entry.kmEnd, entry.gasStation, entry.comment, entry.entryId]).then(function(result) {
						//console.log("new img path: ", entry.imagePath);
						console.log("gas station: ", entry.gasStation);
						$state.go('list');
					}, function(error) {
						console.log("update entry error " + error);
					});
					//$state.reload();
					$scope.goToListView();
				};


			})});


