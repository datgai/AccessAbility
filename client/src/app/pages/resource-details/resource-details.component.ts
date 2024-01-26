import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from '../../../../../shared/src/types/user';
import { LoaderComponent } from '../../components/loader/loader.component';
import {
  ResourceDetails,
  ResourcesService,
} from '../../services/resources.service';
import { UserStoreService } from '../../services/user-store.service';
import { GooglePayButtonModule } from '@google-pay/button-angular';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../../../../shared/src/types/transaction';

@Component({
  selector: 'app-resource-details',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    MarkdownPipe,
    MarkdownModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    GooglePayButtonModule,
  ],
  templateUrl: './resource-details.component.html',
  styleUrl: './resource-details.component.css',
})
export class ResourceDetailsComponent implements OnInit {
  public resource = signal<ResourceDetails | undefined>(undefined);
  public transactions:Transaction[] = [];
  public resourceId = this.route.snapshot.paramMap.get('id');

  constructor(
    private resourcesService: ResourcesService,
    private transactionService : TransactionService,
    private auth: Auth,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    public userStore: UserStoreService,
  ) {
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();
      
      this.transactionService.getTransactions(token,this.userStore.user!.uid).subscribe({
        next: transactions => this.transactions = transactions,
        error: (err) => console.error(err),
      })});
  }

  ngOnInit() {
    const resourceId = this.route.snapshot.paramMap.get('id');
    if (!resourceId) return this.router.navigate(['404']);

    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();

      this.resourcesService.getResourceById(resourceId, token).subscribe({
        next: (resource) => this.resource.set(resource),
        error: (error: HttpErrorResponse) => {
          if (error.status === 403) return this.router.navigate(['404']);
          return this.toastr.error(error.error.message || error.message);
        },
      });
    });
    return;
  }

  formatDate(date: Date | undefined): string {
    return (date ? new Date(date) : new Date()).toLocaleDateString();
  }

  checkItemBought(transactions:Transaction[], itemId:string){
    for (var transaction of transactions){
      if(transaction.itemId == itemId){
        return true;
      }
    }
    return false;
  }

  async onVerification(event: SubmitEvent) {
    if (!this.resource()) return;

    const token = await this.auth.currentUser?.getIdToken();
    if (!token) return;

    if (this.userStore.user?.profile.role !== UserRole.ADMIN) return;

    const submitter = event.submitter as HTMLInputElement;
    const formData = new FormData();

    if (submitter.value === 'Verify') {
      formData.set('verified', 'true');
      return this.resourcesService
        .editResource(token, this.resource()!.id, formData)
        .subscribe({
          next: (response) => this.toastr.success(response.message),
          complete: () => this.ngOnInit(),
        });
    }

    return this.resourcesService
      .deleteResource(token, this.resource()!.id)
      .subscribe({
        next: (response) => this.toastr.success(response.message),
        complete: () => this.router.navigate(['resources']),
      });
  }

  get price() {
    if (!this.resource()) return 'FREE';
    return String(this.resource()!.price) === '0.00'
      ? 'FREE'
      : `RM ${this.resource()?.price}`;
  }

  onLoadPaymentData = (
    event: Event): void => {
      const eventDetail = event as CustomEvent<google.payments.api.PaymentData>;
      console.log('load payment data', eventDetail.detail);
      // window.location.reload();
    }

    onPaymentDataAuthorized: google.payments.api.PaymentAuthorizedHandler = (
      paymentData
    ) => {
      console.log('payment authorized', paymentData);
      
      this.auth.onAuthStateChanged(async (user) => {
        if (!user) return;
        const token = await user.getIdToken();
        
        this.transactionService.createTransaction(token,this.route.snapshot.paramMap.get('id')!).subscribe()
      });
      return {
        transactionState: 'SUCCESS'
      }
    }

    onError = (event: ErrorEvent): void => {
      console.error('error', event.error);
    }
}
