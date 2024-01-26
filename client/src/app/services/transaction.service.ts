import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../../../../shared/src/types/transaction';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

constructor(private http: HttpClient) {}

  getTransactions() {
    return this.http.get<Transaction>(
      `${environment.baseUrl}/transactions`);
    }
  
  createTransaction(body : string){
    return this.http.post<Transaction>(
      `${environment.baseUrl}/transact`,
      body,
    );

  }
}
