import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Dashboard & Client Portal')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get live KPI statistics and recent deliverables (Freelancer / Admin Dashboard)' })
  @ApiResponse({ status: 200, description: 'Live KPI metrics, task breakdown, monthly charts' })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('client-portal/:email')
  @ApiOperation({ summary: 'Get live delivery progress, invoices, and milestones for a client (Client Portal Dashboard)' })
  @ApiResponse({ status: 200, description: 'Client project metrics and payment status' })
  async getClientPortalStats(@Param('email') email: string) {
    return this.dashboardService.getClientPortalStats(email);
  }
}
