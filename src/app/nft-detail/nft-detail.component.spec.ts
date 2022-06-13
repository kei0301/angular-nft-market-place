import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NFTDetailComponent } from './nft-detail.component';

describe('NFTDetailComponent', () => {
  let component: NFTDetailComponent;
  let fixture: ComponentFixture<NFTDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NFTDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NFTDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
