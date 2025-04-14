import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('projects')
  @ApiOperation({ summary: 'Get project metrics' })
  @ApiQuery({ name: 'timeframe', enum: ['week', 'month', 'year'], required: false })
  async getProjectMetrics(@Query('timeframe') timeframe: 'week' | 'month' | 'year' = 'month') {
    return this.analyticsService.getProjectMetrics(timeframe);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get skill progress metrics' })
  async getSkillProgressMetrics() {
    return this.analyticsService.getSkillProgressMetrics();
  }

  @Get('teams')
  @ApiOperation({ summary: 'Get team performance metrics' })
  async getTeamPerformanceMetrics() {
    const projectMetrics = await this.analyticsService.getProjectMetrics('month');
    return projectMetrics.teamPerformance;
  }

  @Get('workshops')
  @ApiOperation({ summary: 'Get workshop impact metrics' })
  async getWorkshopImpactMetrics() {
    const skillMetrics = await this.analyticsService.getSkillProgressMetrics();
    return skillMetrics.workshopImpact;
  }
} 