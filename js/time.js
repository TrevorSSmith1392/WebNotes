//should really minimize global variables

var startTime;

var setStartTime = function (){
    startTime = new Date().getTime();
}

var timeDifference;

var calculateTimeDifference = function(){
    timeDifference = ((new Date().getTime()) - startTime) / 1000;
    return timeDifference;
}

var getAnnotationOffset = function (annotationStartTime){
    timeOffset = (annotationStartTime - startTime) / 1000;
    return timeOffset;
}

//this might be dead in a moment
var annotationOffsetTime = function (offsetStart){
    return ((new Date().getTime()) - offsetStart) / 1000;
}


var timeFromNow = function (now, postTime) {
    return (now - postTime) / 1000;
}