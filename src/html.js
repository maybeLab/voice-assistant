import { langs as nativeLangsMap } from "./stt/native-lang.js";
import { DEFAULT_NATIVE_LANG } from "./utils";

export default `
    <canvas id="waveCanvas"></canvas>
    <fieldset id="micList" class="border px-3 pt-1 pb-3">
      <legend class="px-2">Choose your audio input</legend>
    </fieldset>
    <fieldset id="speakerList" disabled class="border px-3 pt-1 pb-3">
      <legend class="px-2">Choose your audio output</legend>
    </fieldset>
    <fieldset class="border px-3 pt-1 pb-3">
      <legend class="px-2">Speech Recognition by Azure</legend>
      <label for="input-file">File: <input type="file" name="" id="input-file" accept=".wav" /></label>
      <fieldset id="sources">
        <legend class="px-2">Source</legend>
        <label for="language_default0">
          <input type="checkbox" id="language_default0" name="source-languages" value="en-US" checked />en-US
        </label>
        <label for="language_default1">
          <input type="checkbox" id="language_default1" name="source-languages" value="zh-CN" checked />zh-CN
        </label>
          <input type="button" id="more-language" value="More" />
      </fieldset>
      <fieldset class="border px-3 pt-1 pb-3">
        <legend class="px-2">Microphone</legend>
        Ways:
        <label for="continuous"><input id="continuous" type="radio" name="continuous" value="1"/>Continuous</label>
        <label for="once"><input id="once" type="radio" name="continuous" value="0" checked />Once</label>
        <br />
        <input type="submit" value="Start" id="mic" class="primary" />
        <input type="submit" value="End" id="stopMic" disabled class="primary" />
      </fieldset>
    </fieldset>
    <fieldset class="border px-3 pt-1 pb-3">
      <legend class="px-2">Speech Recognition by Native (Microphone only)</legend>
      <section>
        Ways:
        <label for="native-continuous"><input id="native-continuous" type="radio" name="native-continuous" checked value="1"/>Continuous</label>
        <label for="native-once"><input id="native-once" type="radio" name="native-continuous" value="0" />Once</label>
        </section>
        <section>
          Languages:
          <label for="native-langs">
            <select name="native-langs" id="native-langs">
            ${Array.from(nativeLangsMap).map(
              ([code, label]) =>
                `<option ${
                  code === DEFAULT_NATIVE_LANG ? "selected" : ""
                } value="${code}">${label}</option>`
            )}
            </select>
          </label>
        </section>
      <section>
        <input type="submit" value="Start" id="native-mic" class="primary" />
        <input type="submit" value="End" id="native-stopMic" disabled class="primary" />
      </section>
    </fieldset>
    <fieldset class="border px-3 pt-1 pb-3">
      <legend class="px-2">Speech Synthesis by Azure</legend>
      <section class="flex gap-2">
        <div class="flex-auto w-1/3">
          <label for="tts-azure-language">Language</label><br/>
          <select id="tts-azure-language" class="w-full text-ellipsis"></select>
        </div>
        <div class="flex-auto w-1/3">
          <label for="tts-azure-speaker">Speaker</label><br/>
          <select id="tts-azure-speaker" class="w-full text-ellipsis"></select>
        </div>
        <div class="flex-auto w-1/3">
          <label for="tts-azure-style">Style</label><br/>
          <select id="tts-azure-style" class="w-full text-ellipsis"></select>
        </div>
      </section>
      <label for="input-text-file">File: <input type="file" name="" id="input-text-file" accept=".md,.txt,.xml,.ssml" /></label>
      <textarea rows="4" placeholder="Please input text or SSML. Press Enter to Speak" id="azure-textarea" enterkeyhint="send" class="p-2"></textarea>
      <section>
        <input type="submit" value="Submit" id="azure-textarea-submit" class="primary" />
      </section>
    </fieldset>
    <div id="result" contenteditable></div>
  `;
