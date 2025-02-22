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

@Controller('api/skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}
  @Post()
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
  public getAllSkills() {
    return this.skillsService.getAllSkills();
  }
  @Get(':id')
  public getSingleSkill(@Param('id') id: string) {
    return this.skillsService.getSkillBy(id);
  }
  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public updateSkill(
    @Param('id') id: string,
    @Body() updateSkill: UpdateSkillDto,
  ) {
    return this.skillsService.updateSkill(id, updateSkill);
  }
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public deleteSkill(@Param('id') id: string) {
    return this.skillsService.deleteSkill(id);
  }
}
