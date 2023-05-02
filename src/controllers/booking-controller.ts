import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import hotelRepository from '@/repositories/hotel-repository';

// Função de log para rastrear a execução do código
function log(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Função para buscar uma reserva baseada no ID do usuário autenticado
export async function findBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { userId } = req;
  try {
    log(`findBooking iniciado para o usuário ${userId}`);
    const booking = await bookingService.findBooking(userId);
    const room = await hotelRepository.findRoomById(booking.roomId);
    log(`findBooking concluído para o usuário ${userId}`);
    return res.status(httpStatus.OK).send({
      id: booking.id,
      Room: { ...room },
    });
  } catch (func) {
    log(`findBooking falhou para o usuário ${userId}: ${func}`);
    next(func);
  }
}

// Função para criar uma reserva com base no ID do usuário autenticado e no ID do quarto
export async function createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { userId } = req;
  const { roomId } = req.body as { roomId: number };
  try {
    log(`createBooking iniciado para o usuário ${userId} e quarto ${roomId}`);
    const { bookingId } = await bookingService.createBooking(roomId, userId);
    log(`createBooking concluído para o usuário ${userId} e quarto ${roomId}`);
    return res.status(httpStatus.OK).send({ bookingId });
  } catch (func) {
    log(`createBooking falhou para o usuário ${userId} e quarto ${roomId}: ${func}`);
    next(func);
  }
}

// Função para atualizar uma reserva com base no ID do usuário autenticado e no ID do quarto
async function attBOokingUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { userId } = req;
  const { roomId } = req.body as { roomId: number };
  try {
    log(`User ${userId} and room ${roomId}`);
    const { bookingId } = await bookingService.createBooking(roomId, userId);
    log(`User ${userId} and room ${roomId}`);
    return res.status(httpStatus.OK).send({ bookingId });
  } catch (func) {
    log(`User ${userId} and room ${roomId}: ${func}`);
    next(func);
  }
}

// Função para atualizar uma reserva com base no ID do usuário autenticado, ID do quarto e ID da reserva
export async function updateBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { userId } = req;
  const { roomId } = req.body as { roomId: number };
  const { bookingId } = req.params;
  try {
    log(`updateBooking iniciado para o usuário ${userId}, quarto ${roomId} e reserva ${bookingId}`);
    const { id: bookingIdFromUpdatedRoom } = await bookingService.updateBooking(roomId, userId, +bookingId);
    log(`updateBooking concluído para o usuário ${userId}, quarto ${roomId} e reserva ${bookingId}`);
    return res.status(httpStatus.OK).send({
      bookingId: bookingIdFromUpdatedRoom,
    });
  } catch (func) {
    log(`updateBooking falhou para o usuário ${userId}, quarto ${roomId} e reserva ${bookingId}: ${func}`);
    next(func);
  }
}
