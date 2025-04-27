import { Injectable, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService{
  isLogged: boolean=false;

  constructor(private authService: AuthService, private router: Router) {
  }
  canActivate(): boolean {
    /*
      this.isLogged=this.authService.isLoggedIn();
    if (this.isLogged) {
      return true;
    } */
   if(this.authService.currentuserValue()){
     return true;
   }
   else {
      this.router.navigate(['/connexion']); // Redirection vers la page de connexion
      return false;
    }
  }
}
