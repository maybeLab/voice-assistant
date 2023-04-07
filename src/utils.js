import {
  SpeechConfig,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";
import KeyvCache from "keyv-cache";

export const DEFAULT_NATIVE_LANG = "en-US";
export const ONE_MONTH = 30 * 24 * 60 * 60 * 1e3;
export const TEN_MINUTES = 10 * 60 * 1e3;
export const ONE_DAY = 24 * 60 * 60 * 1e3;

const CURRENT_REGION = "westus";
const AZURE_TOKEN_KEY = "AZURE_TOKEN";
const AZURE_LOCALES_KEY = "AZURE_LOCALES";
const AZURE_SPEAKER_PREFIX = "AZURE_SPEAKER_";

export const kvCaches = new KeyvCache({ namespace: "my-app" });

export const transformAzureObject = (object) => {
  if (typeof object !== "object") return object;
  if (Array.isArray(object)) {
    return object.map(transformAzureObject);
  } else {
    return Object.fromEntries(
      Object.entries(object).map(([key, val]) => {
        return [
          key.replace(/priv(\D)/, (_, firstLetter) =>
            firstLetter.toLowerCase(firstLetter)
          ),
          transformAzureObject(val),
        ];
      })
    );
  }
};

export const getToken = async () => {
  const cachedToken = await kvCaches.get(AZURE_TOKEN_KEY);
  if (cachedToken) {
    return cachedToken;
  }
  return (
    await fetch(
      `https://fetoolsout.lz225.com/office/getAzureSpeechToken?region=${CURRENT_REGION}`
    )
  )
    .json()
    .then((res) => {
      kvCaches.set(AZURE_TOKEN_KEY, res.token, TEN_MINUTES);
      return res.token;
    });
};

export const getSupportedLocales = async () => {
  const cachedLocales = await kvCaches.get(AZURE_LOCALES_KEY);
  if (cachedLocales) {
    return cachedLocales;
  }
  return (
    await fetch(
      `https://fetoolsout.lz225.com/office/getLocales?region=${CURRENT_REGION}`
    )
  )
    .json()
    .then((res) => {
      kvCaches.set(AZURE_LOCALES_KEY, res.locales, ONE_MONTH);
      return res.locales;
    });
};

export const getSpeechConfigWithToken = async () => {
  const token = await getToken();
  return SpeechConfig.fromAuthorizationToken(token, CURRENT_REGION);
};

export const writeResult = (text) => {
  text &&
    document
      .querySelector("#result")
      .insertAdjacentHTML("beforeend", `<p>${text}</p>`);
};
export const writeError = (text) => {
  text &&
    document
      .querySelector("#result")
      .insertAdjacentHTML("beforeend", `<p style="color:red;">${text}</p>`);
};

export const resetStatus = () => {
  document.querySelector("#mic").disabled = false;
  document.querySelector("#stopMic").disabled = true;
};

// TODO: this interface can be cache in server side
export const getAzureSpeakers = async (locale) => {
  const cacheKey = AZURE_SPEAKER_PREFIX + locale;
  const cachedVoices = await kvCaches.get(cacheKey);
  if (cachedVoices) {
    return cachedVoices;
  }
  const config = await getSpeechConfigWithToken();
  const { voices } = await new SpeechSynthesizer(config).getVoicesAsync(locale);
  kvCaches.set(cacheKey, transformAzureObject(voices), ONE_DAY);
  return voices;
};

export const getAzureSpeakerStyles = async (speaker) => {
  const locale = document.querySelector("#tts-azure-language").value;
  const cachedVoices = await kvCaches.get(AZURE_SPEAKER_PREFIX + locale);
  const res = cachedVoices.find((e) => e.shortName === speaker);
  return res.styleList;
};

export const getAzureGender = (gender) => {
  switch (gender) {
    case 1:
      return "Female";
    case 2:
      return "Male";
    default:
      return "Unknown";
  }
};
