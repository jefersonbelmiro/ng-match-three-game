import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpriteComponent } from './sprite.component';

describe('SpriteComponent', () => {
  let component: SpriteComponent;
  let fixture: ComponentFixture<SpriteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpriteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
