import {
  AudioConfig,
  SpeechSynthesizer,
  ResultReason,
  SpeakerAudioDestination,
} from "microsoft-cognitiveservices-speech-sdk";
import { getSpeechConfigWithToken, isXML } from "../utils";

let synthesizer;

export default async function (textOrSSML, speaker, speakerStyle) {
  // TODO: xml encode SpeechSynthesizer.buildSsml ssml = SpeechSynthesizer.XMLEncode
  const isSSML = isXML(textOrSSML);

  const speechConfig = await getSpeechConfigWithToken();

  // Create the speech synthesizer.
  const dest = new SpeakerAudioDestination(window[`_current_speaker`]);

  const audioConfig = AudioConfig.fromSpeakerOutput(dest);
  if (!synthesizer) {
    synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
  }

  // TODO: speechConfig.outputFormat
  synthesizer.speakSsmlAsync(
    isSSML
      ? textOrSSML
      : `<speak
        xmlns="http://www.w3.org/2001/10/synthesis"
        xmlns:mstts="http://www.w3.org/2001/mstts"
        xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
        <voice name="${speaker}">
          <mstts:express-as style="${speakerStyle}" >
            <prosody rate="0%" pitch="0%">${textOrSSML}</prosody>
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
    },
    function (err) {
      console.trace("err - " + err);
      synthesizer.close();
      synthesizer = null;
    }
  );

  // Start the synthesizer and wait for a result.
  // synthesisStarted
  // synthesizing
  // synthesisCompleted
  // SynthesisCanceled
  // wordBoundary
  // bookmarkReached
  // visemeReceived
}
