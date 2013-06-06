var realityIndex = angular.module("RealityIndex", ['editable']).
    config(function($routeProvider) {
        $routeProvider.
            when('/', { controller: RecordCtrl, templateUrl:'recordUI.html' }).
            when('/:recordingName', { controller: PlaybackCtrl, templateUrl:'playbackUI.html'}).
            otherwise({redirectTo:'/'})
    });
//make way of modifying relative input time

//need to
//somehow associate files in display list with both json and everything

//need extract and interface (multiple views)

//interface meaning retrieval
//should be some way of having a time based, and list based view


//export

//multiple users on same stream (figure out logistics for sharing)

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

    //recording functions
    intermediary.jsonAnnotations = undefined;
    intermediary.shareAnnotations = function (annotations) {
        this.jsonAnnotations = annotations;
        $rootScope.$broadcast('shareJson');
    }

    //playbackFunctions
    intermediary.recordingName = undefined;
    intermediary.requestAnnotations = function (recordingName){
        this.recordingName = recordingName;
        $rootScope.$broadcast('requestAnnotations');
    }
    intermediary.annotationResponse = undefined;
    intermediary.respondWithAnnotations = function(annotations){
        this.annotationResponse = annotations;
        $rootScope.$broadcast('annotationResponse')
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