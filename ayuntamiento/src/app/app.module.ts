import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { NgForm } from '@angular/forms';
import { AlcaldeComponent } from './components/alcalde/alcalde.component';
import { ConcejalComponent } from './components/concejal/concejal.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AlcaldeComponent,
    ConcejalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,


  
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
