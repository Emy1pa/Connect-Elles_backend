import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { ReservationStatus, UserRole } from 'src/utils/enums';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { CreateReservationDto } from './dtos/create-reservation.dto';
import { UpdateReservationDto } from './dtos/update-reservation.dto';

@Controller('reservations')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Post(':userId/:serviceId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  async createReservation(
    @Param('serviceId') serviceId: string,
    @Param('userId') userId: string,
    @Body() createReservation: CreateReservationDto,
  ) {
    return this.reservationService.createReservation(
      createReservation,
      userId,
      serviceId,
    );
  }
  @Get()
  async getAllReservations() {
    return this.reservationService.getAllReservations();
  }

  @Get('user/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  async getUserReservations(@Param('userId') userId: string) {
    return this.reservationService.getUserReservations(userId);
  }

  @Get(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  async getReservationById(@Param('id') id: string) {
    return this.reservationService.getReservationById(id);
  }

  @Patch(':id/status/:userId/:userRole')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  async updateReservation(
    @Param('id') reservationId: string,
    @Param('userId') userId: string,
    @Body() updateReservation: UpdateReservationDto,
    @Param('userRole') userRole: UserRole,
  ) {
    const isMentor = userRole === UserRole.MENTOR;
    const newStatus = (updateReservation as any).status as ReservationStatus;

    return this.reservationService.updateReservationStatus(
      reservationId,
      userId,
      newStatus,
      isMentor,
    );
  }
  @Get('statistics/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.NORMAL_USER)
  async getReservationStatistics(@Param('userId') userId: string) {
    return this.reservationService.getReservationStatistics(userId);
  }
  @Get('mentor/:mentorId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  async getMentorServiceReservations(@Param('mentorId') mentorId: string) {
    return this.reservationService.getMentorServiceReservations(mentorId);
  }
}
