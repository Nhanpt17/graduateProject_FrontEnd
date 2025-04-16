import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Point, Voucher } from 'src/app/models/voucher.model';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';
import { VoucherService } from 'src/app/services/voucher/voucher.service';

@Component({
  selector: 'app-redeem-voucher',
  templateUrl: './redeem-voucher.component.html',
  styleUrls: ['./redeem-voucher.component.css']
})
export class RedeemVoucherComponent implements OnInit{

  voucher!: Voucher;
  customerPoints!: Point;
  customerId = Number(UserstorageService.getUserId());
  pointsRequired!:number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { voucher: Voucher, customerPoints: Point },
  private dialogRef: MatDialogRef<RedeemVoucherComponent>,
  private voucherService: VoucherService,
  private snackBar: MatSnackBar){}

  ngOnInit(): void {
    this.voucher = this.data.voucher;
    this.customerPoints = this.data.customerPoints;
    this.pointsRequired = this.data.voucher.pointsRequired;
  }

  

  redeemWithPoints(): void {
    this.voucherService.redeemWithPoints(this.customerId, this.voucher.id, this.pointsRequired).subscribe({
      next: () => {
        this.snackBar.open(`Đã sử dụng ${this.pointsRequired} điểm để đổi Voucher!`, 'Đóng', { duration: 3000 });
        this.dialogRef.close('success');
      },
      error: (err) => {
        console.log(err.error.message);
        console.log(err);
        this.snackBar.open('Voucher đã hết hạn hoặc Bạn đã từng đổi Voucher này rồi', 'Đóng', { duration: 3000 });
      }
    });
  }

  closeDialog(){
    this.dialogRef.close();
  }
}
