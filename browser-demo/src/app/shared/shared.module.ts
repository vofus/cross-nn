import { NgModule, Provider, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ModelEditorComponent } from './model-editor/model-editor.component';
import { ModelEditorService } from './model-editor/model-editor.service';
import { MatDialogModule } from '@angular/material/dialog';
import { SketchpadComponent } from './sketchpad/sketchpad.component';

const MODULES: Type<any>[] = [
  FormsModule,
  ReactiveFormsModule,
  MatToolbarModule,
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatProgressBarModule,
  MatDialogModule
];

const DECLARATIONS: Type<any>[] = [
  ModelEditorComponent,
  SketchpadComponent
];

const PROVIDERS: Provider[] = [
  ModelEditorService
];

@NgModule({
  imports: [
    CommonModule,
    ...MODULES
  ],
  providers: [...PROVIDERS],
  declarations: [...DECLARATIONS],
  exports: [...MODULES, ...DECLARATIONS]
})
export class SharedModule { }
