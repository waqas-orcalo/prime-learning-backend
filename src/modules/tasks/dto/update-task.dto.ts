import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

/**
 * UpdateTaskDto – inherits all fields from CreateTaskDto as optional.
 * Uses @nestjs/swagger PartialType so Swagger docs stay accurate.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
