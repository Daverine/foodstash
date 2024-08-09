import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { Home2Component } from './home2/home2.component';
import { ProductsComponent } from './products/products.component';

export const routes: Routes = [
    {
        path: '',
        component: Home2Component
    },
    {
        path: 'products',
        component: ProductsComponent
    },
    {
        path: 'about',
        component: AboutComponent
    }
];
