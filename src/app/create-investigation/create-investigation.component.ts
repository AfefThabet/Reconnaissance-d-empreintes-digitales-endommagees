import { Component,ViewChild  } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { InvestigationService } from '../services/investigation.service';
import { AuthService } from '../services/auth.service';
import { PredictionService } from '../services/prediction.service';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { PredictionResult } from '../interfaces/predictionResult';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-create-investigation',
  templateUrl: './create-investigation.component.html',
  styleUrl: './create-investigation.component.css'
})
export class CreateInvestigationComponent {
  @ViewChild('stepper') stepper!: MatStepper;
  // États d'analyse
  isAnalyzing = false;
  predictionResult: any|null= null;
  predictionData:any = null;
  analysisError: string | null = null;
  isLoading = false;
  analysisSuccess = false;
  investigationForm: FormGroup;
  imagePreviewUrl: string | null = null;
  imageFile: File | null = null;
  user: any = {}; // user va être récupéré depuis AuthService
  imageForm: FormGroup;
  model!:string;
  predictionResults: { [model: string]: any } = {};
  validationForm!: FormGroup;
  isSavingInvestigation: boolean = false;
  invest_id: any;
  isSaved = false;
  savedInvestigationId: string | null = null;
  id_valid?: string;
  allowBackNavigation = true;

  constructor(
    private fb: FormBuilder,
    private investigationService: InvestigationService,
    private authService: AuthService,
    private predictionService: PredictionService,
    private router:Router,
    private route: ActivatedRoute
  ) {
    this.investigationForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
    this.imageForm = this.fb.group({
      image: [null, Validators.required]
    });
    
  }
  mlModels = [
    { label: 'VGG16', value: 'Fing-VGG16' },
    { label: 'InceptionV3', value: 'Fing-InceptionV3' }
    //{ label: 'ResNet50', value: 'Fing-ResNet50' },
  ];
  ngOnInit(): void {
    const strUser = this.authService.getUserlocal();
    if (strUser) {
      this.user = JSON.parse(strUser);
    }
    this.validationForm = this.fb.group({
      modelsToValidate: this.fb.array([]),
      comment: ['', Validators.required]
    });
    this.route.queryParams.subscribe(params => {
      this.id_valid = params['id'];
    });
    if(this.id_valid){
      this.invest_id=this.id_valid;
      this.goToStep4();
    }
    this.initModelCheckboxes();
  }

  get modelsToValidate(): FormArray {
    return this.validationForm.get('modelsToValidate') as FormArray;
  }

