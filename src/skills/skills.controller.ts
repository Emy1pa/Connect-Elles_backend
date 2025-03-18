import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { UpdateSkillDto } from './dtos/update-skill.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
@ApiTags('Skills')
@ApiBearerAuth()
@Controller('api/skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle compétence' })
  @ApiResponse({ status: 201, description: 'Compétence créée avec succès.' })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public async createNewSkill(
    @Body() createSkill: CreateSkillDto,
    @CurrentUser() paylod: JWTPayloadType,
  ) {
    const skill = await this.skillsService.CreateSkill(createSkill, paylod.id);

    return skill;
  }
  @Get()
  @ApiOperation({ summary: 'Lister toutes les compétences' })
  @ApiResponse({
    status: 200,
    description: 'Liste des compétences retournée avec succès.',
  })
  public getAllSkills() {
    return this.skillsService.getAllSkills();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une compétence par ID' })
  @ApiParam({ name: 'id', description: 'ID de la compétence' })
  public getSingleSkill(@Param('id') id: string) {
    return this.skillsService.getSkillBy(id);
  }
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une compétence' })
  @ApiParam({ name: 'id', description: 'ID de la compétence à mettre à jour' })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public updateSkill(
    @Param('id') id: string,
    @Body() updateSkill: UpdateSkillDto,
  ) {
    return this.skillsService.updateSkill(id, updateSkill);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une compétence' })
  @ApiParam({ name: 'id', description: 'ID de la compétence à supprimer' })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public deleteSkill(@Param('id') id: string) {
    return this.skillsService.deleteSkill(id);
  }

  @Get('statistics/:mentorId')
  @ApiOperation({ summary: 'Statistiques des compétences d’un mentor' })
  @ApiParam({ name: 'mentorId', description: 'ID du mentor' })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  async getSkillStatistics(@Param('mentorId') mentorId: string) {
    return this.skillsService.getSkillCount(mentorId);
  }

  @Get('admin/statistics')
  @ApiOperation({ summary: 'Statistiques globales pour l’admin' })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminStatistics() {
    return this.skillsService.getAdminStatistics();
  }

  @Get('mentor/:mentorId')
  async getSkillsByMentor(@Param('mentorId') mentorId: string) {
    return this.skillsService.getSkillsByMentor(mentorId);
  }
}
