import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from '../app/components/login/login.component';
import {AlcaldeComponent} from '../app/components/alcalde/alcalde.component'


const routes: Routes = [

  {path: 'login', component: LoginComponent},
  {path: 'alcalde', component: AlcaldeComponent},
  {path: '', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
