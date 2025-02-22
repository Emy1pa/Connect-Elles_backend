import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Skill, SkillDocument } from './skill.schema';
import { UsersService } from 'src/users/users.service';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { UpdateSkillDto } from './dtos/update-skill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/user.schema';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name)
    private readonly skillsModel: Model<SkillDocument>,
  ) {}
  public async CreateSkill(createSkill: CreateSkillDto, userId: string) {
    try {
      const newSkill = await this.skillsModel.create({
        ...createSkill,
        user: new Types.ObjectId(userId),
      });
      return {
        ...newSkill.toObject(),
        _id: newSkill._id.toString(),
        user: newSkill.user.toString(),
      };
    } catch (error) {
      throw new Error('Failed to create skill');
    }
  }
  public async getAllSkills() {
    try {
      const skills = await this.skillsModel
        .find()
        .populate('user')
        .lean()
        .exec();
      return skills.map((skill) => ({
        ...skill,
        _id: skill._id.toString(),
        user: skill.user ? (skill.user as any)._id.toString() : null,
      }));
    } catch (error) {
      throw new Error('Failed to retrieve skills');
    }
  }
  public async getSkillBy(id: string) {
    const skill = await this.skillsModel
      .findById(id.toString())
      .populate('user', '_id fullName email userRole')
      .lean()
      .exec();

    if (!skill) throw new NotFoundException('Skill not found');
    const user = skill.user as any;

    return {
      ...skill,
      _id: skill._id.toString(),
      user: {
        ...user,
        _id: user._id ? user._id.toString() : undefined,
      },
    };
  }
  public async updateSkill(id: string, updateSkill: UpdateSkillDto) {
    const skill = await this.getSkillBy(id);
    if (!skill) throw new NotFoundException('Skill not found');
    const result = await this.skillsModel.updateOne(
      {
        _id: id,
      },
      { $set: updateSkill },
    );
    if (result.modifiedCount === 0) {
      throw new Error('Failed to update skill');
    }
    return { message: 'Skill updated successfully' };
  }
  public async deleteSkill(id: string) {
    try {
      const skill = await this.skillsModel.findById(id);
      if (!skill) {
        throw new NotFoundException('Skill not found');
      }
      await this.skillsModel.deleteOne({ _id: id });
      return { message: 'Skill deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete skill');
    }
  }
}
