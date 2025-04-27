// Import des modules nécessaires depuis Angular
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Définition de la configuration de l'application
export const appConfig: ApplicationConfig = {
    providers: [
        //provideRouter(routes), // Assurez-vous d'importer vos routes depuis un fichier approprié
        provideHttpClient(withFetch()),
        // Autres fournisseurs si nécessaire
    ],
    // Autres configurations de l'application si nécessaires
};

// Interface pour spécifier le type de la configuration de l'application
interface ApplicationConfig {
    providers: any[]; // Vous pouvez ajuster le type en fonction des fournisseurs que vous utilisez
    // Ajoutez d'autres propriétés de configuration si nécessaire
}
