import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { Drawer } from './models';

@Component({
  selector: 'app-sketchpad',
  templateUrl: './sketchpad.component.html',
  styleUrls: ['./sketchpad.component.scss']
})
export class SketchpadComponent implements OnInit {
  private drawer: Drawer = null;

  @Input() disabled = false;
  @Output() imageData = new EventEmitter<number[]>();
  @Output() imageClear = new EventEmitter<void>();

  @ViewChild('sketchpad', {static: true}) sketchpadRef: ElementRef<HTMLCanvasElement>;
  @ViewChild('thumbnail', {static: true}) thumbnailRef: ElementRef<HTMLCanvasElement>;

  get isDirty(): boolean {
    return !Boolean(this.drawer) || (this.drawer.isRecognized && !this.drawer.isDrawing);
  }

  ngOnInit() {
    this.drawer = new Drawer(
      this.sketchpadRef.nativeElement,
      this.thumbnailRef.nativeElement
    );
  }

  public clear() {
    this.drawer.clear();
    this.imageClear.emit();
  }

  public recognize(event: Event) {
    this.imageData.emit(this.drawer.recognize(event));
  }
}
