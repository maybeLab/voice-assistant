import {
  AudioConfig,
  SpeechSynthesizer,
  ResultReason,
  SpeakerAudioDestination,
} from "microsoft-cognitiveservices-speech-sdk";
import getSpeechConfigByToken from "./utils";

export default async function (text, speaker, speakerStyle) {
  const speechConfig = await getSpeechConfigByToken();

  // Create the speech synthesizer.
  const dest = new SpeakerAudioDestination(window[`_current_speaker`]);

  const audioConfig = AudioConfig.fromSpeakerOutput(dest);
  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

  // Start the synthesizer and wait for a result.
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
}
