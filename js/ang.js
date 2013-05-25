var realityIndex = angular.module("RealityIndex", ['editable']);

//get way of communicating figured out
//get way of creating different files figured out
//somehow associate files in display list with both json and everything
//get the keyup directive working for on shift + enter
//figure out relativistic way of making things float upward. $timeout, current time might help

//store json on end recording

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

    return intermediary;
})

realityIndex.directive('ngKeyup', function() {
    return function(scope, elm, attrs) {
        elm.bind("keyup", function(event) {

            //need to show and hide placeholder from here

            //capture escape for toggling off started state
            if (event.which == 27){
                scope.annotationStarted = false;
                scope.annotationField = '';
            }
            //check started state for grabbing time
            else if (!scope.annotationStarted){
                scope.annotationStarted = true;
                scope.currentAnnotationStartTime = new Date().getTime();
            }

            //else check if enter was pressed
            else if (event.which === 13) {
                scope.annotationStarted = false;
                scope.$apply(scope.addAnnotation)
            }

            scope.$apply();
            alert(scope.placeholderOffset);
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

            //testing
            alert(timeDifference);

        } else {
            // start recording
            if (!audioRecorder)
                return;
            $scope.isRecording = true;

            audioRecorder.clear();
            audioRecorder.beginFile($scope.filename + ".wav");

            setStartTime();

            audioRecorder.record();
            $scope.startFileAnnotations();
        }
    }
    $scope.startFileAnnotations = function(){
        $scope.recordingName = $scope.filename + ".json";
    }

    //too many global variables!
    $scope.annotationStarted = false;
    $scope.currentAnnotationStartTime = 0;
    $scope.placeholderOffset = 0;

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

            }

            var placeholderTimeOffset = timeFromNow(now, $scope.currentAnnotationStartTime);
            $scope.placeholderOffset = timeOffset * scrollSpeed;

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