import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { UserAuth } from '../interfaces/user-auth';
import { expertinfo } from '../interfaces/expert-info';
import { ProfileService } from '../services/profile.service';


@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit {
  profileForm!: FormGroup;
  passewordForm: FormGroup;
  user_auth: UserAuth = {
    'email':"",
    'password':"",
    'role':""
  }
  user_info: expertinfo = {
    'user_auth_id': "",
    'first_name': "",
    'last_name': "",
    'cin': 0,
    'matricule': "",
    'grade': "",
    'agence_ratt': "",
    'service': ""
  }
  user : User={
    'user_auth':this.user_auth,
     'user_info':this.user_info
   };
  links = [
    { label: 'Profil' },
    { label: 'Modifier mot de passe'},
    { label: 'Dashbord'}
  ];
  activeLink: any = this.links[0]; // Initialiser activeLink avec le premier élément (Dashboard)
  imagePreviewUrl?: string | ArrayBuffer | null = this.user.user_info.imageUrl;
  selectedFile: File | null = null;

  setActiveLink(link: any) {
    this.activeLink = link;
  }
  constructor(private fb: FormBuilder, private authService:AuthService,private profileService:ProfileService,private observer: BreakpointObserver,private cd: ChangeDetectorRef){
    
    this.passewordForm = this.fb.group({
      actuelpwd: ['', Validators.required],
      newpwd: ['', [Validators.required, Validators.minLength(6)]],
      newpwdconfirm: ['', Validators.required],
    }, {
      validator: this.confirmPasswordValidator
    });
  }
  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(res=>{
      //const curruser=this.authService.currentuserValue();
      const struser=this.authService.getUserlocal();
      if(struser)
        this.user=JSON.parse(struser);  
      
  });
 
  this.profileForm = this.fb.group({
    email: [this.user.user_auth.email, [Validators.required, Validators.email]],
    image: [this.user.user_info.image]
  });
  this.forminit();
 }
 forminit(): void{
  this.profileForm.patchValue({
    first_name: this.user.user_info.first_name,
  last_name: this.user.user_info.last_name,
  cin: this.user.user_info.cin,
  matricule: this.user.user_info.matricule,
  grade: this.user.user_info.grade,
  agence_ratt: this.user.user_info.agence_ratt,
  service: this.user.user_info.service,
  imageUrl: this.user.user_info.imageUrl
  });
  this.imagePreviewUrl = this.user.user_info.imageUrl;
 }
 SaveModifications(): void {
  if (this.profileForm.invalid) return;

  const formData = new FormData();

  // Ajout de l'email modifié
  formData.append('email', this.profileForm.get('email')?.value);

  // Ajout de la nouvelle image si elle a été modifiée
  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }
  // Appel au service pour envoyer les données
  this.profileService.updateProfile(formData).subscribe({
    next: (response:any) => {
      if (response.user_info) {
        this.user.user_auth = response.user_info;
      }
      if (response.expert_info) {
        this.user.user_info = response.expert_info;
      }
      // Mettre à jour le localStorage si nécessaire
      localStorage.setItem('currentUser', JSON.stringify(this.user));
      this.cd.detectChanges();
      alert('Profil mis à jour avec succès ');
        console.log('Profil mis à jour avec succès', response);
    },
    error: (error) => {
      console.error('Erreur lors de la mise à jour du profil', error);
    }
  });
}
private arrayBufferToBase64(buffer: any): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
 Changepwd(){
  if (this.passewordForm.valid) {
    this.profileService.updatepwd({ "current_password":this.passewordForm.value.actuelpwd, "new_password":this.passewordForm.value.newpwd })
    .subscribe(
      response => {
          //this.user.user_auth.password=response;
          console.log('Update successful!', response);
          alert('mot de passe modifié avec succès!');
          this.passewordForm.reset();
          //this.authService.setUser(this.user)
      },
      error => {
          console.error('Update failed!', error);
      }
  );
  }else{
    console.log("invalid form")
  }
 }
 confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return control.value.newpwd === control.value.newpwdconfirm
    ? null
    : { PasswordNoMatch: true };
};



onFileSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    this.selectedFile = file;

    // Aperçu immédiat
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(file);
  }
 
}
}

