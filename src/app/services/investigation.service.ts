import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Investigation } from '../interfaces/investigation';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {
  private apiUrl = 'http://localhost:5200';
  private baseUrl = 'http://localhost:5200/investigations';
  private enquetesSubject = new BehaviorSubject<any[]>([]);
  public enquetes$ = this.enquetesSubject.asObservable();
  private enquetes_archiveSubject = new BehaviorSubject<any[]>([]);
  public enquetes_archive$ = this.enquetes_archiveSubject.asObservable();

  
  constructor(private http: HttpClient,private authserv: AuthService, private router:Router) {}
  createInvestigation(data: FormData): Observable<any>  {
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    return this.http.post<any>(`${this.apiUrl}/create-investigation`,data, { headers: headers }).pipe(
          catchError(error => {
            if (error.status === 403) {
              this.authserv.logout();
              alert("session expiré!")
              this.router.navigate(['/connexion']);
              //console.error('Accès interdit (403) : Vous n\'êtes pas autorisé à accéder à cette ressource.');
            }
            return throwError(error); // Renvoyer l'erreur pour la gestion par le subscriber
          })
        );
  }
  patchInvestigationValidation(id: string, validation: { models: string[], coment: string }): Observable<any> {
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    
    return this.http.patch(`${this.baseUrl}/${id}/validate`, validation, { headers: headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la mise à jour de la validation :', error);
        return throwError(() => new Error('Erreur lors de la validation'));
      })
    );
  }

  getOngoingInvestigations(): Observable<any[]> {
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    //console.log('Token envoyé:', this.authserv.getToken());
    return this.http.get<any[]>(`${this.baseUrl}/ongoing`,{ headers: headers }).pipe(
        tap(enquetes => this.enquetesSubject.next(enquetes)),
        catchError((error) => {
          console.error('Erreur lors de getArchiveInvestigations :', error);
          return throwError(() => new Error('Erreur lors de getArchiveInvestigations '));
        })
    );
  }
  getArchiveInvestigations(): Observable<any[]> {
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    //console.log('Token envoyé:', this.authserv.getToken());
    return this.http.get<any[]>(`${this.baseUrl}/archive`,{ headers: headers }).pipe(
      tap(enquetes => this.enquetes_archiveSubject.next(enquetes)),
      catchError((error) => {
        console.error('Erreur lors de getArchiveInvestigations :', error);
        return throwError(() => new Error('Erreur lors de getArchiveInvestigations '));
      })
    );
  }
  deleteInvestigation(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const updated = this.enquetesSubject.value.filter(e => e._id !== id);
        const updated_archive = this.enquetes_archiveSubject.value.filter(e => e._id !== id);
        this.enquetesSubject.next(updated);
        this.enquetes_archiveSubject.next(updated_archive);
      })
    );
  }

  archiveInvestigation(investigationId: string): Observable<any> {
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    return this.http.patch(`${this.baseUrl}/${investigationId}/archive`, { headers: headers }).pipe(
      tap(() => {
        const updated = this.enquetesSubject.value.filter(e => e._id !== investigationId);
        this.enquetesSubject.next(updated);
      })
    );
  }

  getEnqueteById(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    return this.http.get<any>(`${this.baseUrl}/details/${id}`,{ headers: headers });
  }
  
}
