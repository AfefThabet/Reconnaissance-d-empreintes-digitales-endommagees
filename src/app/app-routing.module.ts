import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InscriptionUtilisateurComponent } from './inscription-utilisateur/inscription-utilisateur.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    'path':'inscription-utilisateur',
    'component':InscriptionUtilisateurComponent
  },
  {
    'path':'home',
    'component':HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
