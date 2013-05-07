window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
var fs = null;

function errorHandler(e) {
    var msg = '';
    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR: msg = 'QUOTA_EXCEEDED_ERR'; break;
        case FileError.NOT_FOUND_ERR:      msg = 'NOT_FOUND_ERR'; break;
        case FileError.SECURITY_ERR:       msg = 'SECURITY_ERR. Remember that this does not work out of file://'; break;
        case FileError.INVALID_MODIFICATION_ERR: msg = 'INVALID_MODIFICATION_ERR'; break;
        case FileError.INVALID_STATE_ERR:  msg = 'INVALID_STATE_ERR'; break;
        default: msg = 'Unknown Error'; break;
    };
    console.log(msg);
}

function initFS() {

    window.webkitStorageInfo.requestQuota(PERSISTENT, 1024 * 1024 * 1024 * 20, function (grantedBytes) {

        window.requestFileSystem(PERSISTENT, grantedBytes, function (filesystem) {
            fs = filesystem;
        }, errorHandler);

    }, function (e) { console.log('Error', e); });
}


// Initiate filesystem on page load.
if (window.requestFileSystem) { initFS(); }

//API Simplification Functions
function createFile(file, data, append){

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

function appendToFile(file, data) {
    writeFile(file, data, true);
};