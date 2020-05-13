import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesMainRoutingModule } from './pages-main-routing.module';
import { MainPageComponent } from './main-page/main-page.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PagesMainRoutingModule
  ],
  declarations: [MainPageComponent]
})
export class PagesMainModule { }
