import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/user';
import { ActivatedRoute, Router } from '@angular/router';
import { Console } from 'console';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit{
  firstname: String | undefined; 
  lastname: String | undefined; 
  imageUrl: string | undefined;
  //logged: boolean;
  isLogged: boolean=true;//isLogged: boolean=this.authService.isLoggedIn();
  profilelink: any="";
  /*user$ : User={
    'name':"",
    'email':"",
    'password': "",
    'phone': ""
  } ;  */
  constructor(private router: Router, private authService: AuthService,private route:ActivatedRoute) {
    //this.logged=this.isLoggedIn();
   }  
 ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(res=>{
      this.firstname =this.authService.currentuserValue()?.user_info?.first_name;  
      this.lastname =this.authService.currentuserValue()?.user_info?.last_name;   
      this.imageUrl =this.authService.currentuserValue()?.user_info?.imageUrl;
      this.isLogged=this.authService.isLoggedIn();  
      if(this.authService.currentuserValue()?.user_auth?.role==="expert"){
        this.profilelink="/profil-expert";
      }else{
        this.profilelink="/";
      }
  });
 }
  /*isLoggedIn(): boolean {
    if(this.authService.isLoggedIn()){
      this.authService.getUser().subscribe(user => {
        if (user) {
          this.username = user.name; // Assurez-vous que votre modèle User a une propriété username
          this.isLogged=true;
        }
      });
    }
      //this.logged=true;
    //}
    return this.authService.isLoggedIn();
  }*/

  logout() {
    this.isLogged=false;
    this.authService.logout();
    // Autres actions de déconnexion comme redirection, rafraîchissement de l'interface, etc.
  }
}
