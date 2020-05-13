import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ModelTrainingComponent } from '@shared/model-training/model-training.component';
import { ModelTrainingResponse } from '@shared/model-training/types';

@Injectable({
  providedIn: 'root'
})
export class ModelTrainingService {
  constructor(private dialog: MatDialog) { }

  open(): Observable<ModelTrainingResponse> {
    return this.dialog.open(ModelTrainingComponent).afterClosed();
  }
}
