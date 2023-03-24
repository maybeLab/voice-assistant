import "./style.css";
import AzureStt from "./src/stt/azure";
import NativeStt from "./src/stt/native";
import { getSupportedLocales, resetStatus, writeResult } from "./src/utils";
import Wave from "./src/wave";
import html from "./src/html.jsx";

document.querySelector("#app").innerHTML = html;

window[`_current_mic`] = "default";
window[`_current_speaker`] = "default";

window.onChangeConfig = (type, id) => {
  window[`_current_${type}`] = id;
};

const getSourceLanguages = () => {
  return Array.from(
    document.querySelectorAll("[name=source-languages]:checked")
  ).map((e) => e.value);
};

const getNativeLanguages = () => {
  return document.querySelector("#native-langs").value;
};

document.querySelector("#input-file").addEventListener("change", (e) => {
  writeResult("Uploading...");
  const sourceLanguages = getSourceLanguages();
  AzureStt({
    type: "file",
    file: e.target.files[0],
    isContinuous: 0,
    sourceLanguages,
  });
});

document
  .querySelector("#native-mic")
  .addEventListener("click", async function (e) {
    if (!wave) {
      wave = new Wave(document.querySelector("#waveCanvas"));
    }
    wave.start();
    const sourceLanguages = getNativeLanguages();
    this.disabled = true;
    const isContinuous = parseInt(
      document.querySelector("[name=native-continuous]:checked").value
    );
    const recognizer = await NativeStt({
      type: "mic",
      isContinuous,
      sourceLanguages,
    });
    recognizer.addEventListener("end", () => {
      wave.stop();
    });
    if (!isContinuous) {
    } else {
      document.querySelector("#native-stopMic").addEventListener(
        "click",
        function () {
          recognizer.stop();
        },
        { once: true }
      );
    }
  });

document
  .querySelector("#more-language")
  .addEventListener("click", async function (e) {
    this.disabled = true;
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

let wave;

document.querySelector("#mic").addEventListener("click", async function (e) {
  if (!wave) {
    wave = new Wave(document.querySelector("#waveCanvas"));
  }
  wave.start();
  const sourceLanguages = getSourceLanguages();
  this.disabled = true;
  const isContinuous = parseInt(
    document.querySelector("[name=continuous]:checked").value
  );
  const recognizer = await AzureStt({
    type: "mic",
    isContinuous,
    sourceLanguages,
  });
  if (!isContinuous) {
    recognizer.recognized = () => {
      wave.stop();
    };
  } else {
    document.querySelector("#stopMic").addEventListener(
      "click",
      function () {
        recognizer.stopContinuousRecognitionAsync(resetStatus);
        wave.stop();
      },
      { once: true }
    );
  }
});

document.addEventListener("DOMContentLoaded", async () => {
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
          }" onclick="onChangeConfig('mic','${e.deviceId}')"/>${
            e.label
          }</label>`
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
          }" onclick="onChangeConfig('speaker','${e.deviceId}')"/>${
            e.label
          }</label>`
        );
    });
});
