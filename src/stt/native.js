// NativeStt({ type: "file", file: e.target.files[0], isContinuous: 0 });
import { getSpeechConfigByToken, writeResult, writeError, resetStatus } from "../utils";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

export default function ({ type = "file", file, isContinuous }) {
  let isMic = type === "mic";
  const recognition = new SpeechRecognition();
  recognition.continuous = isContinuous;
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    console.log(
      Array.from(event.results[0])
        .map((e) => `transcript:${e.transcript}|confidence:${e.confidence}`)
        .join("\n")
    );
    writeResult("Confidence: " + event.results[0][0].confidence + transcript);
  };
  recognition.onspeechend = function () {
    console.debug("onspeechend");
    // recognition.stop();
  };
  recognition.onerror = function (event) {
    console.error("Error occurred in recognition: " + event.error);
  };

  // Microphone only now
  if (isMic) {
    recognition.start();
    writeResult("Ready to receive a color command.");
  } else {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const audioContext = new AudioContext();
      // Is there a memory leak here?
      
      Promise.all(
        [audioContext.decodeAudioData(reader.result),
        navigator.mediaDevices.getUserMedia({
          audio: true,
        })]
      )
      .then(([audioBuffer, mediaStream]) => {
        console.debug(audioBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        const micSource = audioContext.createMediaStreamSource(mediaStream)
        console.log(micSource,source);
        // source.connect(audioContext.createMediaStreamSource(mediaStream));
        audioContext.createMediaStreamSource(mediaStream).connect(source)
        source.start()
        recognition.start();
      });
    };
  }
}
