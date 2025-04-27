import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { PredictionResult } from '../interfaces/predictionResult';
@Injectable({
  providedIn: 'root'
})

export class PredictionService {
  
  private baseUrl = 'http://localhost:5200/predict'; 
  private apiUrl = 'http://localhost:5200';
  constructor(private http: HttpClient,private authserv: AuthService) {}
  
  private models: string[] = ['Fing-VGG16','Fing-InceptionV3','Fing-ResNet50']

  getAvailableModels(): string[] {
    return this.models;
  }

  predict(modelName: string, file: File): Observable<any> {
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    const formData = new FormData();
    formData.append('image', file);
   
    return this.http.post<any>(`${this.baseUrl}/${modelName}`, formData,{ headers: headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur API :', error);
          return throwError(() => new Error('Erreur de prédiction'));
        })
      );
  }
  createPrediction(data: any): Observable<any> {
    const modelName = data.model; // extraire le modelName
    const payload = {
      investigation_id: data.investigation_id,
      predicted_class: data.predicted_class,
      proba: data.proba,
      timestamp: data.timestamp
    };
    const headers = new HttpHeaders({
      'authorization': 'Bearer ' +  this.authserv.getToken()
    });
    return this.http.post<any>(`${this.baseUrl}/create-prediction/${modelName}`, payload, { headers: headers })
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de la création de la prédiction', error);
          return throwError(() => new Error('Erreur côté client'));
        })
      );
  }
  getPredictionsByInvestigationId(investigationId: string): Observable<PredictionResult[]> {
    return this.http.get<PredictionResult[]>(`${this.apiUrl}/get-predictions/${investigationId}`);
  }
}

/*import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface PredictionResult {
  success: boolean;
  model: string;
  confidence: number;
  features: Array<{
    name: string;
    confidence: number;
  }>;
  processingTime: number;
  timestamp: Date;
}

interface ModelConfig {
  name: string;
  endpoint: string;
  description: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  timeout: number;
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private readonly apiUrl = 'http://localhost:3000/api/predict';
  private models: { [key: string]: ModelConfig } = {
    'Fing-VGG16': {
      name: 'VGG-16',
      endpoint: '/Fing-VGG16',
      description: 'Modèle de classification d\'images basé sur VGG16',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png'],
      timeout: 60000
    },
    'Fing-ResNet50': {
      name: 'ResNet-50',
      endpoint: '/Fing-ResNet50',
      description: 'Réseau résiduel pour classification haute précision',
      maxFileSize: 8 * 1024 * 1024, // 8MB
      allowedMimeTypes: ['image/jpeg', 'image/tiff'],
      timeout: 45000
    },
    'Fing-InceptionV3': {
      name: 'Inception V3',
      endpoint: '/Fing-InceptionV3',
      description: 'Architecture Inception optimisée pour le médical',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/png', 'image/dicom'],
      timeout: 30000
    }
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAvailableModels(): string[] {
    return Object.keys(this.models);
  }

  getModelConfig(modelName: string): ModelConfig {
    return this.models[modelName];
  }

  analyze(file: File, modelName: string): Observable<PredictionResult> {
    // Validation du fichier
    const validationError = this.validateFile(file, modelName);
    if (validationError) return throwError(() => validationError);

    const formData = new FormData();
    formData.append('file', file, file.name);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-User-ID': this.authService.getUserlocal() || ''
    });

    return this.http.post<PredictionResult>(
      `${this.apiUrl}/${modelName}`,
      formData,
      { headers }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private validateFile(file: File, modelName: string): null | Error {
    const config = this.models[modelName];
    const errors: string[] = [];

    if (!config) {
      return new Error('Modèle non reconnu');
    }

    if (file.size > config.maxFileSize) {
      errors.push(`Taille maximale: ${config.maxFileSize / 1024 / 1024}MB`);
    }

    if (!config.allowedMimeTypes.includes(file.type)) {
      errors.push(`Formats acceptés: ${config.allowedMimeTypes.join(', ')}`);
    }

    return errors.length ? 
      new Error(errors.join(' | ')) 
      : null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erreur inconnue';
    
    if (error.error?.error) {
      // Erreur structurée du backend
      errorMessage = error.error.error;
      if (error.error.details) {
        errorMessage += ` (${error.error.details})`;
      }
    } else if (error.status === 0) {
      errorMessage = 'Connexion au serveur impossible';
    } else {
      errorMessage = `Erreur HTTP ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}*/