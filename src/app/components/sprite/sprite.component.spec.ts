import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpriteComponent } from './sprite.component';

describe('SpriteComponent', () => {
  let component: SpriteComponent;
  let fixture: ComponentFixture<SpriteComponent>;

  beforeEach(async(() => {
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
