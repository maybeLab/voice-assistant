import "./style.css";

import AzureStt from "./src/stt/azure";
import NativeStt from "./src/stt/native";
import AzureTTS from "./src/tts/azure";
import {
  getSupportedLocales,
  resetStatus,
  writeResult,
  DEFAULT_NATIVE_LANG,
  getAzureSpeakers,
  getAzureSpeakerStyles,
  getAzureGender,
} from "./src/utils";
import Wave from "./src/wave";
import html from "./src/html.js";

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

document.querySelector("#input-text-file").addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    document.querySelector("#azure-textarea").innerText = event.target.result;
  };
  reader.readAsText(e.target.files[0]);
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
    // TODO: combine with DomContentLoaded
    const locales = await getSupportedLocales();
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

document
  .querySelector("#azure-textarea-submit")
  .addEventListener("click", (e) => {
    e.target.disabled = true;
    const text = document.querySelector("#azure-textarea").value?.trim();
    if (text === "") {
      return alert("Please input some content");
    }
    AzureTTS(
      text,
      document.querySelector("#tts-azure-speaker").value,
      document.querySelector("#tts-azure-style").value
    );
    e.target.disabled = false;
  });

document.addEventListener("DOMContentLoaded", async () => {
  // ? for HTTP protocol
  navigator.mediaDevices?.getUserMedia({ audio: true }).catch((err) => {
    if (err.message.includes("Permission denied")) {
      alert(
        "If you are not allowed microphone use, You can't get audio devices list"
      );
    }
  });
  const list = await navigator.mediaDevices.enumerateDevices();
  // TODO: refactor for performance
  list
    .filter((e) => e.kind === "audioinput")
    .forEach((e, i) => {
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
    .forEach((e, i) => {
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

  document
    .querySelector("#tts-azure-speaker")
    .addEventListener("change", (e) => {
      // tts-azure-style
      getAzureSpeakerStyles(e.target.value).then((styles) => {
        document.querySelector("#tts-azure-style").innerHTML = "";
        document.querySelector("#tts-azure-style").disabled = !styles.length;
        if (!styles.length) {
          document
            .querySelector("#tts-azure-style")
            .insertAdjacentHTML(
              "afterbegin",
              "<option>no styles</option>"
            );
          return;
        }
        document.querySelector("#tts-azure-style").insertAdjacentHTML(
          "afterbegin",
          styles.map((style) => `<option value="${style}">${style}</option>`)
        );
      });
    });

  document
    .querySelector("#tts-azure-language")
    .addEventListener("change", (e) => {
      // tts-azure-speaker
      getAzureSpeakers(e.target.value).then((voices) => {
        document.querySelector("#tts-azure-speaker").innerHTML = "";
        document.querySelector("#tts-azure-speaker").insertAdjacentHTML(
          "afterbegin",
          voices.map(
            ({ shortName, localName, gender }) =>
              `<option value="${shortName}">${localName} - ${getAzureGender(
                gender
              )}</option>`
          )
        );
        document
          .querySelector("#tts-azure-speaker")
          .dispatchEvent(new Event("change"));
      });
    });

  const locales = await getSupportedLocales();
  document.querySelector("#tts-azure-language").insertAdjacentHTML(
    "afterbegin",
    locales.map(
      (e) =>
        `<option ${
          e === DEFAULT_NATIVE_LANG ? "selected" : ""
        } value="${e}">${e}</option>`
    )
  );
  // trigger once
  document
    .querySelector("#tts-azure-language")
    .dispatchEvent(new Event("change"));
});
