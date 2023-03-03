import "./style.css";
import stt from "./src/stt";
import { getSupportedLocales, resetStatus } from "./src/utils";

document.querySelector("#app").innerHTML = `
  <fieldset id="micList">
    <legend>Choose your audio input</legend>
  </fieldset>
  <fieldset id="speakerList" disabled>
    <legend>Choose your audio output</legend>
  </fieldset>
  <fieldset>
    <legend>STT</legend>
    <label for="input-file">File: <input type="file" name="" id="input-file" accept=".wav"></label>
    <fieldset id="sources">
      <legend>Source</legend>
      <label for="language_default0">
        <input type="checkbox" id="language_default0" name="source-languages" value="en-US" checked>en-US</input>
      </label>
      <label for="language_default1">
        <input type="checkbox" id="language_default1" name="source-languages" value="zh-CN" checked>zh-CN</input>
      </label>
        <input type="button" id="more-language" value="More" />
    </fieldset>
    <fieldset>
      <legend>Mic</legend>
      Ways: 
      <label for="continuous"><input id="continuous" type="radio" name="continuous" value="1"/>Continuous</label>
      <label for="once"><input id="once" type="radio" name="continuous" value="0" checked />Once</label>
      <br>
      <input type="button" value="Start" id="mic">
      <input type="button" value="End" id="stopMic" disabled>
      
    </fieldset>
  </fieldset>
  <div id="result" contenteditable>  </div>
`;

window[`_current_mic`] = "default";
window[`_current_speaker`] = "default";

window.onChangeConfig = (type, id) => {
  window[`_current_${type}`] = id;
};

const getSourceLanguages = () => {
  return Array.from(document.querySelectorAll("[name=source-languages]:checked")).map(
    (e) => e.value
  );
};

document.querySelector("#input-file").addEventListener("change", (e) => {
  const sourceLanguages = getSourceLanguages();
  stt({ type: "file", file: e.target.files[0], isContinuous: 0, sourceLanguages });
});

document.querySelector("#more-language").addEventListener("click", async function (e) {
  const { locales } = await getSupportedLocales();
  locales
    .filter((e) => !/^(zh-CN|en-US)$/.test(e))
    .map((locale, index) => {
      this.insertAdjacentHTML(
        "beforeBegin",
        `<label for="language_${index}">
        <input type="checkbox" id="language_${index}" name="source-languages" value="${locale}">${locale}</input>
      </label>`
      );
    });
  this.style.display = "none";
});

document.querySelector("#mic").addEventListener("click", async function (e) {
  const sourceLanguages = getSourceLanguages();
  this.disabled = true;
  const recognizer = await stt({
    type: "mic",
    isContinuous: parseInt(document.querySelector("[name=continuous]:checked").value),
    sourceLanguages,
  });
  document.querySelector("#stopMic").addEventListener(
    "click",
    function () {
      recognizer.stopContinuousRecognitionAsync(resetStatus);
    },
    { once: true }
  );
});

document.addEventListener("DOMContentLoaded", async () => {
  // const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  // const video = document.createElement("video");
  // document.body.append(video);
  // video.onloadedmetadata = function () {
  //   video.play();
  // };
  // video.srcObject = stream;
  // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // const audio = document.createElement("audio");
  // audio.controls = true;
  // document.body.append(audio);
  // audio.onloadedmetadata = function () {
  //   audio.play();
  // };
  // audio.srcObject = stream;

  const list = await navigator.mediaDevices.enumerateDevices();
  list
    .filter((e) => e.kind === "audioinput")
    .map((e, i) => {
      document
        .querySelector("#micList")
        .insertAdjacentHTML(
          `beforeend`,
          `<label title="${e.deviceId}" for="mic_${e.deviceId}"><input ${
            i === 0 ? "checked" : ""
          } type="radio" name="audioinput" id="mic_${e.deviceId}" value="${
            e.deviceId
          }" onclick="onChangeConfig('mic','${e.deviceId}')"/>${e.label}</label>`
        );
    });
  list
    .filter((e) => e.kind === "audiooutput")
    .map((e, i) => {
      document
        .querySelector("#speakerList")
        .insertAdjacentHTML(
          `beforeend`,
          `<label title="${e.deviceId}" for="speaker_${e.deviceId}"><input ${
            i === 0 ? "checked" : ""
          } type="radio" name="audiooutput" id="speaker_${e.deviceId}" value="${
            e.deviceId
          }" onclick="onChangeConfig('speaker','${e.deviceId}')"/>${e.label}</label>`
        );
    });
});
