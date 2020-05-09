import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login.service'
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


declare var M: any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  constructor(private loginservice: LoginService, private router: Router) { }

  ngOnInit(): void {


  }


  login(name :string, pass: string) {



    this.loginservice.login(name,pass)
      .subscribe((res) => {
        console.log(res)

        if (res["data"] == null) {
          M.toast({ html: 'Ese usuario no existe' })

        } else if (res["data"] != null) {

          M.toast({ html: 'Very good login' })

          if(res["data"]["id"] == 'alcalde'){

            this.router.navigateByUrl("alcalde");

          }

        }
      }), (error) => { console.log(error) }

  }
} 





