import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ModelEditorComponent } from './model-editor.component';

@Injectable({
  providedIn: 'root'
})
export class ModelEditorService {
  constructor(private dialog: MatDialog) { }

  open(data: any): Observable<any> {
    return this.dialog.open(ModelEditorComponent, {data}).afterClosed();
  }
}
