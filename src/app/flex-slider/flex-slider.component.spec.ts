import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexSliderComponent } from './flex-slider.component';

describe('FlexSliderComponent', () => {
  let component: FlexSliderComponent;
  let fixture: ComponentFixture<FlexSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexSliderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlexSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
