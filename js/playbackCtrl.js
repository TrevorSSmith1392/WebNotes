function PlaybackCtrl ($scope, $routeParams, intermediary, $timeout){
    $scope.recordingName = $routeParams.recordingName;

    $scope.recordingAnnotations = '';
    //need to get the js file by that name


    //wait for file system to be initialized before requesting annotations
    //*hacky
    if (intermediary.initialized){
        intermediary.requestAnnotations($scope.recordingName);
    }
    else{
        $scope.$on('filesystemInitialized', function () {
            intermediary.requestAnnotations($scope.recordingName);
        })
    }
    //*/

    $scope.$on('annotationResponse', function () {

        //for some reason apply needs to be called. I don't know why the $on function isn't in angular
        //accordingly, this all could be simplified using timeout recursively
         $scope.$apply($scope.recordingAnnotations = intermediary.annotationResponse);
    });

    //then need to make the UI somehow
}