import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = 'http://localhost:5200'; // Remplacez par votre URL backend
  
  constructor(private http: HttpClient,private authserv:AuthService, private router:Router) { }
  
  updateProfile(formData:FormData) {
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    return this.http.put(`${this.apiUrl}/profile/update`, formData, { headers: headers })
    .pipe(
      catchError(error => {
        if (error.status === 403) {
          // Gérer l'erreur 403 ici, par exemple :
          this.authserv.logout();
          alert("session expiré!")
          this.router.navigate(['/connexion']);
          //console.error('Accès interdit (403) : Vous n\'êtes pas autorisé à accéder à cette ressource.');
        }
        return throwError(error); // Renvoyer l'erreur pour la gestion par le subscriber
      })
    ); 
  }
 
  updatepwd(pwds:any){
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    return this.http.put<any>(`${this.apiUrl}/update_password`, pwds, { headers: headers })
    .pipe(
      catchError(error => {
        if (error.status === 403) {
          this.authserv.logout();
          alert("session expiré!")
          this.router.navigate(['/connexion']);
          //console.error('Accès interdit (403) : Vous n\'êtes pas autorisé à accéder à cette ressource.');
        }else if(error.status === 401){
          alert("Mot de passe actuel incorrecte!");
        }
        return throwError(error); // Renvoyer l'erreur pour la gestion par le subscriber
      })
    );
  }
}
