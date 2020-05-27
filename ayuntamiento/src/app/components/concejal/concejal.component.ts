import { Component, OnInit } from '@angular/core';
import { TtpSocketService } from '../../services/ttp-socket.service'
import { UsersSocketService } from '../../services/users-socket.service'
import * as rsa from 'rsa-scii-upc/src';
import * as big from 'bigint-crypto-utils';
import * as bigconv from 'bigint-conversion';
import { ActivatedRoute, Router } from '@angular/router';



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
  Kshamir: any;
  type4: any;

  conectados: any;

  constructor(private route: ActivatedRoute, private ttpSocketService: TtpSocketService, private usersSocketService: UsersSocketService, private router: Router) {

  }

  async ngOnInit() {

    this.concejalName = this.route.snapshot.paramMap.get('name');
    this.listaconectados;




    this.Kshamir = null;
    await this.generarclaves();


    this.ttpSocketService.setupSocketConnection();
    this.usersSocketService.setupSocketConnection();

    this.ttpSocketService.userIdentify(this.concejalName);
    this.usersSocketService.userIdentify(this.concejalName);

    this.usersSocketService.whoIsConnected();

    
    this.ttpSocketService.recibirType4()
    .subscribe(data => {

      //verificaciones corresponientes del proof

      console.log(data)
      this.type4 = data;

      this.usersSocketService.enviarType6("type6");


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

  acepto() {

    this.usersSocketService.enviarType5(this.type4,this.concejalName)

    if (this.Kshamir == null) {
      M.toast({ html: 'No hay nada que acceptar aún' })


    }
  }
  
  Salir(){
    this.usersSocketService.salir();
    this.router.navigateByUrl("login");
   
    M.toast({ html: 'Adeeu' })
  }

  declino() {

    if (this.Kshamir == null) {
      M.toast({ html: 'No hay nada que acceptar aún' })
    }

  }

}
