import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;
declare let $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  landingData: any = {
    collections: [],
    onAuction: [],
    onSale: [],
    recentlyAdded: [],
    users: []
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
    this.spinner.show();
  }
  ngAfterViewInit() {

  }
  loadSCR() {
    const that = this;
    document.addEventListener("DOMContentLoaded", function () {
      let scripts = [];
      scripts = [
        "../../assets/js/jquery-3.5.1.min.js",
        "../../assets/js/bootstrap.bundle.min.js",
        "../../assets/js/jquery.magnific-popup.min.js",
        "../../assets/js/owl.carousel.min.js",
        "../../assets/js/select2.min.js",
        "../../assets/js/smooth-scrollbar.js",
        "../../assets/js/jquery.countdown.min.js",
        "../../assets/js/main.js",
      ];

      that._script.loadScripts("app-dashboard", scripts).then(function () {

      })
    });
  }
  async ngOnInit() {
    this.loadSCR();


    await this.apiService.landingPage().subscribe(async (data: any) => {

      if (data['message'] == 'success') {
        this.landingData = await data['data'];
        let scripts = [];
        scripts = [
          "../../assets/js/jquery-3.5.1.min.js",
          "../../assets/js/bootstrap.bundle.min.js",
          "../../assets/js/jquery.magnific-popup.min.js",
          "../../assets/js/owl.carousel.min.js",
          "../../assets/js/select2.min.js",
          "../../assets/js/smooth-scrollbar.js",
          "../../assets/js/jquery.countdown.min.js",
          "../../assets/js/main.js",
        ];

        this._script.loadScripts("app-dashboard", scripts).then(function () {

        })
      }

    })
  }




  connectToMetaMask() {
    this.spinner.show();
    this.apiService.connect().then((data: any) => {
      this.spinner.hide();
      if (data && data != 'error') {
        this.toaster.success('User Connected Successfully', 'Success!');
        this.onClickRefresh();
      }

    }).catch((er: any) => {
      this.spinner.hide();

      if (er && er.code) {
        this.toaster.error(er.message, 'Error!');
      }
    })
  }


  onClickRefresh() {
    window.location.reload();
  }

  goTOUsers() {
    this.router.navigate(['/users'])
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

}
