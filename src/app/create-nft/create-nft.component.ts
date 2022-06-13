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
  selector: 'app-create-nft',
  templateUrl: './create-nft.component.html',
  styleUrls: ['./create-nft.component.css']
})
export class CreateNFTComponent implements OnInit {

  profileData: any;

  collectionList: any = [];
  categoriesList: any = [];
  collaboratorList: any = [];
  form: any = 'NFT';

  createNFTForm: any;
  submitted3: Boolean = false;
  file: any;

  createCollectionForm: any;
  submitted1: Boolean = false;
  nftFile: any;


  createCollaboratorForm: any;
  submitted2: Boolean = false;


  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) { }
  clickSetForm(type: any) {
    this.form = type;
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

    this._script.loadScripts("app-create-nft", scripts).then(function () {

    })
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      this.buildCreateCollectionForm();
      this.buildCreateCollaboratorForm();
      this.buildCreateNFTForm();



      await this.getProfile();
      await this.getCollectionList();
      await this.getCategories();
      await this.getColoboraterList();

    } else {
      this.toaster.success('Please signin first.');
      this.router.navigate([''])
    }

  }


  buildCreateCollectionForm() {

    this.createCollectionForm = this._formBuilder.group({
      sName: ['', [Validators.required]],
      sDescription: ['', [Validators.required]],
      sFile: ['', []]
    });
  }

  buildCreateCollaboratorForm() {

    this.createCollaboratorForm = this._formBuilder.group({
      sFullname: ['', [Validators.required]],
      sAddress: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
    });
  }


  buildCreateNFTForm() {

    this.createNFTForm = this._formBuilder.group({
      sName: ['', [Validators.required]],
      sCollection: ['', []],
      eType: ['Image', [Validators.required]],
      nQuantity: ['', [Validators.required]],
      sNftdescription: ['', [Validators.required]],
      // 'Auction', 'Fixed Sale', 'Unlockable'
      eAuctionType: ['Auction', [Validators.required]],
      nBasePrice: ['', [Validators.required]],
      // TODO multiple
      sCollaborator: ['', []],
      nCollaboratorPercentage: ['', []],
      sSetRoyaltyPercentage: ['', []],
      nftFile: ['', []],
    });
  }
  onClickRadio(type: any) {
    if (type == 'Auction' || 'Fixed Sale') {
      this.createNFTForm.controls['nBasePrice'].clearValidators();
      this.createNFTForm.controls['nBasePrice'].updateValueAndValidity();
    } else {
      this.createNFTForm.controls['nBasePrice'].setValidators([Validators.required]);
      this.createNFTForm.controls['nBasePrice'].updateValueAndValidity();
    }

  }
  getProfile() {
    this.apiService.getprofile().subscribe(async (res: any) => {
      if (res && res['data']) {
        this.profileData = await res['data'];
        this.profileData.sProfilePicUrl = this.profileData.sProfilePicUrl == undefined ? 'assets/img/avatars/avatar5.jpg' : 'https://decryptnft.mypinata.cloud/ipfs/' + this.profileData.sProfilePicUrl;
        this.profileData.sFirstname = this.profileData && this.profileData.oName && this.profileData.oName.sFirstname ? this.profileData.oName.sFirstname : '';
        this.profileData.sLastname = this.profileData && this.profileData.oName && this.profileData.oName.sLastname ? this.profileData.oName.sLastname : '';



        var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);

        if (NFTinstance && NFTinstance != undefined) {


          // let nAdminCommissionPercentage = await NFTinstance.methods.getAdminCommissionPercentage().call({ from: this.profileData.sWalletAddress });
          // console.log("nAdminCommissionPercentage: " + nAdminCommissionPercentage);
          // // mintToken(bool,string,string,uint256,uint8,address[],uint8[])
          // let nEstimatedGasLimit = await NFTinstance.methods.mintToken(true, 'QmT1omejnb9vnAzpyZbVec7tNmM4GfbZZXpoKv4VVU6iGW', 'MARIO NFT', 10, 5, [
          //   "0x79647CC2A785B63c2A7A5D324b2D15c0CA17115D",
          //   "0x5138d8D462DC20b371b5df7588099e46d8c177A3"
          // ], [
          //   '3',
          //   '97'
          // ]).estimateGas({
          //   from: '0x5138d8D462DC20b371b5df7588099e46d8c177A3',
          //   value: 1
          // });
          // console.log("nEstimatedGasLimit: " + nEstimatedGasLimit);

          // let nGasPrice = parseInt(await window.web3.eth.getGasPrice());
          // console.log("nGasPrice: " + nGasPrice);

          // let nTotalTransactionCost = nGasPrice * nEstimatedGasLimit;
          // console.log("nTotalTransactionCost: " + nTotalTransactionCost);

          // let nAdminCommission = (nTotalTransactionCost * nAdminCommissionPercentage) / 100;
          // console.log("nAdminCommission: " + nAdminCommission);
          // console.log();


          // const that = this;

          // await NFTinstance.methods.mintToken(true, 'QmT1omejnb9vnAzpyZbVec7tNmM4GfbZZXpoKv4VVU6iGW', 'MARIO NFT', 10, 5, [
          //   "0x79647CC2A785B63c2A7A5D324b2D15c0CA17115D",
          //   "0x5138d8D462DC20b371b5df7588099e46d8c177A3"
          // ], [
          //   3,97

          // ])
          //   .send({
          //     from: this.profileData.sWalletAddress
          //   })
          //   .on('transactionHash', async (hash: any) => {
          //     this.spinner.hide();
          //     console.log(hash);

          //   })
          //   .catch(function (error: any) {
          //     that.spinner.hide();
          //     console.log(error);
          //     if (error.code == 32603) {
          //       that.toaster.error("You're connected to wrong network!");
          //     }
          //     if (error.code == 4001) {
          //       that.toaster.error("You Denied Transaction Signature");
          //     }
          //   });

        } else {
          this.spinner.hide();
          this.toaster.error("There is something issue with NFT address.",'Error!');

        }



      }
    }, (err: any) => {
    });
  }

  getCollectionList() {
    this.apiService.getCollectionList().subscribe((res: any) => {
      if (res && res['data']) {
        this.collectionList = res['data'];
      }
    }, (err: any) => {
    });
  }


  getCategories() {
    this.apiService.getCategories().subscribe((res: any) => {
      if (res && res['data']) {
        this.categoriesList = res['data'].aCategories;
      }
    }, (err: any) => {
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

  onSelectDocumentNFT(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|mp3|gif)$/)) {
        this.file = event.target.files[0];
      }
    }
  }
  onSelectDocumentCollection(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|mp3|gif)$/)) {
        this.nftFile = event.target.files[0];
      }
    }
  }

  onClickSubmitCollection() {
    if (this.nftFile && this.nftFile != undefined) {

      this.spinner.show();
      this.submitted1 = true;
      if (this.createCollectionForm.invalid) {
        this.spinner.hide();
        return;
      } else {

        let res = this.createCollectionForm.value;
        var fd = new FormData();

        fd.append('sName', res.sName);
        fd.append('sDescription', res.sDescription);
        fd.append('nftFile', this.nftFile);


        this.apiService.createCollection(fd).subscribe((updateData: any) => {
          this.spinner.hide();

          if (updateData && updateData['data']) {
            this.toaster.success(updateData['message'],'Success!')
            this.onClickRefresh();
          } else {

          }

        }, (err: any) => {
          this.spinner.hide();
          if (err && err['message']) {
            err = err['error'];
            this.toaster.error(err['message'],'Error!')

          }
        });
      }
    } else {
      this.toaster.warning('Please select image.','Error!')
    }


  }
  onClickSubmitCollaborator() {

    this.spinner.show();
    this.submitted2 = true;
    if (this.createCollaboratorForm.invalid) {
      this.spinner.hide();
      return;
    } else {

      let res = this.createCollaboratorForm.value;
      var fd = {
        'sFullname': res.sFullname,
        'sAddress': res.sAddress,
      }

      this.apiService.createCollaborator(fd).subscribe((updateData: any) => {
        this.spinner.hide();

        if (updateData && updateData['data']) {
          this.toaster.success(updateData['message'],'Success!')
          this.onClickRefresh();
        } else {

        }

      }, (err: any) => {
        this.spinner.hide();
        if (err && err['message']) {
          err = err['error'];
          this.toaster.error(err['message'],'Error!')

        }
      });
    }
  }

  async onClickSubmitNFT() {
    if (this.file && this.file != undefined) {

      this.spinner.show();
      this.submitted3 = true;
      if (this.createNFTForm.invalid) {
        this.spinner.hide();
        return;
      } else {

        let res = this.createNFTForm.value;

        // // 'Auction', 'Fixed Sale', 'Unlockable'
        // // TODO multiple

        var fd = new FormData();
        fd.append('nftFile', this.file);
        fd.append('sName', res.sName);
        fd.append('sCollection', res.sCollection);
        fd.append('eType', res.eType);
        fd.append('nQuantity', res.nQuantity);
        // 
        if (res.sCollaborator && res.sCollaborator != undefined && res.sCollaborator != null) {
          fd.append('sCollaborator', res.sCollaborator + ',' + this.profileData.sWalletAddress);
        } else {
          fd.append('sCollaborator', this.profileData.sWalletAddress);
        }
        if (res.nCollaboratorPercentage && res.nCollaboratorPercentage != undefined && res.nCollaboratorPercentage != null) {
          fd.append('nCollaboratorPercentage', res.nCollaboratorPercentage + ',' + (100 - parseFloat(res.nCollaboratorPercentage)));
        } else {
          fd.append('nCollaboratorPercentage', '0');
        }

        fd.append('sSetRoyaltyPercentage', res.sSetRoyaltyPercentage ? res.sSetRoyaltyPercentage : 0);
        fd.append('sNftdescription', res.sNftdescription);
        fd.append('eAuctionType', res.eAuctionType);

        if (res.eAuctionType == 'Auction' || res.eAuctionType == 'Fixed Sale') {
          fd.append('nBasePrice', res.nBasePrice ? res.nBasePrice : 0);
        }else{
          fd.append('nBasePrice',  '0.000001' );
        }
        // 
        await this.apiService.createNFT(fd).subscribe(async (data: any) => {
          this.spinner.hide();
          if (data && data['data']) {
            let returnData = await data['data'];
            this.spinner.show();
            var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);

            if (NFTinstance && NFTinstance != undefined) {
              this.spinner.hide();

              let nAdminCommissionPercentage = await NFTinstance.methods.getAdminCommissionPercentage().call({ from: this.profileData.sWalletAddress });
              // console.log("nAdminCommissionPercentage: " + nAdminCommissionPercentage);

              let nEstimatedGasLimit = await NFTinstance.methods.mintToken(parseInt(returnData.nQuantity) > 1 ? true : false, returnData.sHash, returnData.sName, parseInt(returnData.nQuantity), returnData.sSetRroyalityPercentage, returnData.sCollaborator, returnData.nCollaboratorPercentage).estimateGas({
                from: this.profileData.sWalletAddress,
                value: 1
              });
              // console.log("nEstimatedGasLimit: " + nEstimatedGasLimit);

              let nGasPrice = parseInt(await window.web3.eth.getGasPrice());
              // console.log("nGasPrice: " + nGasPrice);

              let nTotalTransactionCost = nGasPrice * nEstimatedGasLimit;
              // console.log("nTotalTransactionCost: " + nTotalTransactionCost);

              let nAdminCommission = (nTotalTransactionCost * nAdminCommissionPercentage) / 100;
              // console.log("nAdminCommission: " + nAdminCommission);

              const that = this;
              this.spinner.show();
              await NFTinstance.methods.mintToken(parseInt(res.nQuantity) > 1 ? true : false, returnData.sHash, res.sName, parseInt(res.nQuantity), returnData.sSetRroyalityPercentage, returnData.sCollaborator, returnData.nCollaboratorPercentage)
                .send({
                  from: this.profileData.sWalletAddress,
                  value: nAdminCommission,
                  gas: nEstimatedGasLimit
                })
                //     .then(async (successData: any) => {
                //       // 

                //       this.spinner.hide();
                //       console.log(successData);
                //       let oDataToPass = {
                //         nNFTId: returnData._id,
                //         sTransactionHash: successData['transactionHash'],
                //         nTokenID: successData && successData.events && successData.events.TokenCounter && successData.events.TokenCounter.returnValues['0']
                //       };

                //       console.log(oDataToPass);
                //       this.spinner.show();
                //       await this.apiService.setTransactionHash(oDataToPass).subscribe(async (transData: any) => {
                //         this.spinner.hide();
                //         if (transData && transData['data']) {
                //           this.toaster.success('NFT created successfully');
                //           this.onClickRefresh();
                //         } else {
                //           this.toaster.success(transData['message']);
                //         }

                //       })

                // })

                .on('transactionHash', async (hash: any) => {
                  this.spinner.hide();
                  console.log(hash);
                  let oDataToPass = {
                    nNFTId: returnData._id,
                    sTransactionHash: hash
                  };
                  const that = this;
                  console.log(oDataToPass);
                  this.spinner.show();
                  await this.apiService.setTransactionHash(oDataToPass).subscribe(async (transData: any) => {
                    this.spinner.hide();
                    if (transData && transData['data']) {
                      that.toaster.success('NFT created successfully. it will be Reflected Once Transaction is mined.','Success!');
                      // that.router.navigate(['/marketplace']);
                      await this.router.navigate(['/my-profile'], {
                        relativeTo: this._route,
                        queryParams: {
                          tab: 'created'
                        },
                      });
                      // that.onClickRefresh();
                    } else {
                      this.toaster.success(transData['message'],'Success!');
                    }
                  })
                }).catch(function (error: any) {
                  that.spinner.hide();
                  console.log(error);
                  if (error.code == 32603) {
                    that.toaster.error("You're connected to wrong network!",'Error!');
                  }
                  if (error.code == 4001) {
                    that.toaster.error("You Denied Transaction Signature",'Error!');
                  }
                });


              console.log();
            } else {
              this.spinner.hide();
              this.toaster.error("There is something issue with NFT address.",'Error!');

            }
          } else {
            this.spinner.hide();
          }
        }, (error) => {
          this.spinner.hide();
          if (error && error['message']) {
            error = error['error'];
            this.toaster.error(error['message'],'Error!')

          }
        })

      }
    } else {
      this.toaster.warning('Please select image.','Error!')
    }

  }

  onKeyupFIXNumber(e: any, type: any) {
    if (type == 'quantity') {

      if (e.target.value) {
        this.createNFTForm.patchValue({ nQuantity: parseInt(e.target.value) })
      } else {
        this.createNFTForm.patchValue({ nQuantity: '' })

      }
    }

    if (type == 'percentage') {

      if (e.target.value) {

        if (parseInt(e.target.value) < 100) {
          this.createNFTForm.patchValue({ nCollaboratorPercentage: parseInt(e.target.value) })

        } else {
          this.toaster.warning('Max value allowed 100.');
          this.createNFTForm.patchValue({ nCollaboratorPercentage: '' })

        }
      } else {
        this.createNFTForm.patchValue({ nCollaboratorPercentage: '' })
      }
    }

  }

  onClickRefresh() {
    window.location.reload();
  }

}
