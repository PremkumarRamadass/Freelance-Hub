import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service.js';

@ApiTags('Reports & Analytics')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get aggregated financial and operational summary (Reports Screen)' })
  @ApiResponse({ status: 200, description: 'Financial summary metrics' })
  async getSummary() {
    return this.reportsService.getFinancialSummary();
  }

  @Get('monthly-trends')
  @ApiOperation({ summary: 'Get monthly revenue and expense trends for charts' })
  async getMonthlyTrends() {
    return this.reportsService.getMonthlyTrends();
  }

  @Get('client-revenue')
  @ApiOperation({ summary: 'Get revenue grouped by client' })
  async getClientRevenue() {
    return this.reportsService.getClientRevenueBreakdown();
  }

  @Get('export-csv')
  @ApiOperation({ summary: 'Export live projects and financials to CSV' })
  async exportCsv(@Res() res: Response) {
    const csv = await this.reportsService.exportCsvData();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="LanceNexus_Report.csv"');
    return res.send(csv);
  }
}
