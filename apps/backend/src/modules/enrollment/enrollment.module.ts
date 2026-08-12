import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogModule } from '../catalog/catalog.module';
import { UsersModule } from '../users/users.module';
import { Group, GroupSchema } from './schemas/group.schema';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    CatalogModule,
    UsersModule,
  ],
  controllers: [GroupsController, EnrollmentController],
  providers: [GroupsService, EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
