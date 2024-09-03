import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertModule, CloudAppTranslateModule, MaterialModule } from '@exlibris/exl-cloudapp-angular-lib';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormComponent } from './form/form.component';
import { MainComponent } from './main/main.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { DeleteConfirmationDialogComponent } from './configuration/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { EditDialogComponent } from './configuration/edit-dialog/edit-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    FormComponent,
    TopMenuComponent,
    ConfigurationComponent,
    DeleteConfirmationDialogComponent,
    EditDialogComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AlertModule,
    FormsModule,
    ReactiveFormsModule,
    CloudAppTranslateModule.forRoot(),
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
