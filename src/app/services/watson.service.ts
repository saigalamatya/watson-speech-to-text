import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class WatsonService {

  apiKey = 'O7UpTYhBqXYbe1dGG3Cd1VwWlw_lUXcevb81Fll6kHCI';
  URL = 'https://api.us-south.speech-to-text.watson.cloud.ibm.com';
  token = '';

  constructor(private _http: HttpClient) { }

  createHeader() {
    let headers = new HttpHeaders();
    headers = headers.append("Content-Type", "*");
    headers = headers.append("Access-Control-Allow-Origin", "*");
    headers = headers.append("Access-Control-Allow-Headers", "*");
    return headers;
  }

  fetchToken() {
    return this._http
      .get('http://localhost:3333/api/v1/token', {
        headers: this.createHeader(),
      })
      .pipe(map((res: any) => {
        this.token = res.accessToken;
        return res;
      }), catchError(this.handleError));
  }

  fetchRecording() {
    return this._http
      .get('http://333a767af75f.ngrok.io/api/web/recording', {
        headers: this.createHeader(),
      })
      .pipe(map((res: any) => {
        return res;
      }), catchError(this.handleError));
  }

  fetchAudioRecordingInfo(transcriptArray) {
    return this._http
      .post('http://333a767af75f.ngrok.io/api/web/recording', "!231232", {
        headers: this.createHeader(),
      })
      .pipe(map((res: any) => {
        return res;
      }), catchError(this.handleError));
  }

  // uploadAudioFile(audioFile) {
  //   return this._http
  //     .post('http://localhost:3333/api/v1/upload', { audioFile }, {
  //       headers: this.createHeader(),
  //     })
  //     .pipe(map(res => res), catchError(this.handleError));
  // }
  uploadAudioFile(audioFile) {

    return this._http
      .post(`https://api.us-south.speech-to-text.watson.cloud.ibm.com/instances/d08fd070-e9c1-4ca0-aa9f-7e25baf9009c/v1/recognize?model=en-US_NarrowbandModel&access_token=${this.token}`, audioFile, {
        headers: this.createHeader(),
      })
      .pipe(map(res => res), catchError(this.handleError));
  }

  private handleError(res: HttpErrorResponse) {
    console.error(res.error);
    return Observable.throw(res.error || 'Server error');
  }
}
