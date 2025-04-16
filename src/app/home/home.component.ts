import { CartService } from './../services/cart/cart.service';
import { Router } from '@angular/router';
import { CustomerService } from './../services/customer/customer.service';
import { AppComponent } from './../app.component';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../services/product/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  products!: any[];
  featuredProducts!: any[];
  visible: boolean = this.appComponent.isAdminLoggedIn;
  
  @ViewChild('productsSection') productsSection!: ElementRef;

  constructor(
     private appComponent: AppComponent,
     private productService: ProductService,
     private cartService:CartService,
     private router:Router) { }

  ngOnInit(): void {
    //this.getAllProducts();
    this.getFeaturedProducts();
  }

  getAllProducts(): void {
    this.products = [];
    this.productService.getAllProducts().subscribe(res => {
      if (Array.isArray(res)) {  // Kiểm tra res là mảng không
        this.products = res.map((element: any) => ({
          ...element,  // Giữ nguyên các thuộc tính gốc
          processedImg: element.byteImg ? 'data:image/jpeg;base64,' + element.byteImg : null  // Thêm processedImg nếu có byteImg
        }));
      } else {
        console.error("API response is not an array:", res);
      }
    });
  }

  scrollToProducts(): void {
    this.productsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  getFeaturedProducts(): void {
    
    // For now, just take the first 4 products
    this.productService.getAllProducts().subscribe(res => {
      if (Array.isArray(res)) {
        this.featuredProducts = res.slice(0, 4).map((element: any) => ({
          ...element,
          processedImg: element.byteImg ? 'data:image/jpeg;base64,' + element.byteImg : null
        }));
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
    console.log("product: ",product);
    this.cartService.addToCart(product);
  }

  viewProductDetails(productId:number, categoryId:number){
    this.productService.viewProductDetails(productId,categoryId);
  }

}
