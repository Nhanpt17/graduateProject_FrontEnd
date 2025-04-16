import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private BASIC_URL = environment.BASIC_URL;

  constructor(private http:HttpClient,private router:Router) { }
 

  


}
