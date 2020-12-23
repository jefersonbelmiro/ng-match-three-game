import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EffectAxeComponent } from './effect-axe.component';

describe('EffectAxeComponent', () => {
  let component: EffectAxeComponent;
  let fixture: ComponentFixture<EffectAxeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EffectAxeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EffectAxeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
