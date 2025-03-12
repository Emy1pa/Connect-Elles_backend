import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SkillsService } from './skills.service';
import { Types } from 'mongoose';
import { title } from 'process';

describe('SkillsService', () => {
  let service: SkillsService;
  let skillModel: any;

  const mockSkillId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();

  const createMock = jest.fn();

  const MockSkillModel = jest.fn().mockImplementation(() => ({
    toObject: jest.fn().mockReturnValue({
      _id: mockSkillId,
      title: 'JavaScript Skill',
      description: 'Advanced JavaScript Skill',
      user: mockUserId,
    }),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getModelToken('Skill'),
          useValue: Object.assign(MockSkillModel, {
            create: createMock,
          }),
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    skillModel = module.get(getModelToken('Skill'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CreateSkill', () => {
    it('should create a skill successfully', async () => {
      const createSkillDto = {
        title: 'JavaScript Skill',
        description: 'Advanced JavaScript Skill',
      };

      const mockCreatedSkill = new MockSkillModel();
      mockCreatedSkill._id = new Types.ObjectId(mockSkillId);
      mockCreatedSkill.title = createSkillDto.title;
      mockCreatedSkill.description = createSkillDto.description;
      mockCreatedSkill.user = new Types.ObjectId(mockUserId);

      createMock.mockResolvedValue(mockCreatedSkill);

      const result = await service.CreateSkill(createSkillDto, mockUserId);

      expect(createMock).toHaveBeenCalledWith({
        ...createSkillDto,
        user: new Types.ObjectId(mockUserId),
      });

      expect(result).toEqual({
        _id: mockSkillId,
        title: 'JavaScript Skill',
        description: 'Advanced JavaScript Skill',

        user: mockUserId,
      });
    });

    it('should throw an error if skill creation fails', async () => {
      const createSkillDto = {
        title: 'JavaScript Skill',
        description: 'Advanced JavaScript Skill',
      };

      createMock.mockRejectedValue(new Error('Database error'));

      await expect(
        service.CreateSkill(createSkillDto, mockUserId),
      ).rejects.toThrow('Failed to create skill');

      expect(createMock).toHaveBeenCalledWith({
        ...createSkillDto,
        user: new Types.ObjectId(mockUserId),
      });
    });
  });
});