  private goToStep4() {
    setTimeout(() => {
      if (this.stepper) {
        // Marquer les étapes précédentes comme complètes
        this.stepper.steps.toArray().forEach((step, index) => {
          if (index < 3) step.completed = true;
        });
        this.stepper.selectedIndex = 3; // Étape 4 (index 3)
      }
    });
  }
  initModelCheckboxes(): void {
    this.mlModels.forEach(() => this.modelsToValidate.push(new FormControl(false)));
  }
  onFileDrop(files: NgxFileDropEntry[]) {
    const droppedFile = files[0];
    if (droppedFile && droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        if (this.isImage(file)) {
          this.setImage(file);
        } else {
          alert('Veuillez déposer une image valide (jpg, png, jpeg).');
        }
      });
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.isImage(file)) {
      this.setImage(file);    
    }
  }

  setImage(file: File): void {
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
    this.imageForm.get('image')?.setValue(this.imageFile);
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  onAddInvestigation() {
    if (this.investigationForm.invalid || !this.imageFile) {
      alert("Veuillez remplir tous les champs et ajouter une image.");
      return;
    }
    this.isSavingInvestigation = true;
    const formData = new FormData();
    formData.append('image', this.imageFile);
    formData.append('titre', this.investigationForm.value.title);
    formData.append('description', this.investigationForm.value.description);
    console.log(formData)
    this.investigationService.createInvestigation(formData).subscribe({
      next: (res) => {
        console.log('Investigation créée:', res);
        this.invest_id=res.id;
        this.submitMultiplePredictions(this.invest_id);
        //alert('Investigation ajoutée avec succès!');
        this.isSavingInvestigation = false;
        this.isSaved = true;
      // Passe à l’étape 4
        this.stepper.selected!.completed = true;
        this.stepper.next();
       // this.investigationForm.reset();
        //this.imageFile = null;
        //this.imagePreviewUrl = null;
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        alert('Erreur lors de l’enregistrement.');
      }
    });
    
  }

  resetAnalysis() {
    this.predictionResult = null;
    this.analysisError = null;
    this.analysisSuccess = false;
  }
  prediction(model: string) {
    if(this.imageFile)
    this.predictionService.predict(model, this.imageFile).subscribe({
      next: (res: any) => {
        console.log('Résultat de la prédiction :', res);
        this.predictionResult = res; // <- ici tu stockes les données
        this.predictionData = res.data;
        this.isAnalyzing = false;
        this.analysisSuccess = true;
      },
      error: (err: any) => {
        console.error('Erreur pendant la prédiction :', err);
        this.predictionResult = null; // ou afficher un message d’erreur
        this.analysisSuccess = false;
      }
    });
  }
  launchAllPredictions() {
    this.isAnalyzing = true;
    for (const model of this.mlModels) {
      if(this.imageFile)
      this.predictionService.predict(model.value, this.imageFile).subscribe({
        next: (result) => {
          this.predictionResults[model.value] = result;
          this.isAnalyzing = false;
          this.analysisSuccess = true;
        },
        error: (err) => {
          console.error(`Erreur pour ${model.value}`, err);
          this.predictionResult = null; // ou afficher un message d’erreur
          this.analysisSuccess = false;
        }
      });
    }
}
onStepChange(event: StepperSelectionEvent) {
  if (event.selectedIndex === 2) { // index 2 = étape 3
    this.launchAllPredictions();
  }
  if (event.selectedIndex === 3 && this.id_valid) { // Quand on arrive à l'étape 4
    this.allowBackNavigation = false;
  }
  if (!this.allowBackNavigation && event.previouslySelectedIndex > event.selectedIndex) {
    setTimeout(() => {
      this.stepper.selectedIndex = event.previouslySelectedIndex;
    });
  }
}
submitMultiplePredictions(invest_id:string) {
  this.mlModels.forEach(model => {
    const predictionData = {
      model:model.value,
      investigation_id: invest_id,
      predicted_class: this.predictionResults[model.value].data.predicted_class,
      proba: this.predictionResults[model.value].data.Probability,
      timestamp: this.predictionResults[model.value].timestamp
    };
    this.predictionService.createPrediction(predictionData).subscribe({
      next: (res) => console.log(`✔️ ${model} OK`, res),
      error: (err) => console.error(`❌ ${model} erreur`, err)
    });
  });
}
onSubmitValidation(): void {
  const selectedModels = this.mlModels
    .filter((_, i) => this.modelsToValidate.at(i).value)
    .map(model => model.value);

  const comment = this.validationForm.value.comment;

  console.log('Modèles validés :', selectedModels);
  console.log('Commentaire :', comment);
  this.investigationService.patchInvestigationValidation(this.invest_id, {
    models: selectedModels, 
    coment: comment
  }).subscribe({
    next: () => {alert("Validation enregistrée !");
      this.router.navigate(['/enquetes-en-cours']);},
    error: (err) => console.error("Erreur :", err)
  });
  // ici tu peux faire un appel HTTP ou un traitement spécifique
}
onCancel() {
  const confirmed = confirm('Êtes-vous sûr de vouloir annuler cette validation ? Les données saisies seront perdues.');
  if (confirmed) {
    this.router.navigate(['/Enquetes-en-cours']);
  }
}
initValidationForm() {
  const modelControls = this.mlModels.map(() => this.fb.control(false));
  this.validationForm.setControl('selectedModels', this.fb.array(modelControls));
}

get selectedModels() {
  return this.validationForm.get('selectedModels') as FormArray;
}
}


/*import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { InvestigationService } from '../services/investigation.service';
import { AuthService } from '../services/auth.service';
import { PredictionService } from '../services/prediction.service';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-investigation',
  templateUrl: './create-investigation.component.html',
  styleUrls: ['./create-investigation.component.css']
})
export class CreateInvestigationComponent {
  @ViewChild('stepper') stepper!: MatStepper;

  // États d'analyse
  isAnalyzing = false;
  predictionResults: { [model: string]: any } = {};
  imagePreviewUrl: string | null = null;
  imageFile: File | null = null;
  isSavingInvestigation = false;

  // Formulaires
  investigationForm: FormGroup;
  validationForm: FormGroup;

  // Modèles disponibles
  mlModels = [
    { label: 'VGG16', value: 'Fing-VGG16' },
    { label: 'VGG16', value: 'Fing-VGG16' }
  ];

  user: any = {};
  imageForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private investigationService: InvestigationService,
    private authService: AuthService,
    private predictionService: PredictionService,
    private router: Router
  ) {
    this.investigationForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
    this.imageForm = this.fb.group({
      image: [null, Validators.required]
    });
    this.validationForm = this.fb.group({
      selectedModels: this.fb.array(this.mlModels.map(() => new FormControl(false))),
      comment: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    const strUser = this.authService.getUserlocal();
    if (strUser) {
      this.user = JSON.parse(strUser);
    }
  }

  // Getters pour les contrôles du formulaire
  get selectedModels() {
    return this.validationForm.get('selectedModels') as FormArray;
  }
  getSelectedModelControl(index: number): FormControl {
    return this.selectedModels.at(index) as FormControl;
  }
  // Gestion des fichiers
  onFileDrop(files: NgxFileDropEntry[]) {
    const droppedFile = files[0];
    if (droppedFile?.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this.validateAndSetImage(file);
      });
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    this.validateAndSetImage(file);
  }

  private validateAndSetImage(file: File) {
    if (file && this.isImage(file)) {
      this.setImage(file);
    } else {
      alert('Veuillez sélectionner une image valide (jpg, png, jpeg)');
    }
  }

  private setImage(file: File): void {
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Gestion des étapes
  onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 2) {
      this.launchAllPredictions();
    }
  }

  // Prédictions
  private launchAllPredictions() {
    this.isAnalyzing = true;
    this.mlModels.forEach(model => {
      if (this.imageFile) {
        this.predictionService.predict(model.value, this.imageFile).subscribe({
          next: (result) => {
            this.predictionResults[model.value] = result;
            this.isAnalyzing = false;
          },
          error: (err) => {
            console.error(`Erreur pour ${model.value}`, err);
            this.isAnalyzing = false;
          }
        });
      }
    });
  }

  // Création d'enquête
  onAddInvestigation() {
    if (this.investigationForm.invalid || !this.imageFile) {
      alert("Veuillez remplir tous les champs et ajouter une image");
      return;
    }

    this.isSavingInvestigation = true;
    const formData = new FormData();
    formData.append('image', this.imageFile);
    formData.append('titre', this.investigationForm.value.title);
    formData.append('description', this.investigationForm.value.description);

    this.investigationService.createInvestigation(formData).subscribe({
      next: (res) => {
        this.submitMultiplePredictions(res.id);
        this.stepper.next();
        this.isSavingInvestigation = false;
      },
      error: (err) => {
        console.error('Erreur création enquête:', err);
        alert('Erreur lors de la création');
        this.isSavingInvestigation = false;
      }
    });
  }

  private submitMultiplePredictions(invest_id: string) {
    this.mlModels.forEach(model => {
      const prediction = this.predictionResults[model.value]?.data;
      if (prediction) {
        const predictionData = {
          model: model.value,
          investigation_id: invest_id,
          predicted_class: prediction.predicted_class,
          proba: prediction.Probability,
          timestamp: new Date().toISOString()
        };

        this.predictionService.createPrediction(predictionData).subscribe({
          error: (err) => console.error(`Erreur prédiction ${model.value}`, err)
        });
      }
    });
  }

  // Validation finale
  onSubmitValidation(): void {
    if (this.validationForm.invalid) {
      alert('Veuillez sélectionner au moins un modèle');
      return;
    }

    const selectedModels = this.validationForm.value.selectedModels
      .map((checked: boolean, i: number) => checked ? this.mlModels[i].value : null)
      .filter((v: string | null) => v !== null);

    console.log('Modèles validés:', selectedModels);
    console.log('Commentaire:', this.validationForm.value.comment);

    this.router.navigate(['/Enquetes-en-cours']);
  }

  onCancel() {
    if (confirm('Annuler la création ? Les données seront perdues.')) {
      this.router.navigate(['/Enquetes-en-cours']);
    }
  }
}*/
