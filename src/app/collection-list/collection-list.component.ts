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
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.css']
})
export class CollectionListComponent implements OnInit {

  collectionListData: any = [];
  searchData: any = {
    length: 9,
    start: 0,
    sTextsearch: '',
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

    this._script.loadScripts("app-collections", scripts).then(function () {

    })
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      await this.getCollectionsData();
    } else {
      this.toaster.success('Please signin first.');
      this.router.navigate([''])
    }
  }


  getCollectionsData() {
    console.log('------------------------------------1')
    this.apiService.myCollectionList(this.searchData).subscribe(async (data: any) => {
      console.log('------------------------------------2')
      if (data && data['data']) {
        let res = await data['data'];
        this.filterData = res;

        if (res['data'] && res['data'] != 0 && res['data'].length) {
          this.collectionListData = res['data'];
        } else {
          this.filterData = {};
          this.collectionListData = [];
        }
      } else {
        this.filterData = {};
        this.collectionListData = [];
      }
    }, (error) => {
      console.log('------------------------------------3', error)
      if (error) {

      }
    })
  }

  async clickClearAll() {

    this.searchData = {
      length: 9,
      start: 0,
      sTextsearch: '',
    };

    await this.getCollectionsData();
  }

  async onClickLoadMore() {
    this.searchData['length'] = this.searchData['length'] + 9;

    await this.getCollectionsData();
  }


  async onkeyUp(e: any) {
    this.searchData['sTextsearch'] = e.target.value;
    // }
    await this.getCollectionsData();
  }

}


