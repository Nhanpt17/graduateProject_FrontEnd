import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from 'src/app/customer/service/order.service';
import { OrderStatus } from 'src/app/models/order-status.enum';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';

@Component({
  selector: 'app-delivery-history',
  templateUrl: './delivery-history.component.html',
  styleUrls: ['./delivery-history.component.css']
})
export class DeliveryHistoryComponent {
  orders: any[] = [];
  displayedColumns: string[] = ['id', 'customer', 'address', 'deliveryTime', 'status', 'actions'];
  orderStatus = OrderStatus;
  
  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const userId = Number(UserstorageService.getUserId());
    this.orderService.getOrdersByDeliveryStaff(userId).subscribe({
      next: (orders) => {
        // Lọc chỉ hiển thị đơn hàng đã hoàn thành
        this.orders = orders.filter(order => order.status === OrderStatus.COMPLETED);
      },
      error: (err) => {
        // this.snackBar.open('Error loading orders', 'Close', { d;uration: 3000 })
        console.log('Lỗi khi tải dữ liệu đơn hàng')
      }
    });
  }

  getStatusText(status: string): string {
    const statusText: {[key: string]: string} = {
      'COMPLETED': 'Đã hoàn thành'
    };
    return statusText[status] || status;
  }
  
  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
