import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../../../../shared/src/types/transaction';
import { environment } from '../../environments/environment';
import { Auth } from '@angular/fire/auth';
import { catchError, from, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

constructor(private http: HttpClient,
  private auth: Auth) {}

  getTransactions(token:string,userId:string) {
    return this.http.get<Transaction[]>(`${environment.baseUrl}/transactions/${userId}`,{headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)});
    }
  
  createTransaction(token:string,itemId : string){
    console.log(token);
        return this.http.post<Transaction>(
          `${environment.baseUrl}/transact/${itemId}`,{},{ headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)}
        );
  }
}
