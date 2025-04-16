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
export class PostProductComponent implements OnInit{
  productForm !: FormGroup
  categories : any=[];
  selectedFile!: File | null;
  imagePreview!: string | ArrayBuffer | null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackbar:MatSnackBar,
    private adminService: AdminService
  ){ }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      categoryId:['',[Validators.required]],
      name:['',[Validators.required,Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(1000)]],
      stock: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
      description:['',[Validators.required]]
    });

    this.getAllCategories();
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
    console.log("lay all danh muc");
    this.adminService.getAllCategories().subscribe(res=>{
      console.log("co chay");
      console.log(res);
      this.categories = res;
    })
  }

  addProduct():void{
    if(this.productForm.valid){
      const formData: FormData = new FormData();
      if (this.selectedFile) {
        formData.append('img', this.selectedFile);
      }
      formData.append('categoryId',this.productForm.get('categoryId')?.value);
      formData.append('name',this.productForm.get('name')?.value);
      formData.append('description',this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('stock', this.productForm.get('stock')?.value);
      
      formData.forEach((value, key) => {
        console.log(key + ':', value);
      });
      
      this.adminService.addProduct(formData).subscribe((res)=>{
        if(res.id !=null){
          this.snackbar.open('Thêm sản phẩm thành công!','Đóng',{duration:3000});
          this.router.navigateByUrl('admin/dashboard');
        }
        else{
          this.snackbar.open(res.message,'Đóng',{duration:3000, panelClass:'error-snackbar'});
          
        }
      });

    }
    else{

    }
  }


}
