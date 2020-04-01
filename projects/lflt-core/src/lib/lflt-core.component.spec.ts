import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LfltCoreComponent } from './lflt-core.component';

describe('LfltCoreComponent', () => {
  let component: LfltCoreComponent;
  let fixture: ComponentFixture<LfltCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LfltCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LfltCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
