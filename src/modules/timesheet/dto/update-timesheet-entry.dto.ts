import { PartialType } from '@nestjs/swagger';
import { CreateTimesheetEntryDto } from './create-timesheet-entry.dto';
export class UpdateTimesheetEntryDto extends PartialType(CreateTimesheetEntryDto) {}
