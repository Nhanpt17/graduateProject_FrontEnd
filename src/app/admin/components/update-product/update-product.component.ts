import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent implements OnInit{

  productId!:string|null;

  productForm !: FormGroup
  categories : any=[];
  selectedFile!: File | null;
  imagePreview!: string | ArrayBuffer | null;
  existingImage: string | null = null;

  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackbar:MatSnackBar,
    private adminService: AdminService){}

  ngOnInit(): void {
      this.route.paramMap.subscribe(params=>{
        this.productId = params.get('id');
        
      });

      this.productForm = this.formBuilder.group({
        categoryId:['',[Validators.required]],
        name:['',[Validators.required,Validators.minLength(3)]],
        price: ['', [Validators.required, Validators.min(1000)]],
        stock: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
        description:['']
      });
  
      this.getAllCategories();
      this.getProductById(Number(this.productId));
  }

  getProductById(id:number):void{
    this.adminService.getProductById(id).subscribe(res =>{
       // Cập nhật giá trị vào form
       this.productForm.patchValue({
        categoryId: res.categoryId,
        name: res.name,
        price: res.price,
        stock: res.stock,
        description: res.description
        
      });

      this.imagePreview = res.imgUrl;
    
    });
  }

  previewImage(){
    if (!this.selectedFile) {
      
      return; // Nếu không có file nào được chọn, thoát luôn
    }

    const reader = new FileReader();
    reader.onload=()=>{
      this.imagePreview = reader.result; // gan du lieu cho anh
    }
    reader.readAsDataURL(this.selectedFile);
  }

  onFileSelected(event: any){
    this.selectedFile = event.target.files[0]; // lay file dau tien
    this.previewImage();
  }

  getAllCategories():void{
   
    this.adminService.getAllCategories().subscribe(res=>{
      
      this.categories = res;
    })
  }

  updateProduct():void{
    if(this.productForm.valid){
      const formData: FormData = new FormData();
      
      formData.append('id',String(this.productId));
      if (this.selectedFile) {
        formData.append('img', this.selectedFile);
      }else if (this.imagePreview && typeof this.imagePreview === 'string') {
        // Nếu không chọn file mới, gửi lại URL ảnh cũ (Cloudinary)
        formData.append('imgUrl', this.imagePreview);
      }

      formData.append('categoryId',this.productForm.get('categoryId')?.value);
      formData.append('name',this.productForm.get('name')?.value);
      formData.append('description',this.productForm.get('description')?.value);
      formData.append('price',this.productForm.get('price')?.value);
      formData.append('stock', this.productForm.get('stock')?.value);

      console.log('form data: ', formData);
      
      this.adminService.updateProduct(formData).subscribe({
        next: () => {
          this.snackbar.open('Cập nhật  thành công!', 'Đóng', { duration: 3000 });
          this.router.navigate(['admin/dashboard'])
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Có lỗi xảy ra khi cập nhật!';
          this.snackbar.open(errorMessage, 'Đóng', { duration: 3000, panelClass: 'error-snackbar' });
        }

      });

    }
    
  }


  

}
