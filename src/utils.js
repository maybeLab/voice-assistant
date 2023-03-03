import { SpeechConfig } from "microsoft-cognitiveservices-speech-sdk";

export const getToken = async () => {
  return (await fetch("https://fetoolsout.lz225.com/office/getAzureSpeechToken?region=westus"))
    .json()
    .then((res) => res);
};

export const getSupportedLocales = async () => {
  return (await fetch("https://fetoolsout.lz225.com/office/getLocales?region=westus"))
    .json()
    .then((res) => res);
};

export const getSpeechConfigByToken = async () => {
  const { token, region } = await getToken();
  return SpeechConfig.fromAuthorizationToken(token, region);
};

export const writeResult = (text) => {
  text && document.querySelector("#result").insertAdjacentHTML("beforeend", `<p>${text}</p>`);
};
export const writeError = (text) => {
  text && document
    .querySelector("#result")
    .insertAdjacentHTML("beforeend", `<p style="color:red;">${text}</p>`);
};

export const resetStatus = () => {
  document.querySelector("#mic").disabled = false;
  document.querySelector("#stopMic").disabled = true;
};
