import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Drawer } from './models';

@Component({
  selector: 'app-sketchpad',
  templateUrl: './sketchpad.component.html',
  styleUrls: ['./sketchpad.component.scss']
})
export class SketchpadComponent implements OnInit {
  private drawer: Drawer = null;

  @ViewChild('sketchpad', {static: true}) sketchpadRef: ElementRef<HTMLCanvasElement>;
  @ViewChild('thumbnail', {static: true}) thumbnailRef: ElementRef<HTMLCanvasElement>;

  constructor() { }

  ngOnInit() {
    this.drawer = new Drawer(
      this.sketchpadRef.nativeElement,
      this.thumbnailRef.nativeElement
    );
  }

  public clear() {
    this.drawer.clear();
  }
}
