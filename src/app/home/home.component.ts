import { CartService } from "./../services/cart/cart.service";
import { Router } from "@angular/router";

import { AppComponent } from "./../app.component";
import { Component, ElementRef, OnInit, ViewChild, OnDestroy, Renderer2 } from "@angular/core";
import { ProductService } from "../services/product/product.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  products!: any[];
  featuredProducts!: any[];
  visible: boolean = this.appComponent.isAdminLoggedIn;

  @ViewChild("productsSection") productsSection!: ElementRef;

  // 💌 Các biến liên quan đến form đăng ký email
  subscriberEmail: string = "";
  subscribeMessage: string = "";
  baseUrl: string = environment.BASIC_URL;

  constructor(
    private appComponent: AppComponent,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    //this.getAllProducts();
    this.getFeaturedProducts();
  }

  openMessenger(): void {
    // Thay 1 trong 2 dòng dưới bằng thông tin của bạn:
    const url = "https://m.me/940224482507614";
    // const url = 'https://m.me/YOUR_PAGE_ID';

    // Mở tab mới (mobile sẽ tự mở app Messenger nếu có)
    window.open(url, "_blank");
  }

  getAllProducts(): void {
    this.products = [];
    this.productService.getAllProducts().subscribe((res) => {
      if (Array.isArray(res)) {
        // Kiểm tra res là mảng không

        this.products = res;
      } else {
        console.error("API response is not an array:", res);
      }
    });
  }

  scrollToProducts(): void {
    this.productsSection.nativeElement.scrollIntoView({ behavior: "smooth" });
  }

  getFeaturedProducts(): void {
    // For now, just take the first 4 products
    this.productService.getFourNewProdct().subscribe((res) => {
      if (Array.isArray(res)) {
        this.featuredProducts = res;
      }
    });
  }

  buyNow(product: any) {
    if (product.stock <= 0) {
      return;
    }
    this.cartService.addToCart(product);
    this.router.navigate(["/cart"]);
  }

  addToCart(product: any) {
    if (product.stock <= 0) {
      return;
    }

    this.cartService.addToCart(product);
  }

  // viewProductDetails(productId:number, categoryId:number){
  //   this.productService.viewProductDetails(productId,categoryId);
  // }

  viewProductDetails(product: any) {
    const slug = this.slugify(product.name) + "-" + product.id;

    this.router.navigate(["/product", slug]).then(() => {
      // Cuộn lên đầu trang
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Hàm chuyển tên sản phẩm thành slug thân thiện
  slugify(text: string): string {
    return text
      .toString()
      .normalize("NFD") // tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "") // xóa dấu
      .replace(/đ/g, "d") // chuyển đ thường
      .replace(/Đ/g, "d") // chuyển Đ hoa thành d
      .replace(/[^a-zA-Z0-9]+/g, "-") // thay ký tự đặc biệt bằng '-'
      .replace(/^-+/, "") // xóa '-' ở đầu
      .replace(/-+$/, "") // xóa '-' ở cuối
      .replace(/--+/g, "-") // chuyển '--' liên tiếp thành '-'
      .toLowerCase(); // chuyển toàn bộ thành chữ thường
  }

  // 💌 Gửi email từ form đến backend để lưu vào Mailchimp
  subscribeToNewsletter(): void {
    if (!this.subscriberEmail || !this.validateEmail(this.subscriberEmail)) {
      this.subscribeMessage = "❌ Vui lòng nhập email hợp lệ!";
      return;
    }

    this.http
      .post(`${this.baseUrl}api/mailchimp/subscribe`, null, {
        params: { email: this.subscriberEmail },
      })
      .subscribe({
        next: () => {
          this.subscribeMessage = "✅ Đăng ký thành công! Cảm ơn bạn.";
          this.subscriberEmail = "";
        },
        error: (err) => {
          console.error(err);
          this.subscribeMessage = "⚠️ Có lỗi xảy ra. Vui lòng thử lại.";
        },
      });
  }

  // 🔎 Hàm kiểm tra định dạng email
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
}
