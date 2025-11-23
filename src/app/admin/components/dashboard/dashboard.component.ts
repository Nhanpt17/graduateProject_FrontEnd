import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AdminService } from "./../../service/admin.service";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { HttpClient } from "@angular/common/http";
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    "stt",
    "image",
    "name",
    "description",
    "price",
    "stock",
    "category",
    "actions",
  ];
  products: any = [];
  dataSource = new MatTableDataSource<any>(this.products);
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20];
  length = 0;
  busy = false;
  busyLoading = false;
  // === NEW: trạng thái giờ làm việc ===
  hoursEnabled = true; // bật/tắt áp dụng giờ làm việc
  hoursRule = "09:00-18:00,Mon-Fri"; // rule hiển thị/sửa

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.getAllProducts();
    this.loadMessengerStatus();
  }

  private parseStatus(res: any) {
    if (typeof res === "string") {
      // fallback text: "busy=true; hours.enabled=false; hours.rule=09:00-18:00,Mon-Fri"
      this.busy = /busy\s*=\s*true/i.test(res);
      const mEnabled = res.match(/hours\.enabled\s*=\s*(true|false)/i);
      const mRule = res.match(/hours\.rule\s*=\s*([^\n;]+)/i);
      this.hoursEnabled = mEnabled ? mEnabled[1].toLowerCase() === "true" : this.hoursEnabled;
      this.hoursRule = mRule ? mRule[1].trim() : this.hoursRule;
      return;
    }

    // JSON chuẩn
    if (res && typeof res === "object") {
      if ("busy" in res) {
        this.busy = !!res.busy;
      }
      if ("businessHoursEnabled" in res) {
        this.hoursEnabled = !!res.businessHoursEnabled;
      }
      if ("businessHoursRule" in res) {
        this.hoursRule = (res.businessHoursRule || "").trim();
      }
    }
  }

  loadMessengerStatus() {
    this.busyLoading = true;
    this.adminService.getMessengerStatus().subscribe({
      next: (res: any) => {
        this.parseStatus(res);
        this.busyLoading = false;
      },
      error: () => {
        this.busyLoading = false;
      },
    });
  }

  onToggleBusy(value: boolean) {
    this.busyLoading = true;
    this.adminService.setMessengerBusy(value).subscribe({
      next: (res: any) => {
        this.parseStatus(res);
        this.busyLoading = false;
        this.snackBar.open(
          this.busy ? "Đã bật chế độ BẬN (tự trả lời)." : "Đã tắt chế độ BẬN.",
          "Đóng",
          { duration: 2500 }
        );
      },
      error: (err: any) => {
        this.busyLoading = false;
        this.snackBar.open(err?.error || "Không thể cập nhật trạng thái Messenger", "Đóng", {
          duration: 3000,
          panelClass: "error-snackbar",
        });
      },
    });
  }
  // === NEW: bật/tắt “giờ làm việc” ===
  onToggleHours(value: boolean) {
    this.busyLoading = true;
    this.adminService.setHoursEnabled(value).subscribe({
      next: (res: any) => {
        this.parseStatus(res);
        this.busyLoading = false;
        this.snackBar.open(
          this.hoursEnabled ? "Đã bật áp dụng giờ làm việc." : "Đã tắt áp dụng giờ làm việc.",
          "Đóng",
          { duration: 2500 }
        );
      },
      error: () => (this.busyLoading = false),
    });
  }

  // === NEW: lưu rule giờ làm việc ===
  onSaveHoursRule() {
    const rule = (this.hoursRule || "").trim();
    // chấp nhận "All" hoặc "HH:mm-HH:mm,Mon-Fri"
    const ok = /^All$/i.test(rule) || /^\d{2}:\d{2}-\d{2}:\d{2}(,.*)?$/.test(rule);
    if (!ok) {
      this.snackBar.open('Rule không hợp lệ. Ví dụ: "09:00-18:00,Mon-Fri" hoặc "All"', "Đóng", {
        duration: 3000,
        panelClass: "error-snackbar",
      });
      return;
    }
    this.busyLoading = true;
    this.adminService.setHoursRule(rule).subscribe({
      next: (res: any) => {
        this.parseStatus(res);
        this.busyLoading = false;
        this.snackBar.open("Đã lưu giờ làm việc.", "Đóng", { duration: 2000 });
      },
      error: () => (this.busyLoading = false),
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getDisplayedIndex(index: number): number {
    return index + 1 + (this.paginator?.pageIndex * this.paginator?.pageSize || 0);
  }

  handlePageEvent(event: any) {
    this.length = event.length;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  getAllProducts(): void {
    this.products = [];
    this.adminService.getAllProducts().subscribe((res) => {
      if (Array.isArray(res)) {
        // Kiểm tra res là mảng không

        this.products = res;
        this.dataSource.data = this.products;
        this.length = this.products.length; // Cập nhật tổng số items
      } else {
        this.snackBar.open("Lỗi khi tải dữ liệu sản phẩm", "Đóng", {
          duration: 3000,
          panelClass: "error-snackbar",
        });
      }
    });
  }

  getStockStatusClass(stock: number): string {
    if (stock <= 10) return "stock-low";
    if (stock <= 50) return "stock-medium";
    return "stock-high";
  }

  getStockColor(stock: number): string {
    if (stock <= 10) return "warn";
    if (stock <= 50) return "accent";
    return "primary";
  }

  getStockPercentage(stock: number): number {
    // Giả sử mức tồn kho tối đa là 200 để tính phần trăm
    return Math.min(stock, 200);
  }

  deleteProduct(productId: number): void {
    this.adminService.deleteProduct(productId).subscribe({
      next: () => {
        this.snackBar.open("Xóa sản phẩm thành công!", "Đóng", { duration: 3000 });
        this.getAllProducts();
      },
      error: (err) => {
        const errorMessage = err.error.message || "Có lỗi xảy ra vui lòng thử lại";
        this.snackBar.open(errorMessage, "Đóng", { duration: 3000, panelClass: "error-snackbar" });
      },
    });
  }

  openConfirmDialog(productId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "350px",
      data: { message: "Bạn có chắc chắn muốn xóa không?" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteProduct(productId);
      }
    });
  }
}
