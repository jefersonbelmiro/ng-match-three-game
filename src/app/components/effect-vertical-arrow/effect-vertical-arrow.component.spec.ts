import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EffectVerticalArrowComponent } from './effect-vertical-arrow.component';

describe('EffectVerticalArrowComponent', () => {
  let component: EffectVerticalArrowComponent;
  let fixture: ComponentFixture<EffectVerticalArrowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EffectVerticalArrowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EffectVerticalArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
