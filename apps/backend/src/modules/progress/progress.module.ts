import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogModule } from '../catalog/catalog.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { ContentResult, ContentResultSchema } from './schemas/content-result.schema';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContentResult.name, schema: ContentResultSchema }]),
    CatalogModule,
    EnrollmentModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
