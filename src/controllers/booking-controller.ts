import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import hotelRepository from '@/repositories/hotel-repository';

export async function findBooking(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<any, Record<string, any>> | void> {
  const { userId } = req;
  try {
    const booking = await bookingService.findBooking(userId);
    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).send({
        error: 'Booking not found',
      });
    }
    const room = await hotelRepository.findRoomById(booking.roomId);
    if (!room) {
      return res.status(httpStatus.NOT_FOUND).send({
        error: 'Room not found',
      });
    }
    return res.status(httpStatus.OK).send({
      id: booking.id,
      Room: { ...room },
    });
  } catch (e) {
    return next(e);
  }
}

export async function createBooking(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<any, Record<string, any>> | void> {
  const { userId } = req;
  const { roomId } = req.body as { roomId: number };
  try {
    const booking = await bookingService.createBooking(roomId, userId);
    if (!booking) {
      return res.status(httpStatus.BAD_REQUEST).send({
        error: 'Unable to create booking',
      });
    }
    return res.status(httpStatus.OK).send({ bookingId: booking.bookingId });
  } catch (e) {
    return next(e);
  }
}

export async function updateBooking(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<any, Record<string, any>> | void> {
  const { userId } = req;
  const { roomId, bookingId } = req.body as { roomId: number; bookingId: number };
  try {
    const booking = await bookingService.updateBooking(roomId, userId, bookingId);
    if (!booking) {
      return res.status(httpStatus.BAD_REQUEST).send({
        error: 'Unable to update booking',
      });
    }
    return res.status(httpStatus.OK).send({
      bookingId: booking.id,
    });
  } catch (e) {
    return next(e);
  }
}
