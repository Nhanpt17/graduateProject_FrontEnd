import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderService } from '../../service/order.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-detail-dialog',
  templateUrl: './order-detail-dialog.component.html',
  styleUrls: ['./order-detail-dialog.component.css']
})
export class OrderDetailDialogComponent implements OnInit{
  constructor(@Inject(MAT_DIALOG_DATA) public order:any, private orderService: OrderService,private snackBar: MatSnackBar) {}
  
  orderDetail:any ={};
  
  ngOnInit(): void {
    this.loadOrderById(this.order.id);
  }

  loadOrderById(orderID:number){
    this.orderService.getOrderById(orderID).subscribe({
      next: (res:any) => {
        this.orderDetail = res.order;
        if (res.deliveryName) {
          this.orderDetail.deliveryName = res.deliveryName;
        }
      },
      error: () => {
        this.snackBar.open('Error loading order details', 'Close', { duration: 3000 });
      }
    });
  }


  getStatusText(status: string): string {
    const statusTexts: {[key: string]: string} = {
      'PENDING': 'Đang chờ xử lý',
      'PLACED': 'Đã đặt hàng',
      'DELIVERING': 'Đang giao hàng',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusTexts[status] || status;
  }
  
  getPaymentStatusText(status?: string): string {
    if (!status) return '--';
    
    const statusTexts: {[key: string]: string} = {
      'PENDING': 'Chờ thanh toán',
      'PAID': 'Đã thanh toán',
      'FAILED': 'Thanh toán thất bại',
      'REFUNDED': 'Đã hoàn tiền'
    };
    return statusTexts[status] || status;
  }

}
