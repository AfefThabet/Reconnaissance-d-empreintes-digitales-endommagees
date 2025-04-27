import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInvestigationComponent } from './create-investigation.component';

describe('CreateInvestigationComponent', () => {
  let component: CreateInvestigationComponent;
  let fixture: ComponentFixture<CreateInvestigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateInvestigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateInvestigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
