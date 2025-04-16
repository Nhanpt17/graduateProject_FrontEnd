import { CartService } from './../../../services/cart/cart.service';
import { MomoService } from './../../service/momo.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-handle-payment-momo',
  templateUrl: './handle-payment-momo.component.html',
  styleUrls: ['./handle-payment-momo.component.css']
})
export class HandlePaymentMomoComponent implements OnInit{
  result: string ='';
  systemOrderId: string | null = null;

  constructor(private route: ActivatedRoute , private momoService:MomoService, private cartService:CartService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params=>{
      const message = params.get('message');
      const orderId = params.get('orderId'); // Lấy orderId từ URL
      const resultCode = params.get('resultCode');
      const transId = params.get('transId') ||'';
      
       // Lấy phần số phía trước "MOMO"
       if (orderId) {
        this.systemOrderId = orderId.split('MOMO')[0];
        console.log('System Order ID:', this.systemOrderId); // 
       }
      if(resultCode == '0'){
        this.result = 'Thanh toán thành công!';
        this.cartService.clearCart();
        
      }else{
        this.result = 'Thanh toán thất bại: ' + (message || 'Lỗi không xác định');
      }

      if(resultCode){     
         this.momoService.handleAfterPayment(Number(resultCode),Number(this.systemOrderId),transId).subscribe({
          next: (res :any) => {
            if (res  ) {
              console.log("orderdata: ",res);
              this.router.navigate(['/customer/order-history']);
            }
          },
          error: (err) => {
            console.error('Lỗi xử lý sau khi thanh toán Momo', err);
          }
         });
      }


    })
  }

}
