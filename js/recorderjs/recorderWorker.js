var recLength = 0,
  recBuffersL = [],
  recBuffersR = [],
  sampleRate;

var bufferTime = 0;


this.onmessage = function (e) {
    switch (e.data.command) {
        case 'init':
            init(e.data.config);
            break;
        case 'record':
            record(e.data.buffer);
            break;
        case 'exportWAV':
            exportWAV(e.data.type);
            break;
        case 'getBuffers':
            getBuffers();
            break;
        case 'clear':
            clear();
            break;
    }
};

function init(config) {
    sampleRate = config.sampleRate;
}

function record(inputBuffer) {
    recBuffersL.push(inputBuffer[0]);
    recBuffersR.push(inputBuffer[1]);
    recLength += inputBuffer[0].length;
    bufferTime++;
}

function exportWAV(type) {
    var bufferL = mergeBuffers(recBuffersL, recLength);
    var bufferR = mergeBuffers(recBuffersR, recLength);
    var interleaved = interleave(bufferL, bufferR);

    
    
    /////////////////TESTS
    /*
    var wavStart = startWav();

    //number of floats in interleaved audio stream
    var iSize = interleaved.length;

    
    var chunkArray = new Array(iSize / 1024);


    for (var i = 0; i < chunkArray.length; i++) {

        var buffer = new ArrayBuffer(1024 * 32);
        var view = new DataView(buffer);

        var source = interleaved.subarray(i*1024, i * 1024 + 1024);

        chunkArray[i] = makePCMChunk(view, source);
    }


    var audioBlob = new Blob([wavStart, chunkArray[0]]);
    for (var i = 1; i < chunkArray.length; i++){
        audioBlob = new Blob([audioBlob, chunkArray[i]], {type:type});
    };
    */
    ////////////////////END

    var dataview = encodeWAV(interleaved);
    var audioBlob = new Blob([dataview], { type: type });


    /////////////Half tests
    /*

    var buffer = new ArrayBuffer(interleaved.length * 2);
    var view = new DataView(buffer);

    floatTo16BitPCM(view, 0, interleaved);

    var audioBlob = new Blob([startWav, view], { type: type });

    */
    //////////////////////end



    this.postMessage(audioBlob);
}

function getBuffers() {
    var buffers = [];
    buffers.push(mergeBuffers(recBuffersL, recLength));
    buffers.push(mergeBuffers(recBuffersR, recLength));
    this.postMessage(buffers);
}

function clear() {
    recLength = 0;
    recBuffersL = [];
    recBuffersR = [];
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

//preallocate ArrayBuffer before calling, becareful about memory leaks.
function makePCMChunk(view, input) {
    var offset = 0;
    for (var i = 0; i < input.length; i++, offset += 2) {
        //postMessage(i+": "+offset );
        var s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}


function writeString(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function encodeWAV(samples) {
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 32 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 2, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 4, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, 32, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}

function startWav() {
    var buffer = new ArrayBuffer(44);
    var view = new DataView(buffer);
    
    writeString(view, 0, 'RIFF');/* RIFF identifier */



    //may have to write file length at the end
    view.setUint32(4, 9999, true);/* file length */
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
    view.setUint32(40, 32, true);/* data chunk length */
    return view;
}