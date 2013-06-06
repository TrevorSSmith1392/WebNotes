function PlaybackCtrl ($scope, $routeParams, intermediary){
    $scope.recordingName = $routeParams.recordingName;

    $scope.recordingAnnotations = 's';
    //need to get the js file by that name
    intermediary.requestAnnotations($scope.recordingName);

    $scope.$on('annotationResponse', function () {
         $scope.recordingAnnotations = intermediary.annotationResponse;
    });

    //then need to make the UI somehow
}