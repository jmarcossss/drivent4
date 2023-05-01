import { prisma } from '@/config';

async function findBookingByUserId(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId: userId,
    },
  });
}

async function findBookingByRoomId(roomId: number) {
  return await prisma.booking.findFirst({
    where: {
      roomId: roomId,
    },
  });
}

async function createBooking(roomId: number, userId: number) {
  return await prisma.booking.create({
    data: {
      roomId: roomId,
      userId: userId,
    },
  });
}

async function updateBookingById(bookingId: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId: roomId,
    },
  });
}

export default {
  findBookingByUserId,
  findBookingByRoomId,
  createBooking,
  updateBookingById,
};
