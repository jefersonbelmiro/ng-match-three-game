import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EffectHorizontalArrowComponent } from './effect-horizontal-arrow.component';

describe('EffectHorizontalArrowComponent', () => {
  let component: EffectHorizontalArrowComponent;
  let fixture: ComponentFixture<EffectHorizontalArrowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EffectHorizontalArrowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EffectHorizontalArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
