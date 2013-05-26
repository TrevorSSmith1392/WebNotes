var realityIndex = angular.module("RealityIndex", ['editable']);


//need to
//somehow associate files in display list with both json and everything

//need extract and interface (multiple views)

//export

angular.module('editable', []).directive('contenteditable', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            // view -> model
            elm.bind('input', function() {
                scope.$apply(function() {
                    ctrl.$setViewValue(elm.html());
                });
            });

            // model -> view
            ctrl.$render = function() {
                elm.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$setViewValue(elm.html());
        }
    };
});


realityIndex.factory("intermediary", function ($rootScope) {
    var intermediary = {};

    intermediary.jsonAnnotations = undefined;

    intermediary.shareAnnotations = function (annotations) {
        this.jsonAnnotations = annotations;
        this.broadcastJson();
    }

    intermediary.broadcastJson = function () {
        $rootScope.$broadcast('shareJson');
    }

    return intermediary;
})

realityIndex.directive('ngKeyup', function() {
    return function(scope, elm, attrs) {
        elm.bind("keyup", function(event) {

            //should abstract view toggle a bit

            //capture escape for toggling off started state
            if (event.which == 27){
                scope.annotationStarted = false;
                scope.annotationField = '';
                scope.placeholderVisibility = "hidden";
            }
            //check started state for grabbing time
            else if (!scope.annotationStarted){
                scope.annotationStarted = true;
                scope.currentAnnotationStartTime = new Date().getTime();
                scope.placeholderVisibility = "visible";
            }

            //else check if enter was pressed
            else if (event.which === 13) {
                scope.annotationStarted = false;
                scope.placeholderVisibility = "hidden";
                scope.$apply(scope.addAnnotation)
            }
        });
    };
});

function UICtrl($scope, intermediary, $timeout){

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
        } else {
            // start recording
            if (!audioRecorder)
                return;
            $scope.isRecording = true;

            audioRecorder.clear();
            audioRecorder.beginFile($scope.filename + ".wav");

            setStartTime();

            audioRecorder.record();

            setTimeout(function() {document.getElementById("notezone").focus()}, 250);
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

        var annotation = $scope.annotationField.slice(0, -15);
        $scope.annotationField = '';

        var difference = calculateTimeDifference();



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
            var scrollSpeed = 30;

            for (var i = 0; i < $scope.shownAnnotations.length; i++){
                var shown = $scope.shownAnnotations[i];

                //recalculate the offset based on the time

                var timeOffset = timeFromNow(now, shown.postTime);

                //convert to pix offset;
                shown.pixOffset = timeOffset * scrollSpeed;

                //make this responsive
                if(shown.pixOffset > 1500){
                    $scope.shownAnnotations[i] = undefined;
                }
            }

            $scope.shownAnnotations = $scope.shownAnnotations.filter(function(e){return e !== undefined});

            if ($scope.annotationStarted){
                var placeholderTimeOffset = timeFromNow(now, $scope.currentAnnotationStartTime);
                $scope.placeholderOffset = placeholderTimeOffset * scrollSpeed;
            }

            $scope.tickShown();
        }, 100);
    }
    $scope.tickShown();

    /*
    $scope.onfilecreated("something", function (filename) {
        $scope.fileAnnotations[filename + ".json"] = {};
    }

    $scope.onrequestinfo(){
        return $scope.fileAnnotations{filerequested}
    }


     */

}