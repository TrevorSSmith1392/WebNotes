function RecordCtrl($scope, intermediary, $timeout, $window){
    initAudio();

    $scope.annotationKeyDispatch = function(event){

        //this should modify global state less probably

        //should abstract view toggle a bit

        //Escape
        if (event.which == 27){
            $scope.annotationStarted = false;
            $scope.annotationField = '';
            $scope.placeholderVisibility = "hidden";
        }
        //Check started state for grabbing time
        else if (!$scope.annotationStarted){
            $scope.annotationStarted = true;
            $scope.currentAnnotationStartTime = new Date().getTime();
            $scope.placeholderVisibility = "visible";
        }

        //Else check if enter was pressed
        else if (event.which === 13) {
            $scope.annotationStarted = false;
            $scope.placeholderVisibility = "hidden";
            $scope.$apply($scope.addAnnotation)
        }
    }





    $scope.bottom = 120;
    $scope.height = $window.innerHeight - $scope.bottom;
    var scrollSpeed = 30;
    $scope.timeTicks = [];
    $window.onresize = function (e) {
        $scope.height = $window.innerHeight - $scope.bottom;

        $scope.timeTicks = [];
        var backTime = 0;
        for (var i = 0; i <= $scope.height; i+= scrollSpeed){
            var backpx = i;

            //not smart
            if (backTime % 5 === 0){
                $scope.timeTicks.push({px: backpx, timePast: backTime})
            }
            backTime++;
        }
    }


    $scope.recordingName;
    $scope.fileAnnotations = [];
    $scope.shownAnnotations = [];

    $scope.isRecording = false;
    $scope.toggleRecording = function (e) {
        if ($scope.isRecording) {
            // stop recording
            audioRecorder.stop();
            $scope.isRecording = false;

            calculateTimeDifference();

            $scope.writeFileAnnotations();

            intermediary.refreshFiles();
        } else {
            // start recording
            if (!audioRecorder)
                return;
            $scope.isRecording = true;

            audioRecorder.clear();
            audioRecorder.beginFile($scope.filename + ".wav");

            setStartTime();

            audioRecorder.record();

            setTimeout(function() {document.getElementById("notezone").focus()}, 0);
        }
    }
    $scope.writeFileAnnotations = function(){
        //for now, create json file at end of recording. May want to start it at beginning and write during recording

        var annotations = {};
        annotations.recordingName = $scope.filename + ".json";
        annotations.annotationList = $scope.fileAnnotations;

        $scope.fileAnnotations = [];

        intermediary.shareAnnotations(annotations);
    }

    //too many global variables!
    $scope.annotationStarted = false;
    $scope.currentAnnotationStartTime = 0;
    $scope.placeholderOffset = 0;
    $scope.placeholderVisibility = "hidden";

    $scope.addAnnotation = function () {
        var annotation = parseContentFromHtml($scope.annotationField);

        $scope.annotationField = '';

        var difference = getAnnotationOffset($scope.currentAnnotationStartTime);

        $scope.fileAnnotations.push({note: annotation, offset: difference});
        $scope.shownAnnotations.push({note: annotation, postTime: $scope.currentAnnotationStartTime, pixOffset: 0});
    }


    $scope.getTimeOffset = function (postTime) {
        return timeFromNow(postTime);

    }

    //iterate over show notes and update offset number
    $scope.tickShown = function () {
        $timeout(function () {

            var now = new Date().getTime();


            var deleted = 0;
            for (var i = 0; i < $scope.shownAnnotations.length; i++){
                var shown = $scope.shownAnnotations[i];

                //recalculate the offset based on the time

                var timeOffset = timeFromNow(now, shown.postTime);

                //convert to pix offset;
                shown.pixOffset = timeOffset * scrollSpeed;

                //make this responsive
                if(shown.pixOffset > 1500){
                    deleted++;
                    $scope.shownAnnotations[i] = undefined;
                }
            }

            if (deleted > 0){
                $scope.shownAnnotations = $scope.shownAnnotations.filter(function(e){return e !== undefined});
            }

            if ($scope.annotationStarted){
                var placeholderTimeOffset = timeFromNow(now, $scope.currentAnnotationStartTime);
                $scope.placeholderOffset = placeholderTimeOffset * scrollSpeed;
            }

            $scope.tickShown();
        }, 100);
    }
    $scope.tickShown();
}