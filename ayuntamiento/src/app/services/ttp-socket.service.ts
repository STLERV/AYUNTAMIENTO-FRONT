import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as rsa from 'rsa-scii-upc';
import * as big from 'bigint-crypto-utils';
import * as bigconv from 'bigint-conversion';
import * as sha from 'object-sha';



@Injectable({
  providedIn: 'root'
})
export class TtpSocketService {

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

  socket;

  constructor(private http: HttpClient) { }

  setupSocketConnection() {
    this.socket = io('http://localhost:9000');
  }

  userIdentify(user) {
    this.socket.emit('usuario', user);

  }

  

  enviarType1(mensaje, certificado, Keyexport) {

    this.http.get('assets/certs/AlcaldeCert.json', { responseType: 'text' })
      .subscribe(async data => {

        console.log(JSON.parse(data))

        var publicKey = new rsa.PublicKey(JSON.parse(data).certificate.cert.publicKey.e, JSON.parse(data).certificate.cert.publicKey.n)

        var privateKey = new rsa.PrivateKey(JSON.parse(data).privateKey.d, JSON.parse(data).privateKey.n)

        console.log(publicKey)

        console.log(privateKey)

        var body = { src: 'Alcalde', TTP: 'TTP', dest: 'Concejales', msg: bigconv.bufToHex(Keyexport), type : 1}

        const hash  = await sha.digest(body, 'SHA-256'); 
        const pko = bigconv.bigintToHex(privateKey.sign(bigconv.textToBigint(hash)));
        

        const bodyToEmit = {
          body: body,
          pko: pko
        }

        this.socket.emit('alcalde-to-ttp-type1', bodyToEmit)

      })
  }

  disconnect() {
    this.socket.disconnect();
  }

  recibirType2() {
    let observable = new Observable(observer => {
      this.socket.on('ttp-to-alcalde-type2', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  recibirType4() {
    let observable = new Observable(observer => {
      this.socket.on('ttp-to-concejal-type4', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

//   enviarmensajek(){

//     let observable = new Observable(observer => {
//       this.socket.on('alcalde-to-ttp-type0', (data) => {
//         observer.next(data);
//       });
//       return () => {
//         this.socket.disconnect();
//       };
//     })
//     return observable;


//     return this.http.post(this.URLTTP + '/mensaje3', { mensaje });
  
// } 




dameClaveTTP() {
  
}


}
