import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {AngularAgoraRtcModule,AgoraConfig} from 'angular-agora-rtc'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

const agoraConfig: AgoraConfig={
  AppID:'cfec3bc8f7c0424d81324306c5f612f3'
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularAgoraRtcModule.forRoot(agoraConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
