var audioContext = new webkitAudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;

//all this needs to be launched from the recordCtrl

function cancelAnalyserUpdates() {
    window.webkitCancelAnimationFrame(rafID);
    rafID = null;
}

function updateAnalysers(time) {
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }

    // analyzer draw code here
    {
        var BAR_WIDTH = 1;
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

        analyserNode.getByteFrequencyData(freqByteData);

        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'round';

        var mag = 0;
        for (var i = 0; i < analyserNode.frequencyBinCount / 2; i++){
            mag += freqByteData[i];
        }
        //mag /= analyserNode.frequencyBinCount;

        mag /= 5;

        var numBlocks = Math.floor(mag/ 15); //block height

        for (var i = 0; i < numBlocks; i++){
            analyserContext.fillStyle = "hsl( " +  (140 - i * 15) + ", 100%, 50%)";
            analyserContext.fillRect(0 , canvasHeight - i * 20, 15, -15);
        }



    }

    rafID = window.webkitRequestAnimationFrame(updateAnalysers);
}

function gotStream(stream) {
    // "inputPoint" is the node to connect your output recording to.
    inputPoint = audioContext.createGainNode();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);


    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 32;
    inputPoint.connect(analyserNode);

    audioRecorder = new Recorder(inputPoint);

    zeroGain = audioContext.createGainNode();
    zeroGain.gain.value = 0.0;
    inputPoint.connect(zeroGain);
    zeroGain.connect(audioContext.destination);

    //hack
    var canvas = document.getElementById("analyser");
    if (canvas) {
        updateAnalysers();
    }

    mediaAuthorized = true;
}

function initAudio() {
    if (!navigator.webkitGetUserMedia)
        return (alert("Error: getUserMedia not supported!"));

    navigator.webkitGetUserMedia({ audio: true }, gotStream, function (e) {
        alert('Error getting audio');
        console.log(e);
    });
}

//window.addEventListener('load', initAudio);