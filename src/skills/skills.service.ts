import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './skill.entity';
import { ObjectId, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { UpdateSkillDto } from './dtos/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly usersService: UsersService,
  ) {}
  public async CreateSkill(
    createSkill: CreateSkillDto,
    userId: ObjectId | string,
  ) {
    const user = await this.usersService.getCurrentUser(userId);
    const newService = await this.skillsRepository.create({
      ...createSkill,
      title: createSkill.title,
      description: createSkill.description,
      user,
    });
    return await this.skillsRepository.save(newService);
  }
  public getAllSkills() {
    return this.skillsRepository.find();
  }
  public async getSkillBy(id: ObjectId | string) {
    let objectId: ObjectId;
    try {
      objectId = typeof id === 'string' ? new ObjectId(id) : id;
    } catch (error) {
      throw new BadRequestException('Invalid ID format');
    }

    const skill = await this.skillsRepository.findOne({
      where: { _id: objectId },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }
  public async updateSkill(id: ObjectId | string, updateSkill: UpdateSkillDto) {
    const skill = await this.getSkillBy(id);
    skill.title = updateSkill.title ?? skill.title;
    skill.description = updateSkill.description ?? skill.description;
    return this.skillsRepository.save(skill);
  }
  public async deleteSkill(id: ObjectId | string) {
    const skill = await this.getSkillBy(id);
    await this.skillsRepository.remove(skill);
    return { message: 'Skill deleted successfully' };
  }
}
