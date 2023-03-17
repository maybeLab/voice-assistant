export default `
    <canvas id="waveCanvas"></canvas>
    <fieldset id="micList">
      <legend>Choose your audio input</legend>
    </fieldset>
    <fieldset id="speakerList" disabled>
      <legend>Choose your audio output</legend>
    </fieldset>
    <fieldset>
      <legend>STT</legend>
      <label for="input-file">File: <input type="file" name="" id="input-file" accept=".wav" /></label>
      <fieldset id="sources">
        <legend>Source</legend>
        <label for="language_default0">
          <input type="checkbox" id="language_default0" name="source-languages" value="en-US" checked />en-US
        </label>
        <label for="language_default1">
          <input type="checkbox" id="language_default1" name="source-languages" value="zh-CN" checked />zh-CN
        </label>
          <input type="button" id="more-language" value="More" />
      </fieldset>
      <fieldset>
        <legend>Microphone</legend>
        Ways:
        <label for="continuous"><input id="continuous" type="radio" name="continuous" value="1"/>Continuous</label>
        <label for="once"><input id="once" type="radio" name="continuous" value="0" checked />Once</label>
        <br />
        <input type="submit" value="Start" id="mic" class="primary" />
        <input type="submit" value="End" id="stopMic" disabled class="primary" />
      </fieldset>
    </fieldset>
    <fieldset>
      <legend>STT for Native (Microphone only)</legend>
      <section>
        Ways:
        <label for="native-continuous"><input id="native-continuous" type="radio" name="native-continuous" checked value="1"/>Continuous</label>
        <label for="native-once"><input id="native-once" type="radio" name="native-continuous" value="0" />Once</label>
      </section>
      <section>
        <input type="submit" value="Start" id="native-mic" class="primary" />
        <input type="submit" value="End" id="native-stopMic" disabled class="primary" />
      </section>
    </fieldset>
    <fieldset>
        <legend>TTS</legend>
    </fieldset>
    <div id="result" contenteditable></div>
  `;
