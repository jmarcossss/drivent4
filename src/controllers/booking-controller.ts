import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import hotelRepository from '@/repositories/hotel-repository';

export async function findBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { userId } = req;
  try {
    const booking = await bookingService.findBooking(userId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    const room = await hotelRepository.findRoomById(booking.roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    return res.status(httpStatus.OK).send({
      id: booking.id,
      Room: { ...room },
    });
  } catch (e) {
    next(e);
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { userId } = req;
  const { roomId } = req.body as { roomId: number };
  try {
    const booking = await bookingService.createBooking(roomId, userId);
    if (!booking) {
      throw new Error('Booking creation failed');
    }
    return res.status(httpStatus.OK).send({ bookingId: booking.bookingId });
  } catch (e) {
    next(e);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { userId } = req;
  const { roomId } = req.body as { roomId: number };
  const { bookingId } = req.params;
  try {
    const booking = await bookingService.updateBooking(roomId, userId, +bookingId);
    if (!booking) {
      throw new Error('Booking update failed');
    }
    return res.status(httpStatus.OK).send({
      bookingId: booking.id,
    });
  } catch (e) {
    next(e);
  }
}
