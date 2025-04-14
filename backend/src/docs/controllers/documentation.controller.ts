import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiDocumentationService } from '../services/api-docs.service';
import { ApiDocumentation } from '../types/documentation.types';

@ApiTags('Documentation')
@Controller('docs')
export class DocumentationController {
  constructor(private readonly docsService: ApiDocumentationService) {}

  @Get()
  @ApiOperation({ summary: 'Get latest documentation' })
  @ApiResponse({ status: 200, description: 'Returns the latest documentation' })
  async getLatestDocs(): Promise<ApiDocumentation> {
    return this.docsService.getLatestDocs();
  }

  @Get('versions')
  @ApiOperation({ summary: 'Get all documentation versions' })
  @ApiResponse({ status: 200, description: 'Returns list of documentation versions' })
  async getVersions(): Promise<string[]> {
    return this.docsService.getVersions();
  }

  @Get(':version')
  @ApiOperation({ summary: 'Get documentation by version' })
  @ApiResponse({ status: 200, description: 'Returns documentation for specified version' })
  async getDocsByVersion(@Param('version') version: string): Promise<ApiDocumentation> {
    return this.docsService.getDocsByVersion(version);
  }
} 