var realityIndex = angular.module("RealityIndex", ['editable', 'radialMenu']).
    config(function($routeProvider) {
        $routeProvider.
            when('/', { controller: RecordCtrl, templateUrl:'recordUI.html' }).
            when('/:recordingName', { controller: PlaybackCtrl, templateUrl:'playbackUI.html'}).
            otherwise({template:'Page not found'});
    });
//ToDo
    //make way of modifying relative input time
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

            if (attrs.keepOriginal == undefined){
                // load init value from DOM
                ctrl.$setViewValue(elm.html());
            }
        }
    };
});

realityIndex.directive('ngKeyup', function($parse) {
    return function(scope, elm, attrs) {

        var cb = $parse(attrs.ngKeyup)(scope);
        //may want to wrap the callback in $apply
        elm.bind("keyup", cb);
    };
});


realityIndex.factory("intermediary", function ($rootScope) {
    var intermediary = {};

    intermediary.initialized = false;
    intermediary.filesystemInitialized = function () {
        intermediary.initialized = true;
        $rootScope.$broadcast('filesystemInitialized');
    }

    //recording functions
    intermediary.jsonAnnotations = undefined;
    intermediary.shareAnnotations = function (annotations) {
        this.jsonAnnotations = annotations;
        $rootScope.$broadcast('shareJson');
    }

    //playbackFunctions
    intermediary.recordingName = undefined;

    intermediary.requestRecordingInfo = function (recordingName){
        this.recordingName = recordingName;
        $rootScope.$broadcast('requestRecordingInfo');
    }
    intermediary.annotationResponse = undefined;
    intermediary.fileURL = "";
    intermediary.respondWithRecordingInfo = function(annotations, url){
        this.annotationResponse = annotations;
        this.fileURL = url;
        $rootScope.$broadcast('recordingInfoResponse')
    }

    intermediary.refreshFiles = function() {
        $rootScope.$broadcast('refreshFS');
    }


    return intermediary;
})