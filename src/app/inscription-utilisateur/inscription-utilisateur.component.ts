import { Component } from '@angular/core';
import { User } from '../interfaces/user';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { UserAuth } from '../interfaces/user-auth';
import { expertinfo } from '../interfaces/expert-info';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-inscription-utilisateur',
  templateUrl: './inscription-utilisateur.component.html',
  styleUrl: './inscription-utilisateur.component.css'
})
export class InscriptionUtilisateurComponent {
  confirmPassword = '';
  user_auth: UserAuth = {
    'email':"",
    'password':"",
    'role':'expert'
  }
  expert_info: expertinfo = {
    'user_auth_id': "",
    'first_name': "",
    'last_name': "",
    'cin': 0,
    'matricule': "",
    'grade': "",
    'agence_ratt': "",
    'service': "",
  }
  user : User={
    'user_auth':this.user_auth,
     'user_info':this.expert_info
   };
   imageFile: File | null = null;
  inscriptionForm: FormGroup ;
  constructor(private fb: FormBuilder, private UsersServ:UsersService) {
    this.inscriptionForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      cin: [null, Validators.required],
      matricule: ['', Validators.required],
      grade: ['', Validators.required],
      agence_ratt: ['', Validators.required],
      service: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      image: [null]
    },{ validators: this.confirmPasswordValidator });
    
  }
  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageFile = file;
    }
  }
  onSubmit() {
      this.inscriptionForm.get('image')?.setValue(this.imageFile);
      if (this.inscriptionForm.invalid || !this.imageFile) {
        alert("Veuillez remplir tous les champs et ajouter une image.");
        return;
      }
    
    const formData = new FormData();

    formData.append('email', this.inscriptionForm.value.email);
    formData.append('password', this.inscriptionForm.value.password);
    formData.append('role', 'expert');

    formData.append('first_name', this.inscriptionForm.value.first_name);
    formData.append('last_name', this.inscriptionForm.value.last_name);
    formData.append('cin', this.inscriptionForm.value.cin.toString());
    formData.append('matricule', this.inscriptionForm.value.matricule);
    formData.append('grade', this.inscriptionForm.value.grade);
    formData.append('agence_ratt', this.inscriptionForm.value.agence_ratt);
    formData.append('service', this.inscriptionForm.value.service);
    formData.append('image', this.imageFile);
    //console.log("Données envoyées :", formData);
    this.UsersServ.registerexpert(formData);
  }
  
  confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return control.value.password === control.value.confirmPassword
      ? null
      : { PasswordNoMatch: true };
  };
  
  
}
