import { Component, OnInit } from '@angular/core';
import * as rsa from 'rsa-scii-upc/src';
import * as big from 'bigint-crypto-utils';
import * as bigconv from 'bigint-conversion';


declare var M: any;

@Component({
  selector: 'app-concejal',
  templateUrl: './concejal.component.html',
  styleUrls: ['./concejal.component.css']
})



export class ConcejalComponent implements OnInit {


  concejalprivatek: rsa.PrivateKey;;
  concejalpublick: rsa.PublicKey;;
  Kshamir: any;

  constructor() { }

  async ngOnInit() {

  this.Kshamir =null;
  await this.generarclaves();


  }





async generarclaves() {

  const { publicKey, privateKey } = await rsa.generateRandomKeys(3072);
  this.concejalprivatek = privateKey;
  this.concejalpublick = publicKey;
}

acepto(){

  if (this.Kshamir == null){
    M.toast({ html: 'No hay nada que acceptar aún' })


  }
}
declino(){

  if (this.Kshamir == null){
    M.toast({ html: 'No hay nada que acceptar aún' })
}

}

}
