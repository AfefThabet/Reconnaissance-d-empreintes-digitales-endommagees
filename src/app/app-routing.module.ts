import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InscriptionUtilisateurComponent } from './inscription-utilisateur/inscription-utilisateur.component';
import { HomeComponent } from './home/home.component';
import { ConnexionUtilisateurComponent } from './connexion-utilisateur/connexion-utilisateur.component';
import { ProfilComponent } from './profil/profil.component';
import { AuthGuardService } from './services/auth-guard.service';
import { CreateInvestigationComponent } from './create-investigation/create-investigation.component';
import { PredictionComponent } from './prediction/prediction.component';
import { EnqueteEnCoursComponent } from './enquete-en-cours/enquete-en-cours.component';
import { ArchiveComponent } from './archive/archive.component';
import { EnqueteDetailsComponent } from './enquete-details/enquete-details.component';


const routes: Routes = [
  {
    'path':'inscription',
    'component':InscriptionUtilisateurComponent
  },
  {
    'path':'connexion',
    'component':ConnexionUtilisateurComponent
  },
  {
    'path':'profil-expert',
    'component':ProfilComponent,
    canActivate: [AuthGuardService]
  },
  {
    'path': 'nouvelle-enquete',
    'component':CreateInvestigationComponent,
  },
  {
    'path': 'prediction-result',
    'component':PredictionComponent,
  },
  { path: 'details/:id', component: EnqueteDetailsComponent },
  {
    'path': 'enquetes-en-cours',
    'component':EnqueteEnCoursComponent,
  }, 
  {
    'path': 'archives',
    'component':ArchiveComponent,
  }, 
  {
    path: '',
    redirectTo: '/acceuil',
    pathMatch: 'full'
  },
  { path: '**', component: HomeComponent } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
