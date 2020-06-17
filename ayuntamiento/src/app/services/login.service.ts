import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { User } from '../models/user';
@Injectable({
  providedIn: 'root'
})
export class LoginService {

 user: User;
 readonly URL_API = 'http://localhost:3000';
 
  constructor(private http: HttpClient) { 
  }

   
  login(name: string, pass: string) {
    console.log("name: " + name)
    console.log("pass: " + pass)
    const user = {
    name : name,
    pass : pass
    }
    return this.http.post(this.URL_API + '/login ', user);
  }

  getAytoCert(){
    return this.http.get(this.URL_API + '/AytoCert')
  }
      
  }


