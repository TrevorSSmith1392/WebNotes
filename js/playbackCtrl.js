function PlaybackCtrl ($scope, $routeParams, intermediary, $timeout){
    $scope.recordingName = $routeParams.recordingName;

    $scope.recordingAnnotations = '';
    //need to get the js file by that name


    //wait for file system to be initialized before requesting annotations
    //*hacky
    if (intermediary.initialized){
        intermediary.requestRecordingInfo($scope.recordingName);
    }
    else{
        $scope.$on('filesystemInitialized', function () {
            intermediary.requestRecordingInfo($scope.recordingName);
        })
    }
    //*/
    $scope.$on('recordingInfoResponse', function () {

        //for some reason apply needs to be called. I don't know why the $on function isn't in angular
        //accordingly, this all could be simplified using timeout recursively
        $scope.fileURL = intermediary.fileURL;
        $scope.recordingAnnotations = intermediary.annotationResponse;
        $scope.$apply($scope.layoutPlayback);
    });

    $scope.layoutPlayback = function () {
        $scope.audio = document.getElementById('playbackAudio');
        $scope.duration = $scope.audio.duration;


        //audio.duration
        //audio.currentTime
        //audio.play()
        //audio.pause()

    };

    //then need to make the UI somehow
}