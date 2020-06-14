import { Component, OnInit } from '@angular/core';
import { TtpSocketService } from '../../services/ttp-socket.service'
import { UsersSocketService } from '../../services/users-socket.service'
import * as rsa from 'rsa-scii-upc';
import * as big from 'bigint-crypto-utils';
import * as bigconv from 'bigint-conversion';
import * as HashMap from 'hashmap';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as fs from 'fs';
import * as sha from 'object-sha';

declare var M: any;

@Component({
  selector: 'app-alcalde',
  templateUrl: './alcalde.component.html',
  styleUrls: ['./alcalde.component.css']
})
export class AlcaldeComponent implements OnInit {


  
    /*
    SI QUEREIS COGER DATOS DEL CERTIFICADO YA SEA PARA FIMRAR, VERIFICAR, ENCRYPTAR ETC O PARA ENVIARSELO A ALGUIEN TENEIS QUE UTILIZAR EL SIGUIENTE CÓDIGO:

    this.http.get('assets/certs/AlcaldeCert.json', {responseType: 'text'})
    .subscribe(async data => {

      console.log(JSON.parse(data))

      var publicKey = new rsa.PublicKey(JSON.parse(data).certificate.cert.publicKey.e, JSON.parse(data).certificate.cert.publicKey.n )

      var privateKey = new rsa.PrivateKey(JSON.parse(data).privateKey.d, publicKey)

      console.log(publicKey)

      console.log(privateKey)

      AHORA AQUI DEBERÍAS DE PONER EL CODIGO CORRESPONDIENTE PARA ENVIAR EL MENSAJE CON LA CLAVE PUBLICA, HAY QUE HACERLO DENTRO DE ESTE SUBSCRIBE  
      
      HAY UN EJEMPLO EN TTP-SOCKET-SERVICE EN TYPE1


  */

  usuarios: any = new HashMap()
  conectados: any;


  listaconectados: string[] = [];
  k: any;
  iv: any;
  key: any;
  Keyexport: any;
  publicKey: any;
  ttpPublicKey:  rsa.PublicKey;
  privateKey: any;
  TTP_PublicKey: any; //////////////////////////no es nada

  type2: any;
  type5: any;

  fileData: File = null;
  certificado: any;

  constructor(private ttpSocketService: TtpSocketService, private usersSocketService: UsersSocketService, private router: Router, private http: HttpClient) { }

  async ngOnInit() {


    this.listaconectados;


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

        this.conectados.forEach(element => {
          this.listaconectados.push(element)
        });

      });


  }

  Salir() {


    this.router.navigateByUrl("login");

    M.toast({ html: 'Adeeu' })
    this.usersSocketService.salir();
  }

  enviarTTPType1() {

    if(this.certificado == null)
    {    M.toast({ html: 'Tienes que cargar el certificado primero' })
  }
    else {
      this.ttpSocketService.enviarType1("type1", this.certificado, this.Keyexport)
    }
  }

  async enviarPeticion() {

    if(this.listaconectados.length < 5)
    {
        M.toast({ html: 'Espera a que todo el mundo esté conectado' })

    }
    else {

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

    const exportKeyData = await crypto.subtle.exportKey("raw", k)

    this.Keyexport = exportKeyData;


    this.enviarTTPType1();

  }
}

  test(){

    this.http.get('assets/certs/AlcaldeCert.json', {responseType: 'text'})
    .subscribe(async data => {

      console.log(JSON.parse(data))

      var publicKey = new rsa.PublicKey(JSON.parse(data).certificate.cert.publicKey.e, JSON.parse(data).certificate.cert.publicKey.n )

      var privateKey = new rsa.PrivateKey(JSON.parse(data).privateKey.d, publicKey)

      console.log(publicKey)

      console.log(privateKey)

      publicKey.verify("ejemplo")
    
      
    });
  }

  //recoger y guardar el certificado


  async fileProgress(event: any) {

    const fileContent = await this.fileGetContent(event);

    interface MyCert {
      certificate: {
        cert: {
          publicKey: {
            e: BigInt,
            n: BigInt
          },
          IssuerID: string
        },
        signatureIssuer: BigInt
      },
      privateKey: { d: BigInt, n: BigInt }
    };

    let MyCertJson: MyCert = JSON.parse(fileContent);
    this.certificado = MyCertJson;

    console.log(MyCertJson.certificate.cert.publicKey.e);
    M.toast({ html: 'Certificado cargado' })


  }


  async fileGetContent(event: any) {
    return new Promise<string>((resolve, reject) => {

      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
          console.log(reader.result);
          const results = reader.result.toString();
          resolve(results);

        }
        reader.readAsText(event.target.files[0]);
      }
    });
  }




//   async enviarK(){
//     var midate = new Date();
//     var body = { src: 'A', TTTP: 'TTP', dest: 'B', msg: this.Keyexport, type : 1}

    
//     const hash = await  this.hashbody(body);
//     const pko = bigconv.bigintToHex(this.privateKey.sign(bigconv.textToBigint(hash)));

//     this.ttpSocketService.enviarmensajek({body, pko})

    
// .subscribe(async (res: any) => {
//   const hashBody = await sha.digest(res.body, 'SHA-256');
 
//   if (hashBody == bigconv.bigintToText(this.ttpPublicKey.verify(bigconv.hexToBigint(res.pkp)))) {
//     console.log(res.body)

    
  
//   } else {
//     console.log("ui")

//   }
// });

//   }

  async hashbody(body){

    const hash  = await sha.digest(body, 'SHA-256'); 
    return hash;
  }

}







 


