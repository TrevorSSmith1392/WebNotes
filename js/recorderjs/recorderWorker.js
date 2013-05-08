var recLength = 0,
  recBuffersL = [],
  recBuffersR = [],
  sampleRate;

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

function record(inputBuffer) {
    recBuffersL.push(inputBuffer[0]);
    recBuffersR.push(inputBuffer[1]);
    recLength += inputBuffer[0].length;
}

function exportWAV(type) {
    var bufferL = mergeBuffers(recBuffersL, recLength);
    var bufferR = mergeBuffers(recBuffersR, recLength);
    var interleaved = interleave(bufferL, bufferR);

    /* original
    var dataview = encodeWAV(interleaved);
    var audioBlob = new Blob([dataview], { type: type });
    */

    var buffer = new ArrayBuffer(interleaved.length * 2);
    var view = new DataView(buffer);
    makePCMChunk(view, interleaved);
    var wavStart = startWav(view.byteLength / 2);
    var audioBlob = new Blob([wavStart, view], { type: type });

    this.postMessage(audioBlob);
}

function getBuffer() {
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
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}



//preallocate ArrayBuffer before calling, becareful about memory leaks.
function makePCMChunk(view, input) {
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

function startWav(fileSizeFloat32) {
    var buffer = new ArrayBuffer(44);
    var view = new DataView(buffer);

    writeString(view, 0, 'RIFF');/* RIFF identifier */



    //may have to write file length at the end
    view.setUint32(4, 32 + fileSizeFloat32 * 2, true);/* file length */
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
    view.setUint32(40, fileSizeFloat32 * 2, true);/* data chunk length */
    return view;
}


    /////////////////TESTS
    /*
    
    //number of floats in interleaved audio stream
    var iSize = interleaved.length;

    //an array intended to contain float32s in chunks of 1024
    var chunkArray = new Array(iSize/1024 + 1);//1024 isn't meaningful here

    //this is intended to be how many float32s there are
    var contentChunkSize32Float = 0;

    for (var i = 0; i < chunkArray.length; i++) {

        //float32s
        var source = interleaved.subarray(i * 1024, i * 1024 + 1024);

        //an array buffer which holds bytes
        var buffer = new ArrayBuffer(source.length * 2);
        var view = new DataView(buffer);

        chunkArray[i] = makePCMChunk(view, source);

        //need to keep count of content size chunk
        contentChunkSize32Float += view.byteLength / 2;
    }

    //zero confidence this is the right size
    var wavStart = startWav(contentChunkSize32Float);

    var audioBlob = new Blob([wavStart, chunkArray[0]]);
    for (var i = 1; i < chunkArray.length; i++){
        audioBlob = new Blob([audioBlob, chunkArray[i]], {type:type});
    };
    
    */
    ////////////////////END



    /////////////Half tests   -- working, need to modify length and see what happens

    /*
    var buffer = new ArrayBuffer(interleaved.length * 2);
    var view = new DataView(buffer);

    makePCMChunk(view, interleaved);

    var wavStart = startWav(view.byteLength / 2);

    var audioBlob = new Blob([wavStart, view], { type: type });
    */

    //////////////////////end