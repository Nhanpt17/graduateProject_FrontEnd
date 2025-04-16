import { Router } from '@angular/router';
import { MomoService } from './../../service/momo.service';
import { OrderService } from './../../service/order.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-payment-stepper-dialog',
  templateUrl: './payment-stepper-dialog.component.html',
  styleUrls: ['./payment-stepper-dialog.component.css']
})
export class PaymentStepperDialogComponent implements OnInit {
  // Dữ liệu các bước
  phoneNumber: string = '';
  address: string = '';
  paymentMethod: string = '';
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<PaymentStepperDialogComponent>,
    private _formBuilder: FormBuilder,
    private orderService: OrderService,
    private momoService:MomoService,
    private router:Router
  ) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      phone: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      address: ['', Validators.required],
    });
    this.thirdFormGroup = this._formBuilder.group({
      payment: ['', Validators.required],
    });
  }

  // Đóng dialog
  closeDialog(): void {
    this.dialogRef.close();
  }

  // Xử lý lưu thông tin sau khi điền xong
  onSave(): void {
    const orderInfo = {
      phoneNumber: this.phoneNumber,
      address: this.address,
      paymentMethod: this.paymentMethod
    };
    // Lưu hoặc gửi thông tin order đến server
    console.log(orderInfo);
    this.dialogRef.close(orderInfo);
  }






  submit() {
    // Kiểm tra từng form
    if (
      this.firstFormGroup.invalid ||
      this.secondFormGroup.invalid ||
      this.thirdFormGroup.invalid
    ) {
      // Đánh dấu tất cả các control là "touched" để hiển thị lỗi
      this.firstFormGroup.markAllAsTouched();
      this.secondFormGroup.markAllAsTouched();
      this.thirdFormGroup.markAllAsTouched();
      return;
    }

    // Nếu hợp lệ thì xử lý submit
    const orderData = {
      customerId: this.data.customerId,
      customerName: this.data.customerName,
      customerEmail: this.data.customerEmail,
      cartItems: this.data.cartItems,
      totalPrice: this.data.totalPrice,
      shippingFee: this.data.shippingFee,
      discountAmount: this.data.discountAmount,
      finalAmount: this.data.finalAmount,
      phone: this.firstFormGroup.value.phone,
      address: this.secondFormGroup.value.address,
      payment: this.thirdFormGroup.value.payment
    };
    console.log('Thông tin giao hàng:', orderData);

    if (this.thirdFormGroup.value.payment == 'cash') {
      this.orderService.createOrder(orderData).subscribe({
        next: (res)=>{
          console.log('Đặt hàng thành công', res);
          this.dialogRef.close({ success: true, order: res });
          this.router.navigate(['/customer/order-history']);
        },
        error:(err)=>{
          console.error('Lỗi khi đặt hàng', err);
          this.dialogRef.close({ success: false, err });
        }
      });
    }else if(this.thirdFormGroup.value.payment == 'momo'){
      // 1. Tạo đơn hàng trạng thái PENDING trước
  this.orderService.createOrder(orderData).subscribe({
    next: (orderRes) => {
      console.log('Tạo đơn hàng tạm thành công', orderRes);
      
      // 2. Gọi API thanh toán Momo với orderId từ đơn hàng vừa tạo
      const amount = String(orderRes.finalAmount); // Chuyển sang đơn vị VND (nếu cần)
      this.momoService.createPayment(amount, orderRes.id).subscribe({
        next: (momoRes :any) => {
          if (momoRes && momoRes.payUrl ) {
            // 3. Chuyển hướng đến Momo
            window.location.href = momoRes.payUrl;
          }
        },
        error: (momoErr) => {
          console.error('Lỗi khi tạo thanh toán Momo', momoErr);
          this.dialogRef.close({ success: false, err: momoErr });
        }
      });
    },
    error: (orderErr) => {
      console.error('Lỗi khi tạo đơn hàng', orderErr);
      this.dialogRef.close({ success: false, err: orderErr });
    }
  });
    }

    // this.dialogRef.close(orderData);
    // Gửi dữ liệu, đóng dialog, v.v...
  }





}
