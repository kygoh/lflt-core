import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { LfltCoreModule } from 'lflt-core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    LfltCoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
