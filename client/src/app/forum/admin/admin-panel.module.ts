import { AdminComponentsModule } from './admin-components.module';
import { NgModule } from "@angular/core";
import { AdminPanelComponent } from "./admin-panel/admin-panel.component";
import { SharedModule } from "src/shared/shared.module";
import { RouterModule } from "@angular/router";
import { BanMenuComponent } from "./ban-menu/ban-menu.component";
import { RoleMenuComponent } from "./role-menu/role-menu.component";
import { canActivateAdmin } from './admin.guard';

@NgModule({
    declarations: [
      AdminPanelComponent
    ],
    imports: [
      SharedModule,
      AdminComponentsModule,
      RouterModule.forChild([
        {path: "", component: AdminPanelComponent, children: [
          {path:'ban-menu', component: BanMenuComponent},
          {path:'role-menu', component: RoleMenuComponent},
        ]}
      ])
    ],
    providers: [],
    exports: [
      AdminPanelComponent
    ]
})
export class AdminPanelModule {}