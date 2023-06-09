import { prisma } from '@/config';

// Função de log
function log(message: string) {
  console.log(`[LOG] ${message}`);
}

// Função para buscar uma reserva por ID do usuário
async function findBookingByUserId(userId: number) {
  log('Iniciando a função findBookingByUserId');
  const result = await prisma.booking.findFirst({
    where: { userId: userId },
  });
  log('Finalizando a função findBookingByUserId');
  return result;
}

// Função para buscar uma reserva por ID do quarto
async function findBookingByRoomId(roomId: number) {
  log('Iniciando a função findBookingByRoomId');
  const result = await prisma.booking.findFirst({
    where: { roomId: roomId },
  });
  log('Finalizando a função findBookingByRoomId');
  return result;
}

// Função genérica para criar uma reserva
async function createBooking(roomId: number, userId: number) {
  log('Iniciando a função createBooking');
  const result = await prisma.booking.create({
    data: { roomId: roomId, userId: userId },
  });
  log('Finalizando a função createBooking');
  return result;
}

// Função para atualizar uma reserva por ID
async function updateBookingById(bookingId: number, roomId: number) {
  log('Iniciando a função updateBookingById');
  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: { roomId: roomId },
  });
  log('Finalizando a função updateBookingById');
  return result;
}

export default {
  findBookingByUserId,
  findBookingByRoomId,
  createBooking,
  updateBookingById,
};
