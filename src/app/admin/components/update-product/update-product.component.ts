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
        console.log("img: ",this.imagePreview);
      });

      this.productForm = this.formBuilder.group({
        categoryId:['',[Validators.required]],
        name:['',[Validators.required,Validators.minLength(3)]],
        price: ['', [Validators.required, Validators.min(1000)]],
        stock: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
        description:['',[Validators.required]]
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

      // Nếu có ảnh, cập nhật ảnh preview
      if (res.byteImg) {
        this.imagePreview = 'data:image/jpeg;base64,' + res.byteImg;
        this.existingImage = res.byteImg; // Lưu lại ảnh hiện tại
      }
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
    console.log("lay all danh muc");
    this.adminService.getAllCategories().subscribe(res=>{
      console.log("co chay");
      console.log(res);
      this.categories = res;
    })
  }

  updateProduct():void{
    if(this.productForm.valid){
      const formData: FormData = new FormData();
      
      formData.append('id',String(this.productId));
      if (this.selectedFile) {
        formData.append('img', this.selectedFile);
      }else if (this.existingImage) {
        // Nếu không chọn file mới nhưng có ảnh cũ, gửi lại ảnh cũ
        const blob = this.dataURItoBlob(this.existingImage);
        formData.append('img', blob);
      }

      formData.append('categoryId',this.productForm.get('categoryId')?.value);
      formData.append('name',this.productForm.get('name')?.value);
      formData.append('description',this.productForm.get('description')?.value);
      formData.append('price',this.productForm.get('price')?.value);
      formData.append('stock', this.productForm.get('stock')?.value);

      formData.forEach((value, key) => {
        console.log(key + ':', value);
      });
      
      this.adminService.updateProduct(formData).subscribe((res)=>{
        if(res.id !=null){
          this.snackbar.open('Cập nhật sản phẩm thành công!','Đóng',{duration:3000});
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


  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([uint8Array], { type: 'image/jpeg' });
  }

}
