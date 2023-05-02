import { prisma } from '@/config';

async function findBookingByUserId(userId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      userId,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  return booking;
}

async function findBookingByRoomId(roomId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      roomId,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  return booking;
}

async function createBooking(roomId: number, userId: number) {
  const booking = await prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });

  return booking;
}

async function updateBookingById(bookingId: number, roomId: number) {
  const booking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });

  return booking;
}

export default {
  findBookingByUserId,
  findBookingByRoomId,
  createBooking,
  updateBookingById,
};
