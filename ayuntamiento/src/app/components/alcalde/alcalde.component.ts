import { Component, OnInit, ɵConsole } from '@angular/core';
import { TtpSocketService } from '../../services/ttp-socket.service'
import { UsersSocketService } from '../../services/users-socket.service'
import { NgForm } from '@angular/forms';
import * as rsa from 'rsa-scii-upc';
import * as big from 'bigint-crypto-utils';
import * as bigconv from 'bigint-conversion';
import * as HashMap from 'hashmap';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as fs from 'fs';
import * as sha from 'object-sha';
import { LoginService } from 'src/app/services/login.service';
import { Console } from 'console';
import * as sss from 'shamirs-secret-sharing-ts';
import { CommentStmt } from '@angular/compiler';

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

  decreto: any;
  decretoForm: any;
  listaconectados: string[] = [];
  clavesShamir_d: any[] = [];
  clavesShamir_n: any[] = [];
  k: any;
  iv: any;
  key: any;
  Keyexport: any;
  publicKey: any;
  ttpPublicKey: rsa.PublicKey;
  privateKey: any;
  aytoCert: any;
  TTP_PublicKey: any; //////////////////////////no es nada
  concejalPublicKey: any;
  criptogramaDecreto: any;
  decretoAFirmar: any;
  decretoFinal: any;

  type2: any;
  type5: any;

  fileData: File = null;
  certificado: any;

  constructor(private loginService: LoginService, private ttpSocketService: TtpSocketService, private usersSocketService: UsersSocketService, private router: Router, private http: HttpClient) { }

  async ngOnInit() {


    this.listaconectados;




    this.ttpSocketService.setupSocketConnection();
    // this.usersSocketService.setupSocketConnection();

    this.ttpSocketService.userIdentify("alcalde");

    this.usersSocketService.setupSocketConnection();
    // this.usersSocketService.setupSocketConnection();

    this.usersSocketService.userIdentify("alcalde");

    this.usersSocketService.whoIsConnected();

    this.loginService.getAytoCert()
      .subscribe(data => {
        this.aytoCert = data;
        console.log(this.aytoCert)
      })




    this.ttpSocketService.recibirType2()
      .subscribe(async data => {

        this.type2 = data;
        console.log(this.type2.cert)
        this.TTP_PublicKey = await this.extractPubKFromCert(this.type2.cert, this.type2.cert)


        if (this.TTP_PublicKey === null) {
          console.log("No se ha podido verificar que el Issuer haya emitido el certificado correspondiente")

        } else {
          if (await this.verifyHash(this.TTP_PublicKey, this.type2.body, this.type2.pkp) == false) {
            console.log("No se ha podido verificar al emisor del mensaje")
          } else {
            console.log("El mensaje ha sido recibido correctamente por la TTP")
            this.criptogramaDecreto = this.type2.body.msg
          }
        }
      });

    this.usersSocketService.recibirFirmaAyto()
      .subscribe(async data => {

        this.decretoFinal = data 
        console.log

        if(await this.verifyHash(new rsa.PublicKey(bigconv.hexToBigint(this.aytoCert.cert.publicKey.e),bigconv.hexToBigint(this.aytoCert.cert.publicKey.n)),this.decretoFinal.Decreto,this.decretoFinal.Firma_Ayuntamiento) === false){
          console.log("No se ha podido verificar la firma del Ayuntamiento")
        }else{
          console.log("Firma del Ayuntamiento verificada")
        }


        // if (this.TTP_PublicKey === null) {
        //   console.log("No se ha podido verificar que el Issuer haya emitido el certificado correspondiente")

        // } else {
        //   if (await this.verifyHash(this.TTP_PublicKey, this.type2.body, this.type2.pkp) == false) {
        //     console.log("No se ha podido verificar al emisor del mensaje")
        //   } else {
        //     console.log("El mensaje ha sido recibido correctamente por la TTP")
        //     this.criptogramaDecreto = this.type2.body.msg
        //   }
        // }
      });



    this.usersSocketService.recibirType5()
      .subscribe(async (data) => {

        this.type5 = data;

        this.concejalPublicKey = await this.extractPubKFromCert(this.type5.cert, this.aytoCert)

        if (this.concejalPublicKey === null) {
          console.log("No se ha podido verificar que el Issuer haya emitido el certificado correspondiente")

        } else {
          if (await this.verifyHash(this.concejalPublicKey, this.type5.body, this.type5.po) === false) {
            console.log("No se ha podido verificar al emisor del mensaje")
          } else {
            console.log(this.type5.body.msg.d)
            console.log(this.type5.body.msg.n)

            var shamirKey_d;
            var shamirKey_n;

            await this.decrypt(this.key, this.type5.body.msg.d).then(function (plaintext) {
              console.log(plaintext)
              shamirKey_d = plaintext

            });

            await this.decrypt(this.key, this.type5.body.msg.n).then(function (plaintext) {
              console.log(plaintext)
              shamirKey_n = plaintext

            });

            this.clavesShamir_d.push(bigconv.bufToText(shamirKey_d))
            this.clavesShamir_n.push(bigconv.bufToText(shamirKey_n))


            console.log("d", this.clavesShamir_d)
            console.log("n", this.clavesShamir_n)


          }
        }

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

  salir() {


    this.router.navigateByUrl("login");

    M.toast({ html: 'Adeu' })
    this.usersSocketService.salir();
  }

  enviarTTPType1(orden) {

    if (this.certificado == null) {
      M.toast({ html: 'Tienes que cargar el certificado primero' })
    }
    else {
      this.ttpSocketService.enviarType1(this.certificado, this.Keyexport, orden)
    }
  }


  async enviarPeticion(form: NgForm) {

    var orden = form.value.decreto

    if (this.listaconectados.length < 5) {
      M.toast({ html: 'Espera a que todo el mundo esté conectado' })

    }
    else {

      var k;
      var iv = window.crypto.getRandomValues(new Uint8Array(16));
      this.iv = iv;

      await crypto.subtle.generateKey({
        name: "AES-CBC",
        length: 256,
      },
        true,
        ["encrypt", "decrypt"]
      ).then(function (key) {
        k = key;
      });

      this.key = k;

      const exportKeyData = await crypto.subtle.exportKey("raw", k)

      this.Keyexport = exportKeyData;


      this.enviarTTPType1(orden);

    }
  }

  async decrypt(key, ciphertext) {
    return await crypto.subtle.decrypt({
      name: "AES-CBC",
      iv: bigconv.hexToBuf(ciphertext.iv)
    },
      key,
      bigconv.hexToBuf(ciphertext.encryptedData))

  }

  async decryptDecreto(key, ciphertext, iv) {
    console.log(key)
    console.log(ciphertext)
    console.log(iv)

    return await crypto.subtle.decrypt({
      name: "AES-CBC",
      iv: iv
    },
      key,
      ciphertext
    );

  }

  async importKey(key) {
    return await crypto.subtle.importKey(
      'raw',
      key,
      'AES-CBC',
      true,
      ["encrypt", "decrypt"]
    );

  }



  async firmar() {

    var shamir_d_hex;
    var shamir_n_hex;

    if (this.clavesShamir_d.length >= 2 && this.clavesShamir_n.length >= 2) {
      var shamir_d_buffer = sss.combine(this.clavesShamir_d)
      var shamir_n_buffer = sss.combine(this.clavesShamir_n)

      shamir_d_hex = bigconv.bufToText(shamir_d_buffer)
      shamir_n_hex = bigconv.bufToText(shamir_n_buffer)

    } else {
      console.log("No se han llegado al mínimo de aceptaciones")
    }

    var decreto_publicKey = new rsa.PublicKey(bigconv.hexToBigint("10001"), bigconv.hexToBigint(shamir_n_hex))
    var decreto_privateKey = new rsa.PrivateKey(bigconv.hexToBigint(shamir_d_hex), decreto_publicKey)

    // console.log(bigconv.hexToBigint(this.criptogramaDecreto))
    // console.log("decrypt", decreto_privateKey.decrypt(bigconv.hexToBigint(this.criptogramaDecreto)))
    // console.log(bigconv.bigintToText(decreto_privateKey.decrypt(bigconv.hexToBigint(this.criptogramaDecreto))))
    console.log(this.criptogramaDecreto)

    var key = bigconv.bigintToBuf(decreto_privateKey.decrypt(bigconv.hexToBigint(this.criptogramaDecreto.keyDecreto.key)))
    var iv = bigconv.bigintToBuf(decreto_privateKey.decrypt(bigconv.hexToBigint(this.criptogramaDecreto.keyDecreto.iv)))
    var encryptedData = bigconv.hexToBuf(this.criptogramaDecreto.decreto)

    console.log(this.criptogramaDecreto.decreto)

    var keyImported
    var decryptedFinal

    await this.importKey(key).then(async function (kimp) {

      console.log(kimp)
      keyImported = kimp

    })
      .catch(function (err) {
        console.log(err)
      })

    await this.decryptDecreto(keyImported, encryptedData, iv).then(function (plaintext) {
      console.log(JSON.parse(bigconv.bufToText(plaintext)))
      decryptedFinal = JSON.parse(bigconv.bufToText(plaintext))

    })
      .catch(function (err) {
        console.log(err)
      })

    this.decretoAFirmar = decryptedFinal

    if (await this.verifyHash(this.TTP_PublicKey, this.decretoAFirmar.Decreto, this.decretoAFirmar.Verificacion_TTP) === false) {
      console.log("No se ha podido verificar la verificación de la tercera parte de confianza")
    } else {
      var body = {
        Decreto: this.decretoAFirmar.Decreto,
        Verificacion_TTP: this.decretoAFirmar.Verificacion_TTP
      }

      const digest = await this.digestHash(body);
      const firma = bigconv.bigintToHex(decreto_privateKey.sign(bigconv.textToBigint(digest)));

      const bodyToEmit = {
        Decreto: this.decretoAFirmar.Decreto,
        Verificacion_TTP: this.decretoAFirmar.Verificacion_TTP,
        Firma: {
          signature: firma,
          ID_firmador: 'Alcalde'
        }
      }

      this.usersSocketService.AyuntamientoFirma(bodyToEmit)

    }


  }

  async digestHash(body) {
    const d = await sha.digest(body, 'SHA-256');
    return d;
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

  async extractPubKFromCert(cert, issuerCert) {
    const hashBody = await sha.digest(cert.cert, 'SHA-256')
    var issuerPublicKey = new rsa.PublicKey(bigconv.hexToBigint(issuerCert.cert.publicKey.e), bigconv.hexToBigint(issuerCert.cert.publicKey.n))

    console.log(issuerCert)

    if (hashBody == bigconv.bigintToText(issuerPublicKey.verify(bigconv.hexToBigint(cert.signatureIssuer)))) {

      return new rsa.PublicKey(bigconv.hexToBigint(cert.cert.publicKey.e), bigconv.hexToBigint(cert.cert.publicKey.n))

    } else {
      return null
    }

  }

  async verifyHash(PublicKey, body, signature) {
    const hashBody = await sha.digest(body, 'SHA-256')
    var verify = false;

    if (hashBody == bigconv.bigintToText(PublicKey.verify(bigconv.hexToBigint(signature)))) {
      verify = true
    }

    return verify
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

  async hashbody(body) {

    const hash = await sha.digest(body, 'SHA-256');
    return hash;
  }

}










