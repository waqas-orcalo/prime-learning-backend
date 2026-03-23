import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimesheetEntry, TimesheetEntrySchema } from './schemas/timesheet-entry.schema';
import { TimesheetEntryRepository } from './repository/timesheet-entry.repository';
import { TimesheetService } from './services/timesheet.service';
import { TimesheetController } from './controllers/timesheet.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimesheetEntry.name, schema: TimesheetEntrySchema },
    ]),
  ],
  controllers: [TimesheetController],
  providers: [TimesheetService, TimesheetEntryRepository],
  exports: [TimesheetEntryRepository],
})
export class TimesheetModule {}
