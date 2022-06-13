import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NFTListComponent } from './nft-list.component';

describe('NFTListComponent', () => {
  let component: NFTListComponent;
  let fixture: ComponentFixture<NFTListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NFTListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NFTListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
