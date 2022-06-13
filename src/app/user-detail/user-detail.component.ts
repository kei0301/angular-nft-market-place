import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  tab = 'items';

  listData: any = [];
  filterData: any = [];
  profileData: any;

  searchData: any = {
    length: 9,
    start: 0,
    sTextsearch: '',
    sSellingType: '',
    sSortingType: 'Recently Added'
  };

  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) {

  }

  async ngOnInit() {

    let id = this._route.snapshot.params['id'];

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

    this._script.loadScripts("app-user-detail", scripts).then(function () {

    })


    // if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {


      this.apiService.profileDetail({ userId: id }).subscribe((res: any) => {

        if (res && res['data']) {
          this.profileData = res['data'];
          this.profileData.sProfilePicUrl = this.profileData.sProfilePicUrl == undefined ? 'assets/img/avatars/avatar5.jpg' : 'https://decryptnft.mypinata.cloud/ipfs/' + this.profileData.sProfilePicUrl;


          this.profileData.sFirstname = this.profileData && this.profileData.oName && this.profileData.oName.sFirstname ? this.profileData.oName.sFirstname : '';
          this.profileData.sLastname = this.profileData && this.profileData.oName && this.profileData.oName.sLastname ? this.profileData.oName.sLastname : '';

        }

      }, (err: any) => {

      });


      this.searchData.userId = id;
      
      await this.getNFTListingData(this.searchData);


    // } else {
      // this.router.navigate(['']);

    // }

  }




  getNFTListingData(obj: any) {

    this.apiService.profileWithNfts(obj).subscribe(async (data: any) => {

      if (data && data['data']) {
        let res = await data['data'];
        this.filterData = res;

        if (res['data'] && res['data'] != 0 && res['data'].length) {
          this.listData = res['data'];
        } else {
          this.filterData = {};
          this.listData = [];
        }
      } else {
        this.filterData = {};
        this.listData = [];
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

}
