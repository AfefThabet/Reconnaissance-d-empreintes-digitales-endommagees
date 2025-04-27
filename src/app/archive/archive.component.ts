import { Component } from '@angular/core';
import { catchError, filter, finalize, Observable, of, switchMap, take } from 'rxjs';
import { InvestigationService } from '../services/investigation.service';
import { AuthService } from '../services/auth.service';
import { error } from 'console';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.css'
})
export class ArchiveComponent {
  enquetes$!: Observable<any[]>;
    isLoading = true;
    errorMessage = '';

    constructor(private investigationService: InvestigationService,private authService:AuthService) {
      
    }
  
    ngOnInit(): void {
      this.initializeData();
    }
  
    initializeData(): void {
        this.authService.getTokenObservable().pipe(
          filter(Boolean),
          take(1),
          switchMap(() => {
            this.isLoading = true;
            return this.investigationService.getArchiveInvestigations().pipe(
              finalize(() => this.isLoading = false),
              catchError(err => {
                this.errorMessage = 'Erreur de chargement';
                console.error(err);
                return of([]);
              })
            );
          })
        ).subscribe();
        this.enquetes$ = this.investigationService.enquetes_archive$;
      }
  
    supprimer(id: string): void {
        if (confirm('Confirmer la suppression ?')) {
          this.isLoading = true;
          this.investigationService.deleteInvestigation(id).pipe(
            finalize(() => this.isLoading = false)
          ).subscribe({
            error: (err) => {
              this.errorMessage = 'Échec de la suppression';
              console.error(err);
            }
          });
        }
      }
      trackById(index: number, item: any): string {
        return item.id;
      }
}
