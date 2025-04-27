import { Component, Input } from '@angular/core';
import { PredictionService } from '../services/prediction.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { PredictionResult } from '../interfaces/predictionResult';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.scss']
})
export class PredictionComponent {
  @Input() result!: any;
  constructor(private predictionService: PredictionService) {}
  file?: File;
  error?: string;
  progress = 0;
  models = this.predictionService.getAvailableModels();
    predictionResult: PredictionResult|null= null;
    predictionData:any = null;
    imagePreviewUrl: string | null = null;
    imageFile: File | null = null;
    user: any = {}; // user va être récupéré depuis AuthService
}