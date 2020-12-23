import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PowerUpsComponent } from './power-ups.component';

describe('PowerUpsComponent', () => {
  let component: PowerUpsComponent;
  let fixture: ComponentFixture<PowerUpsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PowerUpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerUpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
