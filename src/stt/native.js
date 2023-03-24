import {
  getSpeechConfigByToken,
  writeResult,
  writeError,
  resetStatus,
} from "../utils";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function ({ type = "file", isContinuous, sourceLanguages }) {
  let isMic = type === "mic";
  const recognition = new SpeechRecognition();
  recognition.continuous = isContinuous;
  recognition.lang = sourceLanguages;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = function (event) {
    document.querySelector("#native-stopMic").disabled = false;
  };
  recognition.onresult = function (event) {
    const lastIndex = event.results.length - 1;
    const transcript = event.results[lastIndex][0].transcript;
    console.debug(event.results);
    writeResult(
      `C: 
        ${Math.floor(event.results[lastIndex][0].confidence * 1e4) / 100}%,
        ${
          event.results[lastIndex]?.isFinal
            ? `<span style="color:green;">${transcript}</span>`
            : transcript
        }`
    );
  };
  recognition.onspeechend = function () {
    console.debug("onspeechend");
  };
  recognition.onend = function () {
    console.debug("onend");
    document.querySelector("#native-stopMic").disabled = true;
    document.querySelector("#native-mic").disabled = false;
  };
  recognition.onerror = function (event) {
    // event.error === 'no-speech' || 'audio-capture' || 'not-allowed' ||
    // 'service-not-allowed' safari not support zh-yue
    // solution: https://support.google.com/chrome/bin/answer.py?hl=en&answer=1407892
    console.error("Error occurred in recognition: " + event.error);
  };

  // Microphone only now
  if (isMic) {
    recognition.start();
    writeResult("Ready to receive some speech.");
  } else {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const audioContext = new AudioContext();
      // Is there a memory leak here?

      Promise.all([
        audioContext.decodeAudioData(reader.result),
        navigator.mediaDevices.getUserMedia({
          audio: true,
        }),
      ]).then(([audioBuffer, mediaStream]) => {
        console.debug(audioBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        const micSource = audioContext.createMediaStreamSource(mediaStream);
        console.log(micSource, source);
        // source.connect(audioContext.createMediaStreamSource(mediaStream));
        audioContext.createMediaStreamSource(mediaStream).connect(source);
        source.start();
        recognition.start();
      });
    };
  }
  return recognition;
}
