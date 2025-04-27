import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionUtilisateurComponent } from './inscription-utilisateur.component';

describe('InscriptionUtilisateurComponent', () => {
  let component: InscriptionUtilisateurComponent;
  let fixture: ComponentFixture<InscriptionUtilisateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InscriptionUtilisateurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionUtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
