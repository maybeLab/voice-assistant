export default class MicWave {
  drawStatus = false;
  canvasWidth = 0;
  canvasHeight = 0;
  audioTracks = null;
  constructor(canvasDOM) {
    this.canvasDOM = canvasDOM;
    this.canvasWidth = canvasDOM.getBoundingClientRect().width;
    this.canvasHeight = canvasDOM.getBoundingClientRect().height;
    canvasDOM.width = this.canvasWidth;
    canvasDOM.height = this.canvasHeight;
    this.canvasCtx = canvasDOM.getContext("2d");
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = Math.pow(2, Math.round(Math.log(this.canvasWidth) / Math.log(2)));
  }
  async start() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    // Is there a memory leak here?
    this.audioCtx.createMediaStreamSource(stream).connect(this.analyser);
    // analyser.connect(this.audioCtx.destination);
    this.audioTracks = stream.getAudioTracks()[0];
    this.drawStatus = true;
    this.draw();
  }
  stop() {
    this.drawStatus = false;
    this.audioTracks.stop();
    this.clearCanvas();
  }
  clearCanvas() {
    this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }
  getAnalyseData() {
    let dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    // 将数据拷贝到dataArray中。
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }
  draw() {
    const dataArray = this.getAnalyseData();
    const bufferLength = dataArray.length;
    const ctx = this.canvasCtx;
    this.clearCanvas();
    // 设定波形绘制颜色
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(116, 123, 255, 0.4)";
    ctx.beginPath();
    const sliceWidth = this.canvasWidth / bufferLength; // 一个点占多少位置，共有bufferLength个点要绘制
    let x = 0; // 绘制点的x轴位置
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128;
      const y = (v * this.canvasHeight) / 2;
      if (i === 0) {
        // 第一个点
        ctx.moveTo(x, y);
      } else {
        // 剩余的点
        ctx.lineTo(x, y);
      }
      // 依次平移，绘制所有点
      x += sliceWidth;
    }
    ctx.lineTo(this.canvasWidth, this.canvasHeight / 2);
    ctx.stroke();
    if (this.drawStatus) {
      window.requestAnimationFrame(this.draw.bind(this));
    } else {
      this.clearCanvas();
    }
  }
}
