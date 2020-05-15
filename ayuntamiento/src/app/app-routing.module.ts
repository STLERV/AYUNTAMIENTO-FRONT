import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from '../app/components/login/login.component';
import {AlcaldeComponent} from '../app/components/alcalde/alcalde.component';
import {ConcejalComponent} from '../app/components/concejal/concejal.component';

const routes: Routes = [

  {path: 'login', component: LoginComponent},
  {path: 'alcalde', component: AlcaldeComponent},
  {path: 'concejal', component: ConcejalComponent},
  {path: '', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
