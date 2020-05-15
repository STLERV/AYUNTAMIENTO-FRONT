import { Component, OnInit } from '@angular/core';
import { TtpSocketService } from '../../services/ttp-socket.service'
import { UsersSocketService } from '../../services/users-socket.service'
import * as rsa from 'rsa-scii-upc/src';
import * as big from 'bigint-crypto-utils';
import * as bigconv from 'bigint-conversion';
import * as HashMap from 'hashmap';

@Component({
  selector: 'app-alcalde',
  templateUrl: './alcalde.component.html',
  styleUrls: ['./alcalde.component.css']
})
export class AlcaldeComponent implements OnInit {

  usuarios: any = new HashMap()
  conectados: any;


  k: any;
  alcaldeprivatek: rsa.PrivateKey;;
  alcaldepublick: rsa.PublicKey;;
  iv: any;
  key: any;
  Keyexport: any;

  type2: any;
  type5: any;

  constructor(private ttpSocketService: TtpSocketService, private usersSocketService: UsersSocketService) { }

  async ngOnInit() {

    await this.generarclaves();

    this.ttpSocketService.setupSocketConnection();
    // this.usersSocketService.setupSocketConnection();

    this.ttpSocketService.userIdentify("alcalde");

    this.usersSocketService.setupSocketConnection();
    // this.usersSocketService.setupSocketConnection();

    this.usersSocketService.userIdentify("alcalde");

    this.usersSocketService.whoIsConnected();


    this.ttpSocketService.recibirType2()
      .subscribe(data => {
        console.log(data)
        this.type2 = data;
      });

    this.usersSocketService.recibirType5()
      .subscribe(data => {
        console.log(data)
        this.type5 = data;
      });

    this.usersSocketService.recibirConectados()
      .subscribe((data: any) => {

        this.conectados = data;

        console.log(this.conectados)


      });


  }

  enviarTTPType1() {
    this.ttpSocketService.enviarType1("type1")
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
