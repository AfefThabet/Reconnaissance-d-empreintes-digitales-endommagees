
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { User } from '../interfaces/user';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<User|null>;
  public user$: Observable<User | null>;
  private apiUrl = 'http://localhost:5200';
  private tokenKey = 'auth_token';
  //user$ = signal<User>({} as User);
  localStorage: Storage|undefined;
  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  /*constructor(private http: HttpClient,@Inject(DOCUMENT) private document: Document,private router:Router) {
    // If a token is already present in localStorage during initialization, initialize currentUserSubject
     //const token = this.getToken();
     this.localStorage = document.defaultView?.localStorage;
     this.userSubject = new BehaviorSubject<User|null>(null)
     if(this.localStorage){
      const storedUser = localStorage.getItem("currentUser");
      if(storedUser != null)
        this.userSubject = new BehaviorSubject<User|null>(JSON.parse(storedUser));
     }   
     this.user$ = this.userSubject.asObservable();
  }*/
constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document, private router: Router) {
  this.localStorage = document.defaultView?.localStorage;
  this.userSubject = new BehaviorSubject<User | null>(null);
 
  if (this.localStorage) {
    const storedUser = localStorage.getItem("currentUser");
    // Check if storedUser is valid before parsing
    if (storedUser && storedUser !== 'undefined') {
      this.userSubject = new BehaviorSubject<User | null>(JSON.parse(storedUser));
    }
  }
  if (this.localStorage) {
    const storedToken = this.localStorage.getItem(this.tokenKey);
    if (storedToken) {
      this.tokenSubject.next(storedToken);
    }
  }
  
  this.user$ = this.userSubject.asObservable();
}
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
          const token = response.token;
          const user = response.user;
          if (token) {
            this.setToken(token);
          }
          if(user){
            this.setUser(user);
            this.userSubject.next(user);
          }
          this.isLoggedIn$.next(true);
      })
  );
  }/*
  private refreshUser() {
    if(this.getToken()){
      const headers = new HttpHeaders({
        'authorization': 'Bearer ' +  this.getToken()
      });
      this.http.get<User>(`${this.apiUrl}/user`, { headers: headers })
      .pipe(
        catchError(error => {
          if (error.status === 403) {
            // Gérer l'erreur 403 ici, par exemple :
            console.error('Accès interdit (403) : Vous n\'êtes pas autorisé à accéder à cette ressource.');
            this.logout();
          }
          return throwError(error); // Renvoyer l'erreur pour la gestion par le subscriber
        })
      )
      .subscribe(
        user => {
          this.userSubject.next(user);
        },
        error => {
          console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        }
      );
  }
}*/
public currentuserValue(): User|null{
  return this.userSubject.value;
}
  
  getUser(): Observable<User | null> {
    return this.user$;
  }
    /*private refreshUser() {
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' +  this.getToken()
      });
      this.http.get<User>(`${this.apiUrl}/users`, { headers: headers })
        .subscribe(user => {
          this.user$.set(user);
        });
    }
    
    getUser() {
      this.refreshUser();
      return this.user$();
    }*/
  setToken(token: string) {
    if(this.localStorage)
    localStorage.setItem(this.tokenKey, token);
    this.tokenSubject.next(token);
  }

  // Récupère le token depuis le localStorage
  /*get token(): string | null {
    return localStorage.getItem('auth_token');
  }*/

  // Vérifie si le token est expiré

  getToken(): string {
    if(this.localStorage)
    return localStorage.getItem(this.tokenKey) || '';
    return ''
  }
  isLoggedIn(): boolean {
     const token = this.getToken();
     //if(!!token)
     //this.isLoggedIn$.next(false);
    return !!token;
  }

  logout() {
    if(this.localStorage){
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem("currentUser");
    }
    this.userSubject.next(null);
    this.isLoggedIn$.next(false);
  }

  setUser(user: User) {
    if(this.localStorage)
    localStorage.setItem("currentUser", JSON.stringify(user));
  }
  getUserlocal() {
    if(this.localStorage)
     return localStorage.getItem("currentUser");
    return null
  }
  getExpertId(): Observable<string | null> {
    return this.user$.pipe(
      map(user => user?.user_auth?._id || null)
    );
  }
  

getTokenObservable(): Observable<string | null> {
  return this.tokenSubject.asObservable();
}
}