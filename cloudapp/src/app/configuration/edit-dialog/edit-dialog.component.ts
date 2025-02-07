import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isEmpty } from 'lodash';
import { debounceTime } from 'rxjs/operators';
import { AppService, N8nFormItem, N8nFormTriggeredWorkflow } from '../../app.service';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent implements OnInit {

  formGroup: FormGroup;
  formTriggeredWorkflows: N8nFormTriggeredWorkflow[] = [];
  editMode = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { form: N8nFormItem },
    private dialogRef: MatDialogRef<EditDialogComponent>,
    private appService: AppService) { }

  ngOnInit(): void {
    const { form } = this.data;
    this.editMode = !isEmpty(this.data?.form);
    this.appService.getFormTriggersFromInstance().subscribe(formTriggeredWorkflows => {
      this.formTriggeredWorkflows = formTriggeredWorkflows;
    });
    if (this.editMode) {
      this.formGroup = new FormGroup({
        form: new FormControl({
          value: `${form.formWorkflow.id}+${form.formWorkflow.formPath}`,
          disabled: true
        }, Validators.required),
        name: new FormControl(form.name, Validators.required),
        path: new FormControl({ value: form.path, disabled: form.path !== 'null' }, Validators.required),
        description: new FormControl(form.description ?? '')
      });
    } else {
      this.formGroup = new FormGroup({
        form: new FormControl('', Validators.required),
        name: new FormControl('', Validators.required),
        path: new FormControl({ value: '', disabled: true }, Validators.required),
        description: new FormControl('')
      });
    }
    this.formGroup.get('form')?.valueChanges.subscribe(formVal => {
      const form = this.formTriggeredWorkflows.find(wf => `${wf.id}+${wf.formPath}` === formVal);
      this.formGroup.get('name').setValue(`${form.formTitle} (${form.name})`);
      this.formGroup.get('path').setValue(form.formPath);
      if (form.formPath === 'null') {
        this.formGroup.get('path').enable();
      } else {
        this.formGroup.get('path').disable();
      }
    })
    this.formGroup.valueChanges.pipe(debounceTime(100)).subscribe(value => {
      const { name, path, description } = form;
      if (this.formGroup.dirty && JSON.stringify(value) === JSON.stringify({ name, path, description })) {
        this.formGroup.markAsPristine();
      }
    })
  }

  onSave() {
    this.appService.getCurrentUserId().subscribe(userId => {
      this.dialogRef.close(() => {
        const { form } = this.data;
        form.name = this.formGroup.get('name').value;
        form.path = this.formGroup.get('path').value;
        form.description = this.formGroup.get('description').value;
        form.modifiedBy = userId;
        form.modifiedDate = Date.now();
        if (!form.id) {
          form.createdBy = userId;
          form.createdDate = Date.now();
        }
        if (!form.formWorkflow) {
          form.formWorkflow = this.formTriggeredWorkflows
            .find(wf => `${wf.id}+${wf.formPath}` === this.formGroup.get('form').value);
        }
        return form;
      });
    })
  }

}
