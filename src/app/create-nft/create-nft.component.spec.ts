import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNFTComponent } from './create-nft.component';

describe('CreateNFTComponent', () => {
  let component: CreateNFTComponent;
  let fixture: ComponentFixture<CreateNFTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNFTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNFTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
