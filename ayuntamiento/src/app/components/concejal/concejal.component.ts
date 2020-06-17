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




declare var M: any;

@Component({
  selector: 'app-concejal',
  templateUrl: './concejal.component.html',
  styleUrls: ['./concejal.component.css']
})



export class ConcejalComponent implements OnInit {

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


  listaconectados: string[] = [];
  concejalName: any;
  concejalprivatek: rsa.PrivateKey;;
  concejalpublick: rsa.PublicKey;;
  type3: any = null;
  fileData: File = null;

  certificado: any;

  conectados: any;

  TTP_PublicKey: any;

  constructor(private route: ActivatedRoute, private ttpSocketService: TtpSocketService, private usersSocketService: UsersSocketService, private router: Router) {

  }

  async ngOnInit() {

    this.concejalName = this.route.snapshot.paramMap.get('name');
    this.listaconectados;




    await this.generarclaves();


    this.ttpSocketService.setupSocketConnection();
    this.usersSocketService.setupSocketConnection();

    this.ttpSocketService.userIdentify(this.concejalName);
    this.usersSocketService.userIdentify(this.concejalName);

    this.usersSocketService.whoIsConnected();



    this.ttpSocketService.recibirType3()
      .subscribe(async data => {

        //verificaciones corresponientes del proof

        this.usersSocketService.enviarType6("type6");

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

            this.ttpSocketService.enviarType4(this.concejalName, this.certificado)

          }
        }



      });

    this.usersSocketService.recibirConectados()
      .subscribe((data: any) => {

        //verificaciones corresponientes del proof

        this.conectados = data;

        console.log(this.conectados);

        this.conectados.forEach(element => {
          this.listaconectados.push(element)
        });


      });

  }

  async generarclaves() {

    const { publicKey, privateKey } = await rsa.generateRandomKeys(3072);
    this.concejalprivatek = privateKey;
    this.concejalpublick = publicKey;
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

    }
  }

  Salir() {
    this.usersSocketService.salir();
    this.router.navigateByUrl("login");

    M.toast({ html: 'Adeeu' })
  }

  declino() {
    if (this.certificado == null) {
      M.toast({ html: 'Primero tienes que cargar el certificado' })

    }
    else {
      if (this.type3 == null) {
        M.toast({ html: 'No hay nada que acceptar aún' })
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
    this.certificado = MyCertJson;

    console.log(MyCertJson.certificate.cert.publicKey.e);
    M.toast({ html: 'Certificado cargado' })


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

  async digestHash(body) {
    const d = await sha.digest(body, 'SHA-256');
    return d;
  }


}
