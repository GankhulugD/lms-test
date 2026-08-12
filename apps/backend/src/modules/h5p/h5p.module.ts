import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { H5pAjaxController } from './h5p-ajax.controller';
import { H5pContentController } from './h5p-content.controller';
import { H5pService } from './h5p.service';

@Module({
  imports: [CatalogModule, EnrollmentModule],
  controllers: [H5pAjaxController, H5pContentController],
  providers: [H5pService],
  exports: [H5pService],
})
export class H5pModule {}
