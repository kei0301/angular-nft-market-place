import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.css']
})
export class NFTListComponent implements OnInit {

  NFTListData: any = [];
  searchData: any = {
    length: 9,
    start: 0,
    eType: ['All'],
    sTextsearch: '',
    sSellingType: '',
    sSortingType: 'Recently Added'
  };

  filterData: any = {}
  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) { }

  async ngOnInit() {



    const that = this;
    document.addEventListener("DOMContentLoaded", function () {
      let scripts = [];
      scripts = [
        "../../assets/js/jquery-3.5.1.min.js",
        "../../assets/js/bootstrap.bundle.min.js",
        "../../assets/js/owl.carousel.min.js",
        "../../assets/js/jquery.magnific-popup.min.js",
        "../../assets/js/select2.min.js",
        "../../assets/js/smooth-scrollbar.js",
        "../../assets/js/jquery.countdown.min.js",
        "../../assets/js/main.js",
      ];
      that._script.loadScripts("app-nft-list", scripts).then(function () {

      })
    });
    // if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
    await this.getNFTListingData(this.searchData);
    // } else {
    //   this.toaster.info('Please login first.')
    //   this.router.navigate([''])
    // }
  }

  getNFTListingData(obj: any) {

    this.apiService.nftListing(obj).subscribe(async (data: any) => {

      if (data && data['data']) {
        let res = await data['data'];
        this.filterData = res;

        if (res['data'] && res['data'] != 0 && res['data'].length) {
          this.NFTListData = res['data'];
        } else {
          this.filterData = {};
          this.NFTListData = [];
        }
      } else {
        this.filterData = {};
        this.NFTListData = [];
      }
    }, (error) => {
      if (error) {

      }
    })
  }


  async onClickLoadMore() {
    this.searchData['length'] = this.searchData['length'] + 9;

    await this.getNFTListingData(this.searchData);
  }

  async onClickTypeSearch(type: any) {
    // if(checked == true){
    this.searchData['sSellingType'] = type;
    // }
    await this.getNFTListingData(this.searchData);
  }

  async clickClearAll() {

    this.searchData = {
      length: 9,
      start: 0,
      eType: ['All'],
      sTextsearch: '',
      sSellingType: '',
      sSortingType: 'Recently Added'
    };

    await this.getNFTListingData(this.searchData);

  }

  async onSelectCategory(e: any) {
    // if(checked == true){
    this.searchData['eType'] = [e.target.value];
    // }
    await this.getNFTListingData(this.searchData);
  }

  async onkeyUp(e: any) {
    this.searchData['sTextsearch'] = e.target.value;
    // }
    await this.getNFTListingData(this.searchData);
  }

  clickLike(id: any) {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      this.apiService.like({ id: id }).subscribe((updateData: any) => {
        this.spinner.hide();

        if (updateData && updateData['data']) {
          // this.toaster.success(updateData['message'], 'Success!')
          this.onClickRefresh();
        } else {

        }

      }, (err: any) => {
        this.spinner.hide();
        if (err && err['message']) {

        }
      });

    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.')
    }

  }
  onClickRefresh() {
    window.location.reload();
  }

}
