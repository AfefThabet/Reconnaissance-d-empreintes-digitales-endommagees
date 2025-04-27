import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { UserAuth } from '../interfaces/user-auth';
import { User } from '../interfaces/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private url = 'http://localhost:5200';
  users$ = signal<User[]>([]);
  user$ = signal<User>({} as User);

  constructor(private http: HttpClient,private router:Router) { }

  private refreshUsers() {
    this.http.get<User[]>(`${this.url}/clients`)
      .subscribe(users => {
        this.users$.set(users);
      });
  }
  
  getUsers() {
    this.refreshUsers();
    return this.users$();
  }
  
  registerexpert(data: FormData){
      this.http.post(`${this.url}/registerexpert`, data, { responseType: 'text' }).subscribe({
          next: () => {
            alert('Votre compte est crée avec succès!');
            // Rafraîchir la liste des utilisateurs après la création réussie
            this.refreshUsers();
            this.router.navigate(['/connexion']);
          },
          error: (error: HttpErrorResponse) => {
            let errorMessage = 'Failed to create user';
  
            if (error.status === 409) {
              errorMessage = 'Cet email est déjà utilisé. Veuillez utiliser un autre email.';
            } 
            alert(errorMessage);
            console.error(error);
          }
      });
  }
}
