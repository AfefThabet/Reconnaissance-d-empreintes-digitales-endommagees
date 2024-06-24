import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { User } from '../user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private url = 'http://localhost:5200';
  users$ = signal<User[]>([]);
  user$ = signal<User>({} as User);

  constructor(private http: HttpClient) { }

  private refreshUsers() {
    this.http.get<User[]>(`${this.url}/users`)
      .subscribe(users => {
        this.users$.set(users);
      });
  }
  
  getUsers() {
    this.refreshUsers();
    return this.users$();
  }
  
  registeruser(user:User){
      console.log(user)
      this.http.post(`${this.url}/users`, user, { responseType: 'text' }).subscribe({
        /*error: (error) => {
          alert('Failed to create user');
          console.error(error);*/

          next: () => {
            alert('User created successfully!');
            // Rafraîchir la liste des utilisateurs après la création réussie
            this.refreshUsers();
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
