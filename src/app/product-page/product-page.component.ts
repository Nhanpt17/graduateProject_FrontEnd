import { CartService } from "./../services/cart/cart.service";
import { Router } from "@angular/router";

import { Component, OnInit } from "@angular/core";
import { ProductService } from "../services/product/product.service";

declare var gtag: any;

@Component({
  selector: "app-product-page",
  templateUrl: "./product-page.component.html",
  styleUrls: ["./product-page.component.css"],
})
export class ProductPageComponent implements OnInit {
  selectedCategory: any = { id: null, name: "Tất cả" };
  categories: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  paginatedProducts: any[] = []; // Sản phẩm sau khi phân trang
  pageSize: number = 8; // Số lượng sản phẩm mỗi trang
  currentPage: number = 0; // Trang hiện tại

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getAllCategories();
    this.getAllProducts();
  }

  getAllCategories() {
    this.productService.getAllCategories().subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.categories = [{ id: null, name: "Tất cả" }, ...res];
        } else {
          console.error("API categories response is not an array:", res);
        }
      },
      error: (err) => console.error("Error fetching categories:", err),
    });
  }

  getAllProducts(): void {
    this.products = [];
    this.productService.getAllProducts().subscribe((res) => {
      if (Array.isArray(res)) {
        // Kiểm tra res là mảng không

        this.products = res;
        this.filteredProducts = [...this.products];
        this.updatePagination(); // Cập nhật lại phân trang khi dữ liệu mới được lấy
      } else {
        console.error("API response is not an array:", res);
      }
    });
  }

  filterProducts() {
    if (this.selectedCategory.id === null || !this.selectedCategory) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        (product) => product.categoryId === this.selectedCategory.id
      );
    }
    this.currentPage = 0;
    this.updatePagination(); // Cập nhật lại phân trang khi lọc sản phẩm
  }

  buyNow(product: any) {
    this.cartService.addToCart(product);

    // 👇 Gửi event begin_checkout lên GA4
    if (typeof gtag === "function") {
      gtag("event", "begin_checkout", {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    this.router.navigate(["/cart"]);
  }

  addToCart(product: any) {
    if (product.stock <= 0) {
      return; // Không cho thêm vào giỏ nếu hết hàng
    }

    this.cartService.addToCart(product);

    // 👇 Gửi event add_to_cart lên GA4
    if (typeof gtag === "function") {
      gtag("event", "add_to_cart", {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: 1,
      });
    }
  }

  // viewProductDetails(productId:number, categoryId:number){
  //   this.productService.viewProductDetails(productId,categoryId);
  // }

  viewProductDetails(product: any) {
    const slug = this.slugify(product.name) + "-" + product.id;
    this.router.navigate(["/product", slug]);
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

  updatePagination() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
  }

  pageChanged(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }
}
