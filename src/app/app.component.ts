import { Component, ɵConsole } from '@angular/core';

import { AngularAgoraRtcService, Stream } from 'angular-agora-rtc'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'AgoraDemo';
  localStream: Stream
  remoteCalls: any=[];

  constructor(private agoraService: AngularAgoraRtcService) {
    this.agoraService.createClient();
  }

  startCall() {
    this.agoraService.client.join(null, '1000', null, (uid) => {
      this.localStream = this.agoraService.createStream(uid, true, null, null, true, false);
      this.localStream.setVideoProfile('720p_3');
      this.subscribeToStream()
    });
  }

  private subscribeToStream() {
    this.localStream.on("accessAllowed", () => {
      console.log("accessAllowed");
    });
    this.localStream.on("accessDenied", () => {
      console.log("accessDenied")
    });
    this.localStream.init(() => {
      console.log("getUserMedia Successfully");
      this.localStream.play('agora_local');
      this.agoraService.client.publish(this.localStream, function (err) {
        console.log('Publish local stream error: ' + err)
      });
      this.agoraService.client.on('stream-published', function (evt) {
        console.log("publish local stream successfully");
      });
    }, function (err) {
      console.log("getUserMedia Failed: " + err)
    });

    this.agoraService.client.on('error', (err) => {
      console.log("Got error mesage: " + err);
      if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.agoraService.client.renewChannelKey("", () => {
          console.log("Renew channel key successfully")
        }, (err) => {
          console.log("Renew channel key failed" + err)
        });
      }
    });

    this.agoraService.client.on('error', (err) => {
      console.log("Got error msg:", err.reason);
      if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.agoraService.client.renewChannelKey("", () => {
          console.log("Renew channel key successfully");
        }, (err) => {
          console.log("Renew channel key failed: ", err);
        });
      }
    });

    this.agoraService.client.on('stream-added', (evt) => {
      const stream = evt.stream;
      this.agoraService.client.subscribe(stream, (err) => {
        console.log("Subscribe stream failed", err);
      });
    });

    this.agoraService.client.on('stream-subscribed', (evt) => {
      const stream = evt.stream;
      if (!this.remoteCalls.includes(`agora_remote${stream.getId()}`)) this.remoteCalls.push(`agora_remote${stream.getId()}`);
      setTimeout(() => stream.play(`agora_remote${stream.getId()}`), 2000);
    });

    this.agoraService.client.on('stream-removed', (evt) => {
      const stream = evt.stream;
      stream.stop();
      this.remoteCalls = this.remoteCalls.filter(call => call !== `#agora_remote${stream.getId()}`);
      console.log(`Remote stream is removed ${stream.getId()}`);
    });

    this.agoraService.client.on('peer-leave', (evt) => {
      const stream = evt.stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call === `#agora_remote${stream.getId()}`);
        console.log(`${evt.uid} left from this channel`);
      }
    });

  }
}
