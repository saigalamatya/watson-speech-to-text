import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { WatsonService } from './services/watson.service';
import { io } from 'socket.io-client';
import * as recognizeMicrophone from 'watson-speech/speech-to-text/recognize-microphone';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-watson-client';

  isStreaming: boolean;
  stream: any;
  text: string;
  socket;
  results = [];
  mediaRecorder: MediaRecorder;
  url = '../../src/app/audio/sample.wav';
  audioContext;
  analyser;
  file;
  transcriptLabel = 'Transcript';
  isRecording = false;
  recordingLabel = '';
  audioUrl = '';

  streamData = {
    objectMode: true,
    extractResults: true,
    timestamps: true,
    audioSource: null,
    model: 'en-US_BroadbandModel',
    token: null,
    accessToken: null,
    serviceUrl: null
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private _watsonService: WatsonService,
    private domSanitizer: DomSanitizer,
    private ngZone: NgZone
  ) {

    this.socket = io('http://localhost:3333');
    this.socket.on('FromApi', (message) => console.log('client socket is opened', message));
  }

  ngOnInit() {
    this.fetchToken();

    // this._watsonService.fetchRecording().subscribe(() => {
    //   console.log('Get Recording:');
    // });

    this._watsonService.fetchAudioRecordingInfo(null).subscribe((response: any) => {
      console.log('Audio data:', response);
    })
    // console.log('Wav: ', wav);
    // console.log('Plotlib: ', plotlib);
    // let size = 4096; //fft size
    // let fft = new FFT(size); //create fft object
    // let realOutput = new Array(size); // to store final result
    // let complexOutput = fft.createComplexArray(); // to store fft output

    // let buffer = fs.readFileSync('sample.wav'); // open a 1s wav file(mono 16bit pcm file at   32000hz) containing only a 750hz sinusoidal tone
    // console.log('Buffer: ', buffer)
    // let result = wav.decode(buffer); // read wav file data
    // let audioData = Array.prototype.slice.call(result.channelData[0]); // convert Float32Array to normal array
    // let realInput = audioData.slice(0, size); // use only 4096 sample from the buffer.

    // fft.realTransform(complexOutput, realInput); // compute fft
    // // fft.completeSpectrum(complexOutput);
    // fft.fromComplexArray(complexOutput, realOutput); // get rid of the complex value and keep only real

    // fft.realTransform(complexOutput, realInput); // compute fft
    // // fft.completeSpectrum(complexOutput);
    // fft.fromComplexArray(complexOutput, realOutput); // get rid of the complex value and keep only real
  }

  fetchToken() {
    this._watsonService.fetchToken().subscribe((data: any) => {
      this.streamData.accessToken = data.accessToken;
      this.streamData.serviceUrl = data.serviceUrl;
    })
  }

  setOptions(token: string) {
    return {
      token: token,
      format: true,
      extractResults: true,
      objectMode: true
    };
  }

  startStream() {
    this.stream = recognizeMicrophone(this.streamData);

    console.log('Stream Data: ', this.streamData);

    console.log('Stream: ', this.stream);

    this.stream.on('data', (stream) => {
      console.log('Stream data:', stream);
      if (stream.final) {
        this.results.push(stream);
      }
      console.log('REsults: ', this.results);
      console.log("JSON val;ue: ", JSON.stringify(this.results));
    });

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.stream = stream;
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start(1000);
        this.transcriptLabel = 'Run time transcript';
        this.isRecording = true;
        this.recordingLabel = 'Recording ...';

        console.log('Media Stream: ', stream);

        // this.processStream(stream);

        // store audio into data chunks
        const audioChunks = [];

        this.mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
          const REAL_TIME_FREQUENCY = 440;
          this.audioContext = new AudioContext();
          // We will need the analyzer for emitting data updates.
          // So we use an instance variable.
          this.analyser = this.audioContext.createAnalyser();

          console.log('Analyser: ', this.analyser);

          const mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
          mediaStreamSource.connect(this.analyser);
          // console.log('Media stream source: ', mediaStreamSource);

          var dataArray = new Uint8Array(this.analyser.frequnecyBinCount);

          console.log('Frequency data: ', dataArray);

          // console.log('Audio chunks:', audioChunks);

          // var blob = new Blob([event.data]),
          //   fileReader = new FileReader(),
          //   array;

          // fileReader.onload = function () {
          //   array = this.result;
          //   console.log("Array contains", array.byteLength, "bytes.");
          //   console.log("Array ", array);
          // };

          // let xyz = fileReader.readAsArrayBuffer(blob);

          // console.log('Filereader:', xyz);

          // this.socket.emit('FromClient', audioChunks);
        });

        // convert audio data chunks into a single audio data blob
        this.mediaRecorder.addEventListener("stop", () => {
          this.transcriptLabel = 'Final transcript';
          this.isRecording = false;
          this.recordingLabel = '';
          console.log('Audio chunks: ', audioChunks);
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

          console.log('Audio blob: ', audioBlob);

          // this.socket.emit('FromClient', audioBlob);

          // create a URL for that single audio data blob
          this.audioUrl = URL.createObjectURL(audioBlob);
          console.log('Audio url: ', this.audioUrl);

          // play the audio
          const audio = new Audio(this.audioUrl);
          // Promise.resolve().then(() => this.wave.load(this.audioUrl));

          // audio.play();

        });
      }, (error) => {
        alert('Access denied!');
      });
  }

  processStream(stream) {

    this.audioContext = new AudioContext();
    // We will need the analyzer for emitting data updates.
    // So we use an instance variable.
    this.analyser = this.audioContext.createAnalyser();

    console.log('Analyser: ', this.analyser);

    const mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
    mediaStreamSource.connect(this.analyser);
    console.log('Media stream source: ', mediaStreamSource);

    // this.analyser.fftSize = 2048;
    // var bufferLength = this.analyser.frequencyBinCount;
    // var dataArray = new Uint8Array(bufferLength);
    // this.analyser.getByteTimeDomainData(dataArray);
    // console.log('Data array: ', dataArray);

    // script processor is used as an intermediary between analyser 
    // and audioContext destination to avoid feedback 
    // through microphone.
    // CAUTION: ScriptProcessorNode is deprecated and soon some
    //  other technique would be needed to avoid feedback.
    // const scriptProcessor = this.audioContext.createScriptProcessor();
    // this.analyzer.connect(scriptProcessor);
    // scriptProcessor.connect(this.audioContext.destination);
    // console.log('Script processor: ', scriptProcessor);

    // });

  }

  stopStream() {
    // console.log('Stop stream: ', this.stream);
    this.stream.getTracks().forEach(function (track) {
      track.stop();
    });
    this.mediaRecorder.stop();
    console.log('Final results: ', this.results);
    // this.stream.removeAllListeners();
    // this.stream.recognizeStream.removeAllListeners();
    this.audioUrl = '';

    this._watsonService.fetchAudioRecordingInfo(this.results).subscribe((response: any) => {
      console.log('Audio data:', response);
    })
  }

  fileInfo($event) {
    console.log('File: ', $event.target.files[0]);
    this.file = $event.target.files[0];
  }

  sanitize(url) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  uploadAudio() {
    console.log('File: ', this.file);

    const formData = new FormData();
    formData.append('file', this.file);

    this._watsonService.uploadAudioFile(formData).subscribe(() => {
      console.log('Response');
    })
  }


}
