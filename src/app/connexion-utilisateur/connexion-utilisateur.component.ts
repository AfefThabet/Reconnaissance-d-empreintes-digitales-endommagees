import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connexion-utilisateur',
  templateUrl: './connexion-utilisateur.component.html',
  styleUrl: './connexion-utilisateur.component.css'
})
export class ConnexionUtilisateurComponent {
  connexionForm: FormGroup;
  constructor(private fb: FormBuilder, private authServ:AuthService, private router:Router) {
    this.connexionForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]]
    });
  }
  onSubmit() {
    // Handle form submission logic
    if (this.connexionForm.valid) {
      // Form is valid, proceed with submission
      const formData = this.connexionForm.value;
      
      // Appel au service d'authentification pour traiter les données
      this.authServ.login(formData).subscribe({
        next: () => {
          // Traiter la réponse du backend (par exemple, rediriger vers une page d'accueil)
          sessionStorage.setItem('isLoggedIn', "true");  
          console.log('Login successful');
          this.router.navigate(['/archives']);
        },
        error: (error) => {
          // Gérer les erreurs d'authentification (par exemple, afficher un message d'erreur à l'utilisateur)
          console.error('Login error:', error);
          alert('Identifiant ou mot de passe incorrect. Veuillez réessayer.');
        }
      
    })
  }
  }
}
