import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Belongings } from './belongings';

describe('Belongings', () => {
  let component: Belongings;
  let fixture: ComponentFixture<Belongings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Belongings],
    }).compileComponents();

    fixture = TestBed.createComponent(Belongings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
