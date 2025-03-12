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
  const findMock = jest.fn();
  const mockSkills = [
    {
      _id: mockSkillId,
      title: 'JavaScript Skill',
      description: 'Advanced JavaScript Skill',
      user: {
        _id: mockUserId,
        fullName: 'John Doe',
        email: 'john@example.com',
        userRole: 'user',
      },
    },
    {
      _id: new Types.ObjectId().toString(),
      title: 'Python Skill',
      description: 'Basic Python Skill',
      user: {
        _id: new Types.ObjectId().toString(),
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        userRole: 'user',
      },
    },
  ];
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
            find: findMock,
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
  describe('getAllSkills', () => {
    it('should return all skills successfully', async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSkills),
      });

      const result = await service.getAllSkills();

      expect(findMock).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockSkills[0],
        user: mockSkills[0].user._id.toString(),
      });
      expect(result[1]).toEqual({
        ...mockSkills[1],
        user: mockSkills[1].user._id.toString(),
      });
    });

    it('should throw an error if skills retrieval fails', async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.getAllSkills()).rejects.toThrow(
        'Failed to retrieve skills',
      );
      expect(findMock).toHaveBeenCalled();
    });
  });
});
