import { Component } from '@angular/core';
import { User } from '../user';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-inscription-utilisateur',
  templateUrl: './inscription-utilisateur.component.html',
  styleUrl: './inscription-utilisateur.component.css'
})
export class InscriptionUtilisateurComponent {
  confirmPassword = '';
  user : User ={
    'name':"",
    'email':"",
    'password': "",
    'phone': ""
  }
  onSubmit() {
    // Handle form submission logic
    if (this.inscriptionForm.valid) {
      // Form is valid, proceed with submission
      this.user.name=this.inscriptionForm.value.name;
      this.user.email=this.inscriptionForm.value.email;
      this.user.password=this.inscriptionForm.value.password;
      this.user.phone=this.inscriptionForm.value.phone;
      this.UsersServ.registeruser(this.user);
      console.log(this.UsersServ.getUsers());
    }
  }
  inscriptionForm: FormGroup ;
  constructor(private fb: FormBuilder, private UsersServ:UsersService) {
    this.inscriptionForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", Validators.required],
      phone: ["", Validators.required]
    }, {
      validator: this.confirmPasswordValidator
    });
  }
  confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return control.value.password === control.value.confirmPassword
      ? null
      : { PasswordNoMatch: true };
  };
  
  
}
