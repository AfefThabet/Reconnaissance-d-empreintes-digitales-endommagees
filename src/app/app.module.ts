import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { InscriptionUtilisateurComponent } from './inscription-utilisateur/inscription-utilisateur.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { appConfig } from './app.config';
@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    InscriptionUtilisateurComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    provideClientHydration(),
    { provide: 'APP_CONFIG', useValue: appConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
