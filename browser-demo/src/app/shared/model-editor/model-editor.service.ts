import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NeuralNetworkConfig } from '@cross-nn/core';
import { ModelEditorComponent } from './model-editor.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModelEditorService {
  constructor(private dialog: MatDialog) { }

  open(): Observable<NeuralNetworkConfig> {
    return this.dialog.open(ModelEditorComponent).afterClosed();
  }
}
