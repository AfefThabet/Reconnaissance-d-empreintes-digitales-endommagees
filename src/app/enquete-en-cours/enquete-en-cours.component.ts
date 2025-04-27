import { Component, OnInit , ViewChild } from '@angular/core';
import { InvestigationService } from '../services/investigation.service';
import { catchError, filter, finalize, Observable, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-enquete-en-cours',
  templateUrl: './enquete-en-cours.component.html',
  styleUrl: './enquete-en-cours.component.css'
})
export class EnqueteEnCoursComponent  implements OnInit {
  isLoading = true;
  errorMessage = '';
  enquetes$!: Observable<any[]>;
  constructor(private investigationService: InvestigationService,private authService:AuthService,private dialog: MatDialog,
      private router:Router) {}

  ngOnInit(): void {
    this.initializeData();
  }

  initializeData(): void {
    this.authService.getTokenObservable().pipe(
      filter(Boolean),
      take(1),
      switchMap(() => {
        this.isLoading = true;
        return this.investigationService.getOngoingInvestigations().pipe(
          finalize(() => this.isLoading = false),
          catchError(err => {
            this.errorMessage = 'Erreur de chargement';
            console.error(err);
            return of([]);
          })
        );
      })
    ).subscribe();
    this.enquetes$ = this.investigationService.enquetes$;
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

  archive(id: string): void {
    if (confirm('Confirmer l\'archivage ?')) {
      this.investigationService.archiveInvestigation(id).subscribe({
        error: (err) => {
          console.error('Échec archivage', err);
          this.errorMessage = 'Erreur lors de l\'archivage';
        }
      });
    }
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  valider(id: string): void {
    this.router.navigate(['/nouvelle-enquete'], { queryParams: { id: id } });
  }
  /*openEditDialog(product: any) {
    //this.isDialogOpen = true;
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '400px',
      data: { product: product }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the product with the new data
        Object.assign(product, result);     
        //this.fetchProviderProducts();
      }
    });
  }
  title = 'material-responsive-sidenav';
   @ViewChild(MatSidenav)
   sidenav!: MatSidenav;
   isMobile= true;*/
}