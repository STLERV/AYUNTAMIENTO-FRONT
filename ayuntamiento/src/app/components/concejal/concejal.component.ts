import { Component, OnInit } from '@angular/core';
import { TtpSocketService } from '../../services/ttp-socket.service'
import { UsersSocketService } from '../../services/users-socket.service'
import * as rsa from 'rsa-scii-upc/src';
import * as big from 'bigint-crypto-utils';
import * as bigconv from 'bigint-conversion';
import { ActivatedRoute, Router } from '@angular/router';
import { knownFolders, Folder, File } from "tns-core-modules/file-system";
import { timingSafeEqual } from 'crypto';
import * as fs from 'fs';
import * as sha from 'object-sha';
import { LoginService } from 'src/app/services/login.service';




declare var M: any;

@Component({
  selector: 'app-concejal',
  templateUrl: './concejal.component.html',
  styleUrls: ['./concejal.component.css']
})



export class ConcejalComponent implements OnInit {

  conectados: any;
  listaconectados: string[] = [];
  concejalName: any;
  concejalprivatek: rsa.PrivateKey;;
  concejalpublick: rsa.PublicKey;;
  type3: any = null;
  type6: any = null;
  fileData: File = null;
  decretoFinal: any;
  aytoCert: any;

  certificado: any;


  TTP_PublicKey: any;

  constructor(private route: ActivatedRoute, private loginService: LoginService, private ttpSocketService: TtpSocketService, private usersSocketService: UsersSocketService, private router: Router) {

  }

  async ngOnInit() {

    this.listaconectados;
    this.concejalName = this.route.snapshot.paramMap.get('name');







    this.ttpSocketService.setupSocketConnection();
    this.usersSocketService.setupSocketConnection();

    this.ttpSocketService.userIdentify(this.concejalName);
    this.usersSocketService.userIdentify(this.concejalName);

    this.usersSocketService.whoIsConnected();

    this.loginService.getAytoCert()
      .subscribe(data => {
        this.aytoCert = data;
      })



    this.ttpSocketService.recibirType3()
      .subscribe(async data => {

        //verificaciones corresponientes del proof

        this.type3 = data;
        this.TTP_PublicKey = await this.extractPubKFromCert(this.type3.cert, this.type3.cert)


        if (this.TTP_PublicKey === null) {
          console.log("No se ha podido verificar que el Issuer haya emitido el certificado correspondiente")
          this.type3 = null;
        } else {
          if (await this.verifyHash(this.TTP_PublicKey, this.type3.body, this.type3.po) == false) {
            console.log("No se ha podido verificar al emisor del mensaje")
            this.type3 = null;

          } else {
            console.log("He recibido mi parte de la clave privada del Decreto solicitado para firmar por parte del Alcalde")
            M.toast({ html: 'Has recibido tu parte de la clave privada del decreto ¿Lo apruebas?' })
            console.log("He recibido la parte de clave privada que me toca", this.type3)

            this.ttpSocketService.enviarType4(this.concejalName, this.certificado)

          }
        }



      });

    this.usersSocketService.recibirType6()
      .subscribe(async data => {

        //verificaciones corresponientes del proof

        this.type6 = data;
        var alcaldePublicKey = await this.extractPubKFromCert(this.type6.cert, this.aytoCert)


        if (alcaldePublicKey === null) {
          console.log("No se ha podido verificar que el Issuer haya emitido el certificado correspondiente")
          this.type3 = null;
        } else {
          if (await this.verifyHash(alcaldePublicKey, this.type6.body, this.type6.pr) == false) {
            console.log("No se ha podido verificar al emisor del mensaje")
            this.type3 = null;

          } else {
            console.log("El alcalde me confirma la recepción de mi parte aceptada", this.type6)
            M.toast({ html: 'El Alcalde me confirma la recepción de mi parte aceptada' })

          }
        }



      });

    this.usersSocketService.recibirConectados()
      .subscribe((data: any) => {

        this.listaconectados = []
        this.conectados = data;


        this.conectados.forEach(element => {
          this.listaconectados.push(element)
        });

      });




    this.usersSocketService.recibirFirmaAyto()
      .subscribe(async data => {

        this.type3 = null
        this.decretoFinal = data

      });



  }



  async acepto() {

    if (this.certificado == null) {
      M.toast({ html: 'Primero tienes que cargar el certificado' })

    } else if (this.type3 === null) {
      M.toast({ html: 'Aún no has recibido ninguna clave' })

    }
    else {

      var ts = new Date();

      var publicKey = new rsa.PublicKey(bigconv.hexToBigint(this.certificado.certificate.cert.publicKey.e), bigconv.hexToBigint(this.certificado.certificate.cert.publicKey.n))
      var privateKey = new rsa.PrivateKey(bigconv.hexToBigint(this.certificado.privateKey.d), publicKey)


      var body = {
        type: '5',
        src: this.concejalName,
        dest: 'Alcalde',
        msg: this.type3.body.msg,
        ts: ts.toUTCString()
      }

      const digest = await this.digestHash(body);
      const po = bigconv.bigintToHex(privateKey.sign(bigconv.textToBigint(digest)));

      const bodyToEmit = {
        body: body,
        po: po,
        cert: this.certificado.certificate
      }

      this.usersSocketService.enviarType5(bodyToEmit)
      M.toast({ html: 'Acepto el decreto' })

      this.type3 = null

    }
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


  async Salir() {

    if (this.type3 != null) {
      await this.declino(true)

    } else {
      this.usersSocketService.salir();
      this.router.navigateByUrl("login");

      M.toast({ html: 'Adeeu' })
    }


  }

  async declino(salir?) {

    if (this.certificado == null) {
      M.toast({ html: 'Primero tienes que cargar el certificado' })

    } else if (salir && this.certificado != null) {
      var ts = new Date();

      var publicKey = new rsa.PublicKey(bigconv.hexToBigint(this.certificado.certificate.cert.publicKey.e), bigconv.hexToBigint(this.certificado.certificate.cert.publicKey.n))
      var privateKey = new rsa.PrivateKey(bigconv.hexToBigint(this.certificado.privateKey.d), publicKey)


      var body = {
        type: '5',
        src: this.concejalName,
        dest: 'Alcalde',
        msg: "Declined",
        ts: ts.toUTCString()
      }

      const digest = await this.digestHash(body);
      const po = bigconv.bigintToHex(privateKey.sign(bigconv.textToBigint(digest)));

      const bodyToEmit = {
        body: body,
        po: po,
        cert: this.certificado.certificate
      }

      this.usersSocketService.enviarType5Declined(bodyToEmit)
      this.type3 = null

      this.usersSocketService.salir();
      this.router.navigateByUrl("login");

      M.toast({ html: 'Adeeu' })


    }
    else {
      if (this.type3 == null) {
        M.toast({ html: 'No hay nada que acceptar aún' })
      } else {
        var ts = new Date();

        var publicKey = new rsa.PublicKey(bigconv.hexToBigint(this.certificado.certificate.cert.publicKey.e), bigconv.hexToBigint(this.certificado.certificate.cert.publicKey.n))
        var privateKey = new rsa.PrivateKey(bigconv.hexToBigint(this.certificado.privateKey.d), publicKey)


        var body = {
          type: '5',
          src: this.concejalName,
          dest: 'Alcalde',
          msg: "Declined",
          ts: ts.toUTCString()
        }

        const digest = await this.digestHash(body);
        const po = bigconv.bigintToHex(privateKey.sign(bigconv.textToBigint(digest)));

        const bodyToEmit = {
          body: body,
          po: po,
          cert: this.certificado.certificate
        }

        this.usersSocketService.enviarType5Declined(bodyToEmit)
        this.type3 = null



      }
    }
  }


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

    if (MyCertJson.certificate.cert.ID != this.concejalName) {
      M.toast({ html: 'Este certificado no te corresponde' })
    } else {
      this.certificado = MyCertJson;
      M.toast({ html: 'Certificado cargado' })
    }





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

  async digestHash(body) {
    const d = await sha.digest(body, 'SHA-256');
    return d;
  }


}
