import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  type: any = 'hide'
  showObj: any = {
    wallet_address: '',
    show: 'metamask',
    network_name: '',
  };

  constructor(private router: Router,
    private _route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) {

    // this.id = this._route.snapshot.params['id'];
  }

  async ngOnInit() {

    this.type = 'hide';
    this.spinner.show();
    const that = this;
    this.showObj.wallet_address = await this.apiService.export();
    if (this.showObj.wallet_address && this.showObj.wallet_address != '' && this.showObj.wallet_address != []) {
      that.spinner.hide();

      this.showObj.network_name = await this.apiService.getNetworkName();
      this.showObj.show = 'signup';

      let call = await this.apiService.checkuseraddress(this.showObj.wallet_address).subscribe((data) => {
        that.spinner.hide();
        if (data) {

          that.spinner.hide();
          this.showObj.show = 'signin';

          if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
            this.showObj.show = 'profile';
          }
        }
      }, (err) => {
        that.spinner.hide();
        if (err['error'] && err['error']['message'] == 'User not found') {
          this.showObj.show = 'signup';
          call.unsubscribe();

        }
      })
    } else {
      that.spinner.hide();
    }
  }
  async clicktoProfile() {
    // routerLink="/my-profile?tab='profile'"
    await this.router.navigate(['/my-profile'], {
      relativeTo: this._route,
      queryParams: {
        tab: 'profile'
      },
    });
  }

  async clicktoEarnings() {
    await this.router.navigate(['/my-profile'], {
      relativeTo: this._route,
      queryParams: {
        tab: 'redeem'
      },
    });
  }

  
  connectToMetaMask() {
    this.spinner.show();
    this.apiService.connect().then((data: any) => {
      this.spinner.hide();
      if (data && data != 'error') {
        this.toaster.success('User Connected Successfully','Success!');
        this.onClickRefresh();
      }

    }).catch((er: any) => {
      this.spinner.hide();

      if (er && er.code) {
        this.toaster.error(er.message,'Error!');
      }
    })
  }

  clickOP(type: any) {
    this.type = type == 'show' ? 'hide' : 'show';
  }

  async signinMetaMask() {
    this.spinner.show();

    await this.apiService.login('signin', this.showObj.wallet_address, this.toaster)
    this.spinner.hide();

  }
  async signupMetaMask() {
    this.spinner.show();

    await this.apiService.login('signup', this.showObj.wallet_address, this.toaster);
    this.spinner.hide();

  }
  onClickRefresh() {
    window.location.reload();
  }

  onsignout() {
    if (localStorage.removeItem('Authorization') != null) {
    }
    this.onClickRefresh()
  }

}
