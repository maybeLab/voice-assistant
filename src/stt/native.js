// NativeStt({ type: "file", file: e.target.files[0], isContinuous: 0 });
import {
  getSpeechConfigByToken,
  writeResult,
  writeError,
  resetStatus,
} from "../utils";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

export default function ({ type = "file", file, isContinuous }) {
  let isMic = type === "mic";
  const recognition = new SpeechRecognition();
  recognition.continuous = isContinuous;
  recognition.lang = "en-US";
  recognition.lang = "zh-CN";
  recognition.interimResults = true;

  recognition.maxAlternatives = 1;
  recognition.onstart = function (event) {
    document.querySelector("#native-stopMic").disabled = false;
  };
  recognition.onresult = function (event) {
    const lastIndex = event.results.length - 1;
    // const transcript = event.results[0][0].transcript;
    const transcript = Array.from(event.results)
      .map((e) => e[0].transcript)
      .join("");
    console.debug(event.results);
    writeResult(
      `Confidence: 
        ${Math.floor(event.results[lastIndex][0].confidence * 1e4) / 100}%,
        ${transcript}`
    );
  };
  recognition.onspeechend = function () {
    console.debug("onspeechend");
    // recognition.stop();
  };
  recognition.onend = function () {
    console.debug("onend");
    document.querySelector("#native-stopMic").disabled = true
    document.querySelector("#native-mic").disabled = false
    // recognition.stop();
  };
  recognition.onerror = function (event) {
    // event.error === 'no-speech' || 'audio-capture' || 'not-allowed'
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
  return recognition
}
