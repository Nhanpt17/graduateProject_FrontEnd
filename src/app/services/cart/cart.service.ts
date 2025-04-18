import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: any[] =[];
  private cartItemCount = new BehaviorSubject<number>(0); // BehaviorSubject theo dõi số lượng sản phẩm
  
  // Observable để component subscribe
  cartItemCount$ = this.cartItemCount.asObservable();

  constructor() { }

  getCart():any[]{
    
    return this.cart;
  }

  addToCart2Para(product:any,quantity:number){
    let existingProduct = this.cart.find(item=> item.id === product.id);
    if(existingProduct){
      existingProduct.quantity +=quantity;
    }else{
      this.cart.push({...product,quantity});
    }
    this.cartItemCount.next(this.cart.length); // Cập nhật giá trị mới cho BehaviorSubject
  }

  addToCart(product:any){
    let existingProduct = this.cart.find(item=> item.id === product.id);
    if(existingProduct){
      existingProduct.quantity +=1;
    }else{
      this.cart.push({...product,quantity:1});
    }
    this.cartItemCount.next(this.cart.length); // Cập nhật giá trị mới cho BehaviorSubject
  }

  /** Giảm số lượng */
  decreaseQuantity(productId: number) {
    let item = this.cart.find(p => p.id === productId);
    if (item) {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
        this.cartItemCount.next(this.cart.length); // Cập nhật giá trị mới cho BehaviorSubject
      }
    }
    
  }

  /** tang số lượng */
  increaseQuantity(productId: number) {
    console.log("productId: ", productId);
    let item = this.cart.find(p => p.id === productId);
    if (item) {
      item.quantity += 1;
      
    }

  }



  removeFromCart(productId:number){
    this.cart= this.cart.filter(p=>p.id !== productId);
    this.cartItemCount.next(this.cart.length); // Cập nhật giá trị mới cho BehaviorSubject

  }

  clearCart(){
    this.cart=[];
    this.cartItemCount.next(this.cart.length); // Cập nhật giá trị mới cho BehaviorSubject

  }

  /** Tính tổng tiền */
  getTotalPrice(): number {
    return this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getItemQuantity():number{
    return this.cart.length;
  }

}
