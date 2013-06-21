realityIndex.directive('loadmetadata', function(){
    //all this should be called after ng-src updates the src, which
    //happens after the filemanager returns the recording info in $on('recordingInfoResponse')
    return {
        restrict: 'A',
        link: function(scope, element, attrs, ctrl){
            element.bind('loadedmetadata', function(){
                //only do this if ng-src has triggered
                if(attrs.src){
                    scope.audio = document.getElementById('playbackAudio');
                    scope.duration = scope.audio.duration;
                    scope.$apply(scope.layoutAnnotations());
                }
            })
        }
    }
})

function PlaybackCtrl ($scope, $routeParams, intermediary, $timeout, $window){
    $scope.recordingName = $routeParams.recordingName;

    $scope.recordingAnnotations = '';
    $scope.clientWidth =  document.getElementById('playbackTimeline').clientWidth;

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
        //this all could be simplified using timeout recursively
        $scope.$apply($scope.layoutPlayback);
    });

    $scope.layoutPlayback = function () {
        //this triggers the event that calls the final layout code, layoutAnnotations();
        $scope.fileURL = intermediary.fileURL;
        $scope.recordingAnnotations = intermediary.annotationResponse;
        //audio.currentTime
    };

    $scope.baseTop = $window.innerHeight * .47;
    $scope.layoutAnnotations = function () {
        var levels = [-75,50,-25,75,-50,25];
        var currentLevel = 0;

        var AddLayoutData = function(levelIndex){
            var timeProportion = this.offset / $scope.audio.duration;
            this.position = timeProportion * $scope.clientWidth;
            this.level = levels[levelIndex];
        }
        for (var i = 0; i < $scope.recordingAnnotations.length; i++){
            //why
            AddLayoutData.apply($scope.recordingAnnotations[i], [currentLevel]);

            if (++currentLevel == levels.length){
                currentLevel = 0;
            }
        }
    }

    $window.onresize = function (e) {
        $scope.$apply($scope.baseTop = $window.innerHeight * .47);
    }
}