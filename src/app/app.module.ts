import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { JwtModule } from '@auth0/angular-jwt';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { InscriptionUtilisateurComponent } from './inscription-utilisateur/inscription-utilisateur.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { appConfig } from './app.config';
import { ConnexionUtilisateurComponent } from './connexion-utilisateur/connexion-utilisateur.component';
import { ProfilComponent } from './profil/profil.component';
import { RouterModule } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SideBarFilterComponent } from './side-bar-filter/side-bar-filter.component';
import { CreateInvestigationComponent } from './create-investigation/create-investigation.component';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxFileDropModule } from 'ngx-file-drop';
import { PredictionComponent } from './prediction/prediction.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EnqueteEnCoursComponent } from './enquete-en-cours/enquete-en-cours.component';
import { AuthInterceptor } from './auth.interceptor';
import { ArchiveComponent } from './archive/archive.component';
import { MatTabsModule } from '@angular/material/tabs';
import { EnqueteDetailsComponent } from './enquete-details/enquete-details.component';
import { MatMenuModule } from '@angular/material/menu';

// Fonction pour récupérer le token JWT depuis le localStorage
export function tokenGetter() {
  return localStorage.getItem('auth_token');
}
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    InscriptionUtilisateurComponent,
    HomeComponent,
    ConnexionUtilisateurComponent,
    ProfilComponent,
    SideBarFilterComponent,
    CreateInvestigationComponent,
    PredictionComponent,
    EnqueteEnCoursComponent,
    ArchiveComponent,
    EnqueteDetailsComponent
  ],
  imports: [
    FontAwesomeModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatStepperModule,
    MatInputModule,
    NgxFileDropModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatProgressBarModule ,
    MatCheckboxModule,
    MatTabsModule,
    MatMenuModule
  ],
  providers: [
    provideClientHydration(),
    { provide: 'APP_CONFIG', useValue: appConfig },
    provideAnimationsAsync(),
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
