import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TtpSocketService {

  socket;

  constructor() { }

  setupSocketConnection() {
    this.socket = io('http://localhost:9000');
  }

  userIdentify(user) {
    this.socket.emit('usuario', user);

  }

  enviarType1(mensaje){
    this.socket.emit('alcalde-to-ttp-type1', mensaje)

  }

  disconnect(){
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


  

}
