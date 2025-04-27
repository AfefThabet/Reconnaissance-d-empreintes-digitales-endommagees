import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqueteEnCoursComponent } from './enquete-en-cours.component';

describe('EnqueteEnCoursComponent', () => {
  let component: EnqueteEnCoursComponent;
  let fixture: ComponentFixture<EnqueteEnCoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnqueteEnCoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnqueteEnCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
