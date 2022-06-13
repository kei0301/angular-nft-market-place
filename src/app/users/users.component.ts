import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  filterData: any = {};

  searchData: any = {
    length: 8,
    start: 0,
    sTextsearch: '',
    sSellingType: '',
    sSortingType: 'Recently Added'
  };

  listData: any = [];

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

    this._script.loadScripts("app-users", scripts).then(function () {

    })


    await this.getUsersListingData(this.searchData);


    // 
  }


  getUsersListingData(obj: any) {
    this.apiService.allUserDetails(obj).subscribe(async (data: any) => {
      console.log('-------data------------', data)
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

    await this.getUsersListingData(this.searchData);
  }


  onClickFollow(id:any) {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      this.apiService.follow({id:id}).subscribe((updateData: any) => {
        this.spinner.hide();

        if (updateData && updateData['data']) {
          this.toaster.success('user followed successfully.','Success!')
          this.onClickRefresh();
        } else {

        }

      }, (err: any) => {
        this.spinner.hide();
        if (err && err['message']) {

        }
      });

    }else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.')
    }
  }
  onClickRefresh() {
    window.location.reload();
  }

  rendomIMG(){
    console.log('---------------------caLLII---')
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
  }
}
