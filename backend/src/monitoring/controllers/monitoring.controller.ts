import { Controller, Get, Query } from '@nestjs/common';
import { MonitoringService } from '../services/monitoring.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiQuery({ name: 'timeRange', required: false, enum: ['5m', '15m', '1h', '6h', '24h', '7d'] })
  async getMetrics(@Query('timeRange') timeRange: string = '1h') {
    return this.monitoringService.getSystemMetrics(timeRange);
  }
} 