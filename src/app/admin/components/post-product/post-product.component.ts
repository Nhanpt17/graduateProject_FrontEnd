import { AdminService } from './../../service/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-product',
  templateUrl: './post-product.component.html',
  styleUrls: ['./post-product.component.css']
})
export class PostProductComponent implements OnInit {
  productForm !: FormGroup
  categories: any = [];
  selectedFile!: File | null;
  imagePreview!: string | ArrayBuffer | null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackbar: MatSnackBar,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      categoryId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(1000)]],
      stock: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
      description: ['']
    });

    this.getAllCategories();
  }

  previewImage() {
    if (!this.selectedFile) {
      return; // Nếu không có file nào được chọn, thoát luôn
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result; // gan du lieu cho anh
    }
    reader.readAsDataURL(this.selectedFile);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0]; // lay file dau tien
    this.previewImage();
  }

  getAllCategories(): void {

    this.adminService.getAllCategories().subscribe(res => {

      this.categories = res;
    })
  }

  addProduct(): void {
    if (this.productForm.valid) {
      const formData: FormData = new FormData();
      if (this.selectedFile) {
        formData.append('img', this.selectedFile);
      }
      formData.append('categoryId', this.productForm.get('categoryId')?.value);
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('stock', this.productForm.get('stock')?.value);


      this.adminService.addProduct(formData).subscribe({

        next: () => {
          this.snackbar.open('Thêm sản phẩm thành công!', 'Đóng', { duration: 3000 });
          this.router.navigate(['admin/dashboard'])
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Có lỗi xảy ra khi thêm sản phẩm!';
          this.snackbar.open(errorMessage, 'Đóng', { duration: 3000, panelClass: 'error-snackbar' });
        }

      });

    }
    
  }


}
