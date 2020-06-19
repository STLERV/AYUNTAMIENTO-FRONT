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
import { Observable, Observer } from 'rxjs';
import { typeWithParameters } from '@angular/compiler/src/render3/util';

declare var M: any;

@Component({
  selector: 'app-alcalde',
  templateUrl: './alcalde.component.html',
  styleUrls: ['./alcalde.component.css']
})
export class AlcaldeComponent implements OnInit {


  usuarios: any = new HashMap()
  conectados: any;

  decreto: any;
  decretoForm: any;
  listaconectados: string[] = [];
  clavesShamir_d: any[] = [];
  clavesShamir_n: any[] = [];
  peticionesDeclined: any[] = [];
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
    this.ttpSocketService.userIdentify("alcalde");

    this.usersSocketService.setupSocketConnection();

    this.usersSocketService.userIdentify("alcalde");

    this.usersSocketService.whoIsConnected();

    this.loginService.getAytoCert()
      .subscribe(data => {
        this.aytoCert = data;
      })




    this.ttpSocketService.recibirType2()
      .subscribe(async data => {

        this.type2 = data;
        this.TTP_PublicKey = await this.extractPubKFromCert(this.type2.cert, this.type2.cert)


        if (this.TTP_PublicKey === null) {
          console.log("No se ha podido verificar que el Issuer haya emitido el certificado correspondiente")

        } else {
          if (await this.verifyHash(this.TTP_PublicKey, this.type2.body, this.type2.pkp) == false) {
            console.log("No se ha podido verificar al emisor del mensaje")
          } else {
            console.log("El mensaje ha sido recibido correctamente por la TTP")
            this.criptogramaDecreto = this.type2.body.msg
            M.toast({ html: "La TTP confirma la recepción de tu petición y has recibido el criptograma del decreto" })
            console.log("Criptograma decreto",this.criptogramaDecreto)

          }
        }
      });

    this.usersSocketService.recibirFirmaAyto()
      .subscribe(async data => {

        this.decretoFinal = data

        this.clavesShamir_d = [];
        this.clavesShamir_n = [];
        this.peticionesDeclined = [];
        this.type2 = null
        this.type5 = null

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

            var shamirKey_d;
            var shamirKey_n;

            await this.decrypt(this.key, this.type5.body.msg.d).then(function (plaintext) {
              shamirKey_d = plaintext

            });

            await this.decrypt(this.key, this.type5.body.msg.n).then(function (plaintext) {
              shamirKey_n = plaintext

            });

            this.clavesShamir_d.push(bigconv.bufToText(shamirKey_d))
            this.clavesShamir_n.push(bigconv.bufToText(shamirKey_n))

            M.toast({ html: this.type5.body.src + " ha aprobado la firma, has recibido y almacenado su parte de la clave" })
            console.log("Propuesta aprobada por " + this.type5.body.src, this.type5)

            var publicKey = new rsa.PublicKey(bigconv.hexToBigint(this.certificado.certificate.cert.publicKey.e), bigconv.hexToBigint(this.certificado.certificate.cert.publicKey.n))
            var privateKey = new rsa.PrivateKey(bigconv.hexToBigint(this.certificado.privateKey.d), publicKey)
      
            var ts = new Date();

            var body = {
              type: '6',
              src: this.type5.body.src,
              dest: 'Alcalde',
              ts: ts.toUTCString()
            }
      
            const digest = await this.digestHash(body);
            const po = bigconv.bigintToHex(privateKey.sign(bigconv.textToBigint(digest)));
      
            const bodyToEmit = {
              body: body,
              pr: po,
              cert: this.certificado.certificate
            }
      
            this.usersSocketService.enviarType6(bodyToEmit)
      



            if (this.clavesShamir_d.length == 2) {
              M.toast({ html: "Ha habido un acuerdo entre los concejales, ya puedes firmar!" })

            }



          }
        }

      });

    this.usersSocketService.recibirType5Declined()
      .subscribe(async (data) => {

        this.type5 = data;

        this.concejalPublicKey = await this.extractPubKFromCert(this.type5.cert, this.aytoCert)

        if (this.concejalPublicKey === null) {
          console.log("No se ha podido verificar que el Issuer haya emitido el certificado correspondiente")

        } else {
          if (await this.verifyHash(this.concejalPublicKey, this.type5.body, this.type5.po) === false) {
            console.log("No se ha podido verificar al emisor del mensaje")
          } else {

            this.peticionesDeclined.push(this.type5.body.src)

            M.toast({ html: this.type5.body.src + " ha rechazado la firma" })
            console.log("Propuesta rechazada por " + this.type5.body.src, this.type5)


            if (this.peticionesDeclined.length == 3) {
              M.toast({ html: "No ha habido acuerdo entre los concejales, Se rechaza el decreto" })

            }


          }
        }

      });



    this.usersSocketService.recibirConectados()
      .subscribe((data: any) => {

        this.listaconectados = []
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

  reset() {
    window.location.reload();
  }

  async verificar() {

    if (await this.verifyHash(new rsa.PublicKey(bigconv.hexToBigint(this.aytoCert.cert.publicKey.e), bigconv.hexToBigint(this.aytoCert.cert.publicKey.n)), this.decretoFinal.Decreto, this.decretoFinal.Firma_Ayuntamiento) === false) {
      console.log("No se ha podido verificar la firma del Ayuntamiento")
      M.toast({ html: "No se ha podido verificar la firma del Ayuntamiento" })

    } else {
      console.log("Firma del Ayuntamiento verificada")
      M.toast({ html: "Firma del Ayuntamiento verificada" })

      var x = {
        Decreto: this.decretoFinal.Decreto.Decreto,
        Verificacion_TTP: this.decretoFinal.Decreto.Verificacion_TTP
      }
      var decreto_publicKey = new rsa.PublicKey(bigconv.hexToBigint(this.decretoFinal.Decreto.Decreto.decreto_publickey.e), bigconv.hexToBigint(this.decretoFinal.Decreto.Decreto.decreto_publickey.n))

      if (await this.verifyHash(decreto_publicKey, x, this.decretoFinal.Decreto.Firma.signature) === false) {
        console.log("No se ha podido verificar la firma del decreto")
        M.toast({ html: "No se ha podido verificar la firma del decreto" })
      } else {
        console.log("Firma del Decreto verificada")
        M.toast({ html: "Firma del Decreto verificada" })


        if (await this.verifyHash(this.TTP_PublicKey, this.decretoFinal.Decreto.Decreto, this.decretoFinal.Decreto.Verificacion_TTP) === false) {
          console.log("No se ha podido verificar la firma de la TTP")
          M.toast({ html: "No se ha podido verificar la firma de la TTP" })
        } else {
          console.log("Firma de la TTP verificada")
          M.toast({ html: "Firma de la TTP verificada" })

        }
      }



    }


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

      var decreto_publicKey = new rsa.PublicKey(bigconv.hexToBigint("10001"), bigconv.hexToBigint(shamir_n_hex))
      var decreto_privateKey = new rsa.PrivateKey(bigconv.hexToBigint(shamir_d_hex), decreto_publicKey)

      console.log("Recuperada la clave privada para firmar  ", decreto_privateKey)



      var key = bigconv.bigintToBuf(decreto_privateKey.decrypt(bigconv.hexToBigint(this.criptogramaDecreto.keyDecreto.key)))
      var iv = bigconv.bigintToBuf(decreto_privateKey.decrypt(bigconv.hexToBigint(this.criptogramaDecreto.keyDecreto.iv)))
      var encryptedData = bigconv.hexToBuf(this.criptogramaDecreto.decreto)


      var keyImported
      var decryptedFinal

      await this.importKey(key).then(async function (kimp) {

        keyImported = kimp

      })
        .catch(function (err) {
          console.log(err)
        })

      await this.decryptDecreto(keyImported, encryptedData, iv).then(function (plaintext) {
        decryptedFinal = JSON.parse(bigconv.bufToText(plaintext))

      })
        .catch(function (err) {
          console.log(err)
        })

      this.decretoAFirmar = decryptedFinal

      console.log("Descifrado el criptograma del decreto  ", this.decretoAFirmar)


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

        console.log("Firmado el decreto")
        M.toast({ html: 'Firmado el decreto!' })


      }


    } else {
      console.log("No se han llegado al mínimo de aceptaciones")
      M.toast({ html: "Aún no ha habido acuerdo, estate a la espera" })

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

    if (MyCertJson.certificate.cert.ID != "alcalde"){
      M.toast({ html: 'Este certificado no te corresponde' })
    }else{
      this.certificado = MyCertJson;
      M.toast({ html: 'Certificado cargado' })
    }
    




  }


  async fileGetContent(event: any) {
    return new Promise<string>((resolve, reject) => {

      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
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



  async hashbody(body) {

    const hash = await sha.digest(body, 'SHA-256');
    return hash;
  }

}










