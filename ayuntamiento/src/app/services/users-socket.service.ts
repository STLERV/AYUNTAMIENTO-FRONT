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

  enviarType5(mensaje, concejal) {

    var newMensaje = {
      name: concejal,
      clave: mensaje
    }

    this.socket.emit('concejal-to-alcalde-type5', newMensaje)
  }

  enviarType6(mensaje) {

    this.socket.emit('alcalde-to-concejal-type6', mensaje)
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

}
