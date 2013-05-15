var recLength = 0,
    sampleRate = 48000;//should probably be undefined

var fileBufferL = [];
var fileBufferR = [];
var chunkLength = 0;
var fileContentLength = 0;


self.requestFileSystemSync = self.webkitRequestFileSystemSync ||
    self.requestFileSystemSync;

var fs = requestFileSystemSync(PERSISTENT, 1024*1024*1024*20);

//var fileEntry = fs.root.getFile('fileBuffer.wav', {create: true});
//fileEntry.remove();

//this should probably not be local
var fileEntry;
var fw;

this.onmessage = function (e) {
    switch (e.data.command) {
        case 'init':
            init(e.data.config);
            break;
        case 'beginFile':
            beginFile(e.data.filename);
            break;
        case 'record':
            record(e.data.buffer);
            break;
        case 'exportWAV':
            exportWAV(e.data.type);
            break;
        case 'getBuffer':
            getBuffer();
            break;
        case 'clear':
            clear();
            break;
    }
};

function init(config) {
    sampleRate = config.sampleRate;
}

function beginFile(filename){
    fileEntry = fs.root.getFile(filename, {create: true});
    fileEntry.remove();
    fileEntry = fs.root.getFile(filename, {create: true});
    fw = fileEntry.createWriter();
    createWavStart();
}

//may want to parameterize this
function createWavStart(){
    var buffer = new ArrayBuffer(44);
    var view = new DataView(buffer);

     writeString(view, 0, 'RIFF');/* RIFF identifier */

    //may have to write file length at the end
    view.setUint32(4, 32 + 1024*1024 * 1024 * 3, true);/* file length */
    writeString(view, 8, 'WAVE');/* RIFF type */
    writeString(view, 12, 'fmt ');/* format chunk identifier */
    view.setUint32(16, 16, true);/* format chunk length */
    view.setUint16(20, 1, true);/* sample format (raw) */
    view.setUint16(22, 2, true);/* channel count */
    view.setUint32(24, sampleRate, true);/* sample rate */
    view.setUint32(28, sampleRate * 4, true);/* byte rate (sample rate * block align) */
    view.setUint16(32, 4, true);/* block align (channel count * bytes per sample) */
    view.setUint16(34, 16, true);/* bits per sample */
    writeString(view, 36, 'data');/* data chunk identifier */
    view.setUint32(40, 1024*1024*1024*3, true);/* data chunk length */

    var blob = new Blob([view]);
    fw.write(blob);

}

var maxChunkLength = 128;//worked at 64
function record(inputBuffer) {

    fileBufferL.push(inputBuffer[0]);
    fileBufferR.push(inputBuffer[1]);
    chunkLength += inputBuffer[0].length;
    if (chunkLength > maxChunkLength){
        var bufferL = mergeBuffers(fileBufferL, chunkLength);
        var bufferR = mergeBuffers(fileBufferR, chunkLength);
        var chunk = interleave(bufferL, bufferR)

        var buffer = new ArrayBuffer(chunk.length * 2);
        var view = new DataView(buffer);

        convertToPCM(view, chunk);


        var chunkBlob = new Blob([view]);
        var seekLocation = (fw.length >= 44) ? fw.length : 44;
        fw.seek(seekLocation);
        fw.write(chunkBlob);
        //may want to remove this
        fw.seek(0);

        fileContentLength += maxChunkLength;

        fileBufferL = [];
        fileBufferR = [];
        chunkLength = 0;
    }

}

//don't think I need this
function getBuffer() {
    var buffers = [];
    buffers.push(mergeBuffers(recBuffersL, recLength));
    buffers.push(mergeBuffers(recBuffersR, recLength));
    this.postMessage(buffers);
}

function clear() {
    fileBufferL = [];
    fileBufferR = [];
    chunkLength = 0;
    fileContentLength = 0;

    fileEntry = undefined;
    fw = undefined;
}

function mergeBuffers(recBuffers, recLength) {
    var result = new Float32Array(recLength);
    var offset = 0;
    for (var i = 0; i < recBuffers.length; i++) {
        result.set(recBuffers[i], offset);
        offset += recBuffers[i].length;
    }
    return result;
}

function interleave(inputL, inputR) {
    var length = inputL.length + inputR.length;
    var result = new Float32Array(length);

    var index = 0,
      inputIndex = 0;

    while (index < length) {
        result[index++] = inputL[inputIndex];
        result[index++] = inputR[inputIndex];
        inputIndex++;
    }
    return result;
}

function floatTo16BitPCM(output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

function writeString(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

//preallocate ArrayBuffer before calling, becareful about memory leaks.
function convertToPCM(view, input) {
    //view is view of ArrayBuffer(bytes)
    //input is Float32Array
    var offset = 0;
    for (var i = 0; i < input.length; i++, offset += 2) {
        //postMessage(i+": "+offset );
        var s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        //we are taking Float32s and making a Int16 With them
    }
}