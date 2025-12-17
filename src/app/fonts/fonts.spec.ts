import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fonts } from './fonts';

describe('Fonts', () => {
  let component: Fonts;
  let fixture: ComponentFixture<Fonts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fonts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fonts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
