import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';
import { AppService, N8nFormItem } from '../../app.service';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent implements OnInit {

  formGroup: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { form: N8nFormItem },
    private dialogRef: MatDialogRef<EditDialogComponent>,
    private appService: AppService) { }

  ngOnInit(): void {
    const { form } = this.data;
    this.formGroup = new FormGroup({
      name: new FormControl(form?.name ?? '', Validators.required),
      url: new FormControl(form?.url ?? '', Validators.required),
      description: new FormControl(form?.description ?? '')
    });
    this.formGroup.valueChanges.pipe(debounceTime(100)).subscribe(value => {
      const { name, url, description } = form;
      if (this.formGroup.dirty && JSON.stringify(value) === JSON.stringify({ name, url, description })) {
        this.formGroup.markAsPristine();
      }
    })
  }

  onSave() {
    this.appService.getCurrentUserId().subscribe(userId => {
      this.dialogRef.close(() => {
        const { form } = this.data;
        form.name = this.formGroup.get('name').value;
        form.url = this.formGroup.get('url').value;
        form.description = this.formGroup.get('description').value;
        form.modifiedBy = userId;
        form.modifiedDate = Date.now();
        if (!form.id) {
          form.createdBy = userId;
          form.createdDate = Date.now();
        }
        return form;
      });
    })
  }

}
