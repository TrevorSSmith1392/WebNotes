angular.module('audionotesfilters', []).filter('asUrl', function() {
    return function(file) {
        return file.toURL();
    };
});

angular.module('audionotes', ['audionotesfilters']);