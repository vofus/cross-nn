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
import { ModelTrainingComponent } from './model-training/model-training.component';
import { ModelTrainingService } from '@shared/model-training/model-training.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';

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
  MatDialogModule,
  MatSelectModule,
  MatTabsModule,
  MatExpansionModule,
  MatTableModule
];

const DECLARATIONS: Type<any>[] = [
  ModelEditorComponent,
  SketchpadComponent,
  ModelTrainingComponent
];

const PROVIDERS: Provider[] = [
  ModelEditorService,
  ModelTrainingService
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
