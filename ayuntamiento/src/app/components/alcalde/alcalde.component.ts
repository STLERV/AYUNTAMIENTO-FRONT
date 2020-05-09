import { Component, OnInit } from '@angular/core';
import * as rsa from 'rsa-scii-upc/src';
import * as big from 'bigint-crypto-utils';
import * as bigconv from 'bigint-conversion';

@Component({
  selector: 'app-alcalde',
  templateUrl: './alcalde.component.html',
  styleUrls: ['./alcalde.component.css']
})
export class AlcaldeComponent implements OnInit {

  k: any;
  alcaldeprivatek: rsa.PrivateKey;;
  alcaldepublick: rsa.PublicKey;;
  iv: any;
  key: any;
  Keyexport: any;

  constructor() { }

  async ngOnInit() {

    await this.generarclaves();

  }

  async enviarPeticion(mesnaje: string) {


    var k;
    var encrypt;
    var iv = window.crypto.getRandomValues(new Uint8Array(16));
    this.iv = iv;
    var des;
   
    var res: any;
    console.log('mensaje');

    

    await crypto.subtle.generateKey({
      name: "AES-CBC",
      length: 256,
    },
      true,
      ["encrypt", "decrypt"]
    ).then(function (key) {
      console.log(key);
      k = key;
    });

    console.log(k);
    this.key = k;

    const exportKeyData = await crypto.subtle.exportKey("jwk", k)

    this.Keyexport = exportKeyData;




  }


  async generarclaves() {

    const { publicKey, privateKey } = await rsa.generateRandomKeys(3072);
    this.alcaldeprivatek = privateKey;
    this.alcaldepublick = publicKey;
  }

}
