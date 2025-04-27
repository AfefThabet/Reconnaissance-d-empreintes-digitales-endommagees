import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvestigationService } from '../services/investigation.service';
import { Investigation } from '../interfaces/investigation';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PredictionResult } from '../interfaces/predictionResult';
import { PredictionService } from '../services/prediction.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-enquete-details',
  templateUrl: './enquete-details.component.html',
  styleUrls: ['./enquete-details.component.scss']
})
export class EnqueteDetailsComponent implements OnInit {
  enquete: any | null = null;
  isLoading = false;
  errorMessage = '';
  imagePreviewUrl: string | null = null;
  predictions: PredictionResult[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enqueteService: InvestigationService,
    private predictionService:PredictionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadEnquete();
  }

  loadEnquete(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.enqueteService.getEnqueteById(id).pipe(
        map(response => response.investigation), // Correction: 'investigation' au lieu de 'data'
        catchError((error: HttpErrorResponse) => {
          this.errorMessage = 'Erreur lors du chargement de l\'enquête';
          this.isLoading = false;
          console.error('Erreur API:', error);
          return throwError(() => new Error('Erreur lors du chargement de l\'enquête'));
        })
      ).subscribe({
        next: (enquete) => {
          this.enquete = enquete;
          this.loadImagePreview();
          this.loadPredictions(id);
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors du chargement de l\'enquête';
          this.isLoading = false;
          console.error(err);
        }
      });
    } else {
      this.errorMessage = 'ID d\'enquête non fourni';
      this.isLoading = false;
    }
  }
  loadPredictions(id:string){
    this.predictionService.getPredictionsByInvestigationId(id).subscribe({
      next: (data:any) => {
        this.predictions = data;
        console.log('Prédictions reçues:', this.predictions);
      },
      error: (err:any) => {
        console.error('Erreur lors de la récupération des prédictions:', err);
      }
    });
  }
  loadImagePreview() {
    // Supposons que vous avez ces données depuis votre AP
    if (this.enquete.img_empr?.data && this.enquete.img_empr?.contentType) {
      this.imagePreviewUrl = this.createImageUrl(
        this.enquete.img_empr.data, 
        this.enquete.img_empr.contentType
      );
    }
  }
  private createImageUrl(base64Data: string, contentType: string): string {
    return `data:${contentType};base64,${base64Data}`;
  }

  supprimerEnquete(): void {
    if (!this.enquete) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette enquête ?')) {
      this.isLoading = true;
      this.enqueteService.deleteInvestigation(this.enquete._id!).subscribe({
        next: () => {
          this.snackBar.open('Enquête supprimée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/enquetes']);
        },
        error: (err:Error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          this.isLoading = false;
          console.error(err);
        }
      });
    }
  }

/*generatePDF() {
  const data = document.getElementById('enquete-details');

  if (data) {
    html2canvas(data).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const sanitizedTitle = this.enquete.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`details-enquete-${sanitizedTitle}.pdf`);
    });
  }
}*/


generatePDF(): Promise<jsPDF> {
  return new Promise((resolve, reject) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const data = document.getElementById('enquete-details'); // Id du bloc à capturer

    if (data) {
      html2canvas(data).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        resolve(pdf); // on résout seulement quand tout est prêt
      }).catch(error => {
        reject(error); // en cas d'erreur
      });
    } else {
      reject('Element #enquete-details not found');
    }
  });
}

downloadPDF() {
  this.generatePDF().then(doc => {
    const sanitizedTitle = this.enquete.title
      ? this.enquete.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      : 'enquete'; // fallback

    doc.save(`enquete-details-${sanitizedTitle}.pdf`);
  }).catch(error => {
    console.error('Erreur lors de la génération du PDF :', error);
  });
}


sendEmailWithPDF() {
  this.generatePDF().then(doc => {
    const pdfBlob = doc.output('blob');
    const sanitizedTitle = this.enquete.title
    const formData = new FormData();
    formData.append('file', pdfBlob, `enquete-details-${sanitizedTitle}.pdf`);

    // Envoie au serveur
    /*
    this.http.post('/api/send-email', formData).subscribe({
      next: (response:any) => console.log('Email envoyé !', response),
      error: (error:any) => console.error('Erreur d\'envoi', error),
      complete: () => console.log('Requête terminée')
    });
    */
  }).catch(error => {
    console.error('Erreur lors de la génération du PDF :', error);
  });
}


async printPDF() {
  try {
    const doc = await this.generatePDF();
    const pdfUrl = URL.createObjectURL(doc.output('blob'));
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF :', error);
  }
}

  goBack(): void {
    this.router.navigate(['/enquetes-en-cours']);
  }
}