import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { parse } from 'path';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;
declare let $: any;


@Component({
  selector: 'app-nft-detail',
  templateUrl: './nft-detail.component.html',
  styleUrls: ['./nft-detail.component.css']
})
export class NFTDetailComponent implements OnInit, OnDestroy {
  // console.log('---aNFT------',aNFT.sCollectionDetail)

  NFTData: any = {};
  historyData: any = [];
  tokenHistoryData: any = [];
  interVal: any;
  collaboratorList: any = [];

  bidForm: any;
  submitted1: Boolean = false;

  transferForm: any;
  submitted2: Boolean = false;

  buyForm: any;
  submitted3: Boolean = false;

  changePriceForm: any;
  submitted4: Boolean = false;

  timedAuctionForm: any;
  submitted5: Boolean = false;

  isLogin: any = false;
  sellingType: any = '';
  id: any;

  auct_time: any = {
    mins: 0,
    secs: 0,
    hours: 0
  }
  showObj: any = {
    wallet_address: localStorage.getItem('sWalletAddress'),
    showBidCurrent: 'show',
    showTransferCurrent: 'hide',
    showBuyCurrent: 'show',

  }
  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) { }

  ngOnDestroy() {
    clearInterval(this.interVal);
    var magnificPopup = $.magnificPopup.instance;
    // save instance in magnificPopup variable
    magnificPopup.close();
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

    this._script.loadScripts("app-nft-detail", scripts).then(function () {

    })
    this.buildBidForm();
    this.buildTransferForm();
    this.buildBUYForm();
    this.buildCHANGEPRICEForm();
    this.buildTIMEDAUCTIONForm();

    let id = this._route.snapshot.params['id'];
    if (id && id != null && id != undefined && id != '') {

      await this.getNFTViewData(id);

      await this.getBidHistory(id);
      if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
        this.isLogin = true;
        await this.getColoboraterList();
      }

    } else {
      this.toaster.info('There is some issue with route.')
      this.router.navigate(['']);

    }

  }
  buildCHANGEPRICEForm() {
    this.changePriceForm = this._formBuilder.group({
      nBasePrice: ['', [Validators.required]]
    });
  }
  buildTIMEDAUCTIONForm() {
    this.timedAuctionForm = this._formBuilder.group({
      type: ['Auction', [Validators.required]],
      days: ['', []]
    });
  }

  buildBidForm() {
    this.bidForm = this._formBuilder.group({
      nQuantity: ['', [Validators.required]],
      nBidPrice: ['', [Validators.required]],
    });
  }

  buildTransferForm() {
    this.transferForm = this._formBuilder.group({
      nQuantity: ['', [Validators.required]],
      oRecipient: ['', [Validators.required]],
    });
  }
  buildBUYForm() {
    this.buyForm = this._formBuilder.group({
      nQuantity: ['', [Validators.required]],
      nBidPrice: [{ value: '', disabled: true }, [Validators.required]],
    });
  }

  getColoboraterList() {
    this.apiService.getColoboraterList().subscribe((res: any) => {
      if (res && res['data']) {
        this.collaboratorList = res['data'];
      }
    }, (err: any) => {
    });
  }

  getNFTViewData(id: any) {
    this.apiService.viewnft(id).subscribe(async (data: any) => {
      if (data && data['data']) {
        let res = await data['data'];
        this.NFTData = res;
        if ((this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sWalletAddress == this.showObj.wallet_address) || (this.NFTData.eAuctionType == 'Fixed Sale')) {
          this.showObj.showBidCurrent = 'hide';
        }
        if (this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sWalletAddress == this.showObj.wallet_address) {
          this.showObj.showTransferCurrent = 'show';
        }

        if (this.NFTData.eAuctionType == 'Auction' || this.NFTData.eAuctionType == '' || (this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sWalletAddress == this.showObj.wallet_address)) {
          this.showObj.showBuyCurrent = 'hide';
        }

        if (this.NFTData.auction_end_date != undefined && this.NFTData.auction_end_date != null && this.NFTData.auction_end_date && this.NFTData.auction_end_date != '') {
          this.interVal = setInterval(async () => {
            let currentStarttime: any = new Date().getTime();
            let endDate: any = new Date(this.NFTData.auction_end_date).getTime();

            let diff = parseInt(endDate) - parseInt(currentStarttime)

            // if (diff > 0) {
            //   this.ConvertSectoDay(diff / 1000);
            // }
            if (diff && diff != undefined && diff != null && diff > 0) {

              await this.ConvertSectoDay(diff / 1000)

            }
          }, 2000);
          // auct_time

        }


        if (this.NFTData.nBasePrice && this.NFTData.nBasePrice != undefined) {

          this.buyForm.patchValue({ 'nBidPrice': this.NFTData.nBasePrice['$numberDecimal'] })
        }

        if (this.NFTData.nTokenID && this.NFTData.nTokenID != undefined) {
          // tokenHistoryData
          this.getTokenHistory(this.NFTData.nTokenID);
        }

        // token
        // tokenHistory  nTokenID
      } else {

      }
    }, (error) => {
      if (error) {

      }
    })
  }
  getTokenHistory(id: any) {
    this.apiService.tokenHistory(id, {}).subscribe(async (data: any) => {
      console.log('---tokenHistoryData-----', data)
      if (data && data['data']) {
        let res = await data['data'];
        this.tokenHistoryData = res['data'];



      } else {

      }
    }, (error) => {
      if (error) {

      }
    })
  }

  getBidHistory(id: any) {
    this.apiService.bidHistory(id, {}).subscribe(async (data: any) => {
      console.log('---history-----', data)
      if (data && data['data']) {
        let res = await data['data'];
        this.historyData = res['data'];



      } else {

      }
    }, (error) => {
      if (error) {

      }
    })
  }

  // {{NFTData.nBasePrice && NFTData.nBasePrice != undefined ?
  //   NFTData.nBasePrice['$numberDecimal'] :'-' }} 
  checkBuyQNT(e: any) {
    if (e.target.value) {
      if (parseInt(e.target.value) <= (parseInt(this.NFTData.nQuantity))) {
        this.bidForm.patchValue({ 'nQuantity': parseInt(e.target.value) });

      } else {

        this.bidForm.patchValue({ 'nQuantity': '' });
        this.toaster.info('Amount exceeding NFT quantity.')
      }
    } else {
      this.bidForm.patchValue({ 'nQuantity': '' });
    }

  }
  checkBuyQNTT(e: any) {
    if (e.target.value) {
      if (parseInt(e.target.value) <= (parseInt(this.NFTData.nQuantity))) {
        this.transferForm.patchValue({ 'nQuantity': parseInt(e.target.value) });

      } else {

        this.transferForm.patchValue({ 'nQuantity': '' });
        this.toaster.info('Amount exceeding NFT quantity.')
      }
    } else {
      this.transferForm.patchValue({ 'nQuantity': '' });
    }

  }

  checkBuyBQNT(e: any) {
    if (e.target.value) {
      if (parseFloat(e.target.value) <= (parseInt(this.NFTData.nQuantity))) {

      } else {

        this.buyForm.patchValue({ 'nQuantity': '' });
        this.toaster.info('Amount exceeding NFT quantity.')
      }
    } else {
      this.buyForm.patchValue({ 'nQuantity': '' });
    }

  }
  // nQuantity: ['', [Validators.required]],
  // nBidPrice: ['', [Validators.required]],
  async onClickSubmitBID() {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      this.spinner.show();
      this.submitted1 = true;
      if (this.bidForm.invalid) {
        this.spinner.hide();
        return;
      } else {
        let res = this.bidForm.value;
        if (parseFloat(res.nBidPrice) >= parseFloat(this.NFTData.nBasePrice['$numberDecimal'])) {
          let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
            this.NFTData.nTokenID : 1;
          let price: any = parseFloat(res.nBidPrice) * parseFloat(res.nQuantity);
          let obj = {
            oRecipient: this.NFTData['oCurrentOwner']['_id'],
            eBidStatus: this.NFTData['eAuctionType'] == "Fixed Sale" ? 'Sold' : 'Bid',
            nBidPrice: parseFloat(price),
            nQuantity: res.nQuantity,
            oNFTId: this.NFTData['_id'],
            sTransactionHash: '',
            nTokenID: nTokenID,
            sOwnerEmail: this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sEmail &&
              this.NFTData.oCurrentOwner.sEmail != undefined ?
              this.NFTData.oCurrentOwner.sEmail : '-'
          };
          this.spinner.show();
          var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
          if (NFTinstance && NFTinstance != undefined) {
            this.spinner.hide();

            this.spinner.show();
            console.log(888, nTokenID, obj['nQuantity'], this.NFTData.oCurrentOwner.sWalletAddress, 777, NFTinstance);
            NFTinstance.methods.bid(nTokenID, obj['nQuantity'], this.NFTData.oCurrentOwner.sWalletAddress)
              .send({
                from: this.showObj.wallet_address,
                value: window.web3.utils.toWei(`${obj.nBidPrice}`, 'ether')
              })
              .on('transactionHash', async (hash: any) => {
                obj["sTransactionHash"] = hash;
                console.log(999);
                await this.apiService.bidCreate(obj).subscribe(async (transData: any) => {
                  this.spinner.hide();
                  if (transData && transData['data']) {
                    this.toaster.success('Bid placed successfully', 'Success!');
                    var magnificPopup = $.magnificPopup.instance;
                    // save instance in magnificPopup variable
                    magnificPopup.close();
                    // this.router.navigate(['/my-profile'])
                    await this.router.navigate(['/my-profile'], {
                      relativeTo: this._route,
                      queryParams: {
                        tab: 'bid'
                      },
                    });

                    // this.onClickRefresh();
                  } else {
                    this.toaster.success(transData['message'], 'Success!');
                  }
                })
              })
              .catch((error: any) => {
                this.spinner.hide();

                this.toaster["error"]((error.code == 4001) ? "You Denied MetaMask Transaction Signature" : "Something Went Wrong!");
              });

          } else {
            this.spinner.hide();
            this.toaster.error("There is something issue with NFT address.", 'Error!');

          }
        } else {
          this.spinner.hide();

          this.bidForm.patchValue({ 'nBidPrice': '' });
          this.toaster.info('Please enter minimum & greater then minimum Bid amount.', 'Error!')
        }

      }
    } else {
      console.log(2);
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.')
    }
  }

  onClickRefresh() {
    window.location.reload();
  }


  async onClickSubmitTransfer() {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      this.spinner.show();
      this.submitted2 = true;
      if (this.transferForm.invalid) {
        this.spinner.hide();
        return;
      } else {
        let res = this.transferForm.value;

        let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
          this.NFTData.nTokenID : 1;
        let obj = {
          oRecipient: res.oRecipient,
          eBidStatus: 'Transfer',
          nBidPrice: '0',
          nQuantity: res.nQuantity,
          oNFTId: this.NFTData['_id'],
          sTransactionHash: '',
          nTokenID: nTokenID
        };
        this.spinner.show();
        var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
        if (NFTinstance && NFTinstance != undefined) {
          this.spinner.hide();
          this.spinner.show();
          NFTinstance.methods.transfer(nTokenID, res.oRecipient, obj['nQuantity'])
            .send({
              from: this.showObj.wallet_address
            })
            .on('transactionHash', async (hash: any) => {
              obj["sTransactionHash"] = hash;

              await this.apiService.bidCreate(obj).subscribe(async (transData: any) => {
                this.spinner.hide();
                if (transData && transData['data']) {
                  this.toaster.success('NFT transfered successfully', 'Success!');
                  this.router.navigate(['']);
                  this.onClickRefresh();
                } else {
                  this.toaster.success(transData['message'], 'Success!');
                }
              })
            })
            .catch((error: any) => {
              this.spinner.hide();

              this.toaster["error"]((error.code == 4001) ? "You Denied MetaMask Transaction Signature" : "Something Went Wrong!");
            });

        } else {
          this.spinner.hide();
          this.toaster.error("There is something issue with NFT address.", 'Error!');

        }


      }

    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.')
    }
  }

  async onClickSubmitBUY() {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      this.spinner.show();
      this.submitted3 = true;
      if (this.buyForm.invalid) {
        this.spinner.hide();
        return;
      } else {
        let res = this.buyForm.value;
        console.log('----res----------', res);
        console.log('----this.NFTData.nBasePrice----------', this.NFTData.nBasePrice)

        // if (parseFloat(res.nBidPrice) >= parseFloat(this.NFTData.nBasePrice['$numberDecimal'])) {
        res.nBidPrice = parseFloat(this.NFTData.nBasePrice['$numberDecimal'])
        let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ? this.NFTData.nTokenID : 1;
        let price: any = parseFloat(res.nBidPrice) * parseFloat(res.nQuantity);
        let obj = {
          oRecipient: this.NFTData['oCurrentOwner']['_id'],
          eBidStatus: this.NFTData['eAuctionType'] == "Fixed Sale" ? 'Sold' : 'Bid',
          nBidPrice: parseFloat(price),
          nQuantity: res.nQuantity,
          oNFTId: this.NFTData['_id'],
          sTransactionHash: '',
          nTokenID: nTokenID,
          sOwnerEmail: this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sEmail &&
            this.NFTData.oCurrentOwner.sEmail != undefined ?
            this.NFTData.oCurrentOwner.sEmail : '-'
        };
        this.spinner.show();
        var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
        if (NFTinstance && NFTinstance != undefined) {
          this.spinner.hide();

          this.spinner.show();
          NFTinstance.methods.buyNow(nTokenID, this.NFTData.oCurrentOwner.sWalletAddress, this.showObj.wallet_address, obj['nQuantity'])
            .send({
              from: this.showObj.wallet_address,
              value: window.web3.utils.toWei(`${obj.nBidPrice}`, 'ether')
            })
            .on('transactionHash', async (hash: any) => {
              obj["sTransactionHash"] = hash;

              await this.apiService.bidCreate(obj).subscribe(async (transData: any) => {
                this.spinner.hide();
                if (transData && transData['data']) {
                  this.toaster.success('NFT bought successfully', 'Success!');
                  this.router.navigate(['']);

                  this.onClickRefresh();
                } else {
                  this.toaster.success(transData['message'], 'Success!');
                }
              })
            })
            .catch((error: any) => {

              this.toaster["error"]((error.code == 4001) ? "You Denied MetaMask Transaction Signature" : "Something Went Wrong!");
            });

        } else {
          this.spinner.hide();
          this.toaster.error("There is something issue with NFT address.", 'Error!');

        }
        // } else {
        //   this.spinner.hide();

        //   this.bidForm.patchValue({ 'nBidPrice': '' });
        //   this.toaster.info('Please enter minimum & greater then minimum Bid amount.')
        // }

      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error!')
    }
  }


  async clickAccept(obj: any) {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {


      let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
        this.NFTData.nTokenID : 1;

      let oOptions = {
        sObjectId: obj._id,
        oBidderId: obj.oBidder._id,
        oNFTId: this.NFTData['_id'],
        eBidStatus: 'Accepted',
        sTransactionHash: '',
        sCurrentUserEmail: obj.oBidder && obj.oBidder['sEmail'] && obj.oBidder['sEmail'] != undefined ? obj.oBidder['sEmail'] : '-',
      }

      this.spinner.show();
      var oContract = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
      if (oContract && oContract != undefined) {

        console.log(this.showObj.wallet_address);

        oContract.methods.acceptBid(nTokenID, obj.oBidder.sWalletAddress, obj.nQuantity)
          .send({
            from: this.showObj.wallet_address
          }).on('transactionHash', async (hash: any) => {
            this.spinner.hide();
            oOptions["sTransactionHash"] = hash;
            await this.sendData(oOptions);
            this.router.navigate(['']);

          }).catch((error: any) => {
            this.spinner.hide();

            if (error && error.code == 4001) {
              this.toaster.error(error['message'], 'Error!')
            }
          });
      } else {
        this.spinner.hide();
        this.toaster.error("There is something issue with NFT address.", 'Error!');

      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.')
    }
  }
  async clickReject(obj: any) {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
        this.NFTData.nTokenID : 1;

      let oOptions = {
        sObjectId: obj._id,
        oBidderId: obj.oBidder._id,
        oNFTId: this.NFTData['_id'],
        eBidStatus: 'Rejected',
        sTransactionHash: '',
        sCurrentUserEmail: obj.oBidder && obj.oBidder['sEmail'] && obj.oBidder['sEmail'] != undefined ? obj.oBidder['sEmail'] : '-',
      }

      this.spinner.show();
      var oContract = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
      if (oContract && oContract != undefined) {
        oContract.methods.rejectBid(nTokenID, obj.oBidder.sWalletAddress)
          .send({
            from: this.showObj.wallet_address
          }).on('transactionHash', async (hash: any) => {
            this.spinner.hide();
            oOptions["sTransactionHash"] = hash;
            await this.sendData(oOptions);
            this.router.navigate(['']);

          }).catch((error: any) => {
            this.spinner.hide();
            if (error && error.code == 4001) {
              this.toaster.error(error['message'], 'Error!')
            }

          });
      } else {
        this.spinner.hide();
        this.toaster.error("There is something issue with NFT address.", 'Error!');

      }

    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.')
    }

  }

  async clickCancel(obj: any) {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
        this.NFTData.nTokenID : 1;

      let oOptions = {
        sObjectId: obj._id,
        oBidderId: obj.oBidder._id,
        oNFTId: this.NFTData['_id'],
        eBidStatus: 'Canceled',
        sTransactionHash: ''
      }

      this.spinner.show();
      var oContract = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
      if (oContract && oContract != undefined) {
        oContract.methods.cancelBid(nTokenID, this.NFTData.oCurrentOwner.sWalletAddress)
          .send({
            from: this.showObj.wallet_address
          }).on('transactionHash', async (hash: any) => {
            this.spinner.hide();
            oOptions["sTransactionHash"] = hash;
            await this.sendData(oOptions);
            this.router.navigate(['']);

          }).catch((error: any) => {
            this.spinner.hide();
            if (error && error.code == 4001) {
              this.toaster.error(error['message'], 'Error!')
            }

          });
      } else {
        this.spinner.hide();
        this.toaster.error("There is something issue with NFT address.", 'Error!');

      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error!')
    }
  }

  // nNFTId: 6120eba598b61743cf49a43f
  // sSellingType: Auction
  async toggleSellingType(obj: any) {
    this.spinner.show();
    await this.apiService.toggleSellingType(obj).subscribe(async (transData: any) => {
      this.spinner.hide();
      if (transData && transData['message'] && transData['message'] == 'NFT Details updated') {
        this.toaster.success('Selling Type updated.', 'Success!');

        this.onClickRefresh();
      }
    }, (err: any) => {
      this.spinner.hide();
      if (err) {
        console.log('----------er', err);
        err = err['error'];
        if (err) {
          this.toaster.error(err['message'], 'Error!');

        }
      }

    })
  }

  onClickUpdateType(type: any, id: any) {
    console.log('--------type----------', type, id);
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      if (type && id) {

        let obj = {
          nNFTId: id,
          sSellingType: type
        };

        this.toggleSellingType(obj);
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error')
    }
  }
  async sendData(opt: any) {
    this.spinner.show();
    await this.apiService.toggleBidStatus(opt).subscribe(async (transData: any) => {
      this.spinner.hide();
      if (transData && transData['data']) {
        this.toaster.success('Bid status updated. it will be Reflected once Transaction is mined.', 'Success!');

        this.onClickRefresh();
      } else {
        this.toaster.success(transData['message'], 'Success!');
      }
    })
  }

  clickClose() {
    var magnificPopup = $.magnificPopup.instance;
    // save instance in magnificPopup variable
    magnificPopup.close();
  }

  clickOpen() {

    $.magnificPopup.open({
      items: {
        src: '#modal-tran',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          }
        }
      }
    });

    // $('#modal-tran').magnificPopup('open');

  }

  // --TODO
  async onClickSubmitChangePrice() {

    this.spinner.show();
    this.submitted4 = true;
    if (this.changePriceForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      let resp = this.changePriceForm.value;
      let obj = {
        nNFTId: this.NFTData._id,
        nBasePrice: resp.nBasePrice
      };

      this.spinner.show();
      await this.apiService.updateBasePrice(obj).subscribe(async (transData: any) => {
        console.log('-----------transData----------', transData)
        this.spinner.hide();
        if (transData && transData['message'] && transData['message'] == 'Price updated') {
          this.toaster.success('Price updated.', 'Success!');

          this.onClickRefresh();
        }
      }, (err: any) => {
        this.spinner.hide();
        if (err) {
          console.log('----------er', err);
          err = err['error'];
          if (err) {
            this.toaster.error(err['message'], 'Error!');

          }
        }

      })

    }

  }

  onClickOPENPRICE() {
    $.magnificPopup.open({
      items: {
        src: '#modal-change-price',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          }
        }
      }
    });
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



  //-------------------------- auction_end_date


  onClickOPENAUCTION(type: any, id: any) {

    this.sellingType = type;
    this.id = id;

    $.magnificPopup.open({
      items: {
        src: '#modal-auction',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          }
        }
      }
    });
  }

  onClickSubmitPutonTimeAuction() {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      let obj: any = {
        nNFTId: this.id,
        sSellingType: this.sellingType
      };

      let fd = this.timedAuctionForm.value;

      if (fd && fd.days && fd.days != undefined && fd.days != null && fd.days != '') {
        var dt = new Date();
        dt.setDate(dt.getDate() + parseInt(fd.days));

        obj.auction_end_date = dt
      }

      this.toggleSellingType(obj);
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error')
    }
  }


  ConvertSectoDay(n: any) {
    let day: any = n / (24 * 3600);

    n = n % (24 * 3600);
    let hour: any = n / 3600;

    n %= 3600;
    let minutes: any = n / 60;

    n %= 60;
    let seconds: any = n;

    let a = '';

    if (parseInt(day) != 0) {
      this.auct_time.days = parseInt(day)
    }
    if (parseInt(hour) != 0) {
      this.auct_time.hours = parseInt(hour)
    }
    if (parseInt(minutes) != 0) {
      this.auct_time.mins = parseInt(minutes)
    }
    if (parseInt(seconds) != 0) {
      this.auct_time.secs = parseInt(seconds)
    }
    console.log('------------------------a', this.auct_time)

  }

  // 

  onClickAdd() {

    $.magnificPopup.open({
      items: {
        src: '#modal-add-funds',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          }
        }
      }
    });
  }
}