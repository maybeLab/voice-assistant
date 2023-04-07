import {
  AudioConfig,
  SpeechSynthesizer,
  ResultReason,
  SpeakerAudioDestination,
} from "microsoft-cognitiveservices-speech-sdk";
import { getSpeechConfigWithToken } from "../utils";

export default async function (text, speaker, speakerStyle) {
  // TODO: xml encode SpeechSynthesizer.buildSsml ssml = SpeechSynthesizer.XMLEncode 
  const isSSML = false;

  const speechConfig = await getSpeechConfigWithToken();

  // Create the speech synthesizer.
  const dest = new SpeakerAudioDestination(window[`_current_speaker`]);

  const audioConfig = AudioConfig.fromSpeakerOutput(dest);
  let synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

  // TODO: speechConfig.outputFormat
  if (isSSML) {
    synthesizer.speakSsmlAsync(
      `<speak
        xmlns="http://www.w3.org/2001/10/synthesis"
        xmlns:mstts="http://www.w3.org/2001/mstts"
        xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
        <voice name="${speaker}">
          <mstts:express-as style="${speakerStyle}" >
            <prosody rate="0%" pitch="0%">${text}</prosody>
          </mstts:express-as>
        </voice>
      </speak>`,
      function (result) {
        // SynthesizingAudio
        // SynthesizingAudioCompleted
        // SynthesizingAudioStarted
        if (result.reason === ResultReason.SynthesizingAudioCompleted) {
          console.log("synthesis finished.");
        } else {
          console.error(
            "Speech synthesis canceled, " +
              result.errorDetails +
              "\nDid you set the speech resource key and region values?"
          );
        }
        synthesizer.close();
        synthesizer = null;
      },
      function (err) {
        console.trace("err - " + err);
        synthesizer.close();
        synthesizer = null;
      }
    );
  } else {
    speechConfig.speechSynthesisVoiceName;
    speechConfig.speechSynthesisLanguage;
    synthesizer.speakTextAsync(text);
  }

  // Start the synthesizer and wait for a result.
  // synthesisStarted
  // synthesizing
  // synthesisCompleted
  // SynthesisCanceled
  // wordBoundary
  // bookmarkReached
  // visemeReceived
}
