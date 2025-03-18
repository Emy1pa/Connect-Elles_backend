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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Post(':userId/:serviceId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @ApiOperation({ summary: 'Créer une réservation' })
  @ApiParam({ name: 'userId', type: String })
  @ApiParam({ name: 'serviceId', type: String })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({ status: 201, description: 'Réservation créée avec succès' })
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
  @ApiOperation({ summary: 'Récupérer toutes les réservations' })
  @ApiResponse({ status: 200, description: 'Liste de toutes les réservations' })
  async getAllReservations() {
    return this.reservationService.getAllReservations();
  }

  @Get('user/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @ApiOperation({ summary: 'Récupérer les réservations d’un utilisateur' })
  @ApiParam({ name: 'userId', type: String })
  async getUserReservations(@Param('userId') userId: string) {
    return this.reservationService.getUserReservations(userId);
  }

  @Get(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @ApiOperation({ summary: 'Récupérer une réservation par ID' })
  @ApiParam({ name: 'id', type: String })
  async getReservationById(@Param('id') id: string) {
    return this.reservationService.getReservationById(id);
  }

  @Patch(':id/status/:userId/:userRole')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER, UserRole.MENTOR)
  @ApiOperation({ summary: 'Mettre à jour le statut d’une réservation' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'userId', type: String })
  @ApiParam({ name: 'userRole', enum: UserRole })
  @ApiBody({ type: UpdateReservationDto })
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
  @ApiOperation({ summary: 'Statistiques des réservations utilisateur' })
  @ApiParam({ name: 'userId', type: String })
  async getReservationStatistics(@Param('userId') userId: string) {
    return this.reservationService.getReservationStatistics(userId);
  }
  @Get('statistics/mentor/:mentorId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Statistiques des réservations d’un mentor' })
  @ApiParam({ name: 'mentorId', type: String })
  async getMentorReservationStatistics(@Param('mentorId') mentorId: string) {
    return this.reservationService.getMentorReservationsStatistics(mentorId);
  }
  @Get('mentor/:mentorId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Liste des réservations des services du mentor' })
  @ApiParam({ name: 'mentorId', type: String })
  async getMentorServiceReservations(@Param('mentorId') mentorId: string) {
    return this.reservationService.getMentorServiceReservations(mentorId);
  }

  @Get('admin/statistics')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Statistiques globales administrateur' })
  async getAdminStatistics() {
    return this.reservationService.getAdminStatistics();
  }
}
