var startTime;

var setStartTime = function (){
    startTime = new Date().getTime();
}

var timeDifference;

var calculateTimeDifference = function(){
    timeDifference = (new Date().getTime() - startTime) / 1000;
    return timeDifference;
}