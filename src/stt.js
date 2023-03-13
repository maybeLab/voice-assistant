import {
  AudioConfig,
  SpeechRecognizer,
  AutoDetectSourceLanguageConfig,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";
import { getSpeechConfigByToken, writeResult, writeError, resetStatus } from "./utils";

export default async function ({ type = "file", file, isContinuous, sourceLanguages }) {
  let isMic = type === "mic";
  const speechConfig = await getSpeechConfigByToken();

  // We are done with the setup
  console.log("Now recognizing from: " + type, sourceLanguages);

  let audioConfig;

  if (isMic) {
    audioConfig = AudioConfig.fromMicrophoneInput(window[`_current_mic`]);
  } else {
    audioConfig = AudioConfig.fromWavFileInput(file);
  }

  // Create the speech recognizer.
  // let recognizer = new SpeechRecognizer(speechConfig, audioConfig);
  let recognizer = SpeechRecognizer.FromConfig(
    speechConfig,
    AutoDetectSourceLanguageConfig.fromLanguages(sourceLanguages),
    audioConfig
  );
  // Start the recognizer and wait for a result.
  // 启动语音识别，并在识别第一个言语后停止。 该任务返回作为结果的识别文本。
  // 注意：识别第一个言语后，RecognizeOnceAsync () 将返回 ，因此它仅适用于单次识别，如命令或查询。
  // 对于长时间运行的识别，请改用 StartContinuousRecognitionAsync () 。
  if (isContinuous) {
    document.querySelector("#stopMic").disabled = false;
    recognizer.sessionStarted = console.debug.bind(this, "sessionStarted");
    recognizer.speechStartDetected = console.debug.bind(this, "speechStartDetected");

    recognizer.recognizing = console.debug.bind(this, "recognizing");
    recognizer.recognized = (_, event) => {
      console.debug("recognized", _, event);
      if (event.result.reason !== ResultReason.NoMatch) {
        writeResult(event.result.text);
      }
    };
    recognizer.speechEndDetected = console.debug.bind(this, "speechEndDetected");
    recognizer.sessionStopped = console.debug.bind(this, "sessionStopped");

    recognizer.canceled = console.debug.bind(this, "canceled");

    recognizer.startContinuousRecognitionAsync();
  } else {
    recognizer.recognizeOnceAsync(
      function (result) {
        console.debug(result);
        recognizer.close();
        recognizer = undefined;
        writeResult(result.text);
        resetStatus();
      },
      function (err) {
        console.trace("err - " + err);

        recognizer.close();
        recognizer = undefined;
        writeError(err);
        resetStatus();
      }
    );
  }
  return recognizer;
}
