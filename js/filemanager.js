
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

function errorHandler(e) {
    var msg = '';
    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR: msg = 'QUOTA_EXCEEDED_ERR'; break;
        case FileError.NOT_FOUND_ERR: msg = 'NOT_FOUND_ERR'; break;
        case FileError.SECURITY_ERR: msg = 'SECURITY_ERR'; break;
        case FileError.INVALID_MODIFICATION_ERR: msg = 'INVALID_MODIFICATION_ERR'; break;
        case FileError.INVALID_STATE_ERR: msg = 'INVALID_STATE_ERR'; break;
        default: msg = 'Unknown Error'; break;
    };
    document.querySelector('#example-list-fs-ul').innerHTML = 'Error: ' + msg;
}


function ListCtrl($scope) {

    $scope.text;
    $scope.files = [];

    //required due to asynch
    $scope.init = function () {

        fs.root.getFile("fileBuffer.wav", {create: true}, null, errorHandler);

        /*
        fs.root.getFile('log.txt', {create: true}, null, errorHandler);
        fs.root.getDirectory('mypictures', {create: true}, null, errorHandler);
        */


        $scope.writeFile = function (file, data, append){

            fs.root.getFile(file, {create: !append }, function(fileEntry) {

                // Create a FileWriter object for our FileEntry (file).
                fileEntry.createWriter(function(fileWriter) {

                    if (append) {
                        fileWriter.seek(fileWriter.length);
                    }

                    fileWriter.onwriteend = function(e) {console.log('Write completed.');};
                    fileWriter.onerror    = function(e) {console.log('Write failed: ' + e.toString());};

                    var blob = new Blob([data]);  /* , {type: 'text/plain'}   */

                    fileWriter.write(blob);

                }, errorHandler);
            }, errorHandler);
        }

        $scope.appendFile = function (file, data){
            $scope.writeFile(file,data,true);
        }

        $scope.readFile = function (fileName) {
            fs.root.getFile(fileName, {}, function(fileEntry) {

                // Get a File object representing the file,
                // then use FileReader to read its contents.
                fileEntry.file(function(file) {
                    var reader = new FileReader();

                    reader.onloadend = function(e) {
                        $scope.text = this.result;
                    };

                    reader.readAsText(file);

                }, errorHandler);

            }, errorHandler);
        }

        $scope.dirReader = fs.root.createReader();
        $scope.readEntries();


    }//end init

    $scope.readFileTempFunction = function (){
        $scope.readFile("fileBuffer.wav");
    }

    $scope.readEntries = function () {

        $scope.dirReader.readEntries(function (entries) {
            if (!entries.length){
                return;
            }
            //call back requires this function to use apply
            for (var i = 0 ; i < entries.length; i++){

                $scope.files.push(entries[i]);
            }
            $scope.$apply(function ($scope) {});

            $scope.readEntries();

        }, errorHandler);
    }
}

window.webkitStorageInfo.requestQuota(PERSISTENT, 1024 * 1024 * 1024 * 20, function (grantedBytes) {

    window.requestFileSystem(PERSISTENT, grantedBytes, function (filesystem) {
        fs = filesystem;
        var scope = angular.element("#fileList").scope();

        scope.init();
    }, errorHandler)
}, function (e) { console.log('Error', e); });

