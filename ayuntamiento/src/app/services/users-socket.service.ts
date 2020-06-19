import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsersSocketService {
  socket;

  constructor() { }

  setupSocketConnection() {
    this.socket = io('http://localhost:3000');
  }

  userIdentify(user) {
    this.socket.emit('usuario', user);

  }

  whoIsConnected(){
    this.socket.emit('conectados');
  }

  enviarType5(mensaje) {


    this.socket.emit('concejal-to-alcalde-type5', mensaje)
  }

  enviarType5Declined(mensaje) {


    this.socket.emit('concejal-to-alcalde-type5Declined', mensaje)
  }

  enviarType6(mensaje) {

    this.socket.emit('alcalde-to-concejal-type6', mensaje)
  }

  AyuntamientoFirma(mensaje) {

    this.socket.emit('AyuntamientoFirmaDecreto', mensaje)
  }

  recibirType5() {
    let observable = new Observable(observer => {
      this.socket.on('concejal-to-alcalde-type5', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  recibirType6() {
    let observable = new Observable(observer => {
      this.socket.on('concejal-to-alcalde-type6', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  recibirType5Declined() {
    let observable = new Observable(observer => {
      this.socket.on('concejal-to-alcalde-type5Declined', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }


  recibirConectados() {
    let observable = new Observable(observer => {
      this.socket.on('conectados', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  recibirFirmaAyto() {
    let observable = new Observable(observer => {
      this.socket.on('AyuntamientoFirmaDecreto', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  salir(){

    this.socket.disconnect();
  }

}
