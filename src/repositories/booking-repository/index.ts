import { prisma } from '@/config';

// Função de log
function log(message: string) {
  console.log(`[LOG] ${message}`);
}

// Função genérica para buscar uma reserva
async function findBooking(options: { userId?: number; roomId?: number }) {
  log('Iniciando a função findBooking');
  const result = await prisma.booking.findFirst({ where: options });
  log('Finalizando a função findBooking');
  return result;
}

// Função para buscar uma reserva por ID do usuário
async function findBookingByUserId(userId: number) {
  return findBooking({ userId });
}

// Função para buscar uma reserva por ID do quarto
async function findBookingByRoomId(roomId: number) {
  return findBooking({ roomId });
}

// Função genérica para criar uma reserva
async function createBooking(options: { roomId: number; userId: number }) {
  log('Iniciando a função createBooking');
  const result = await prisma.booking.create({ data: options });
  log('Finalizando a função createBooking');
  return result;
}

// Função para atualizar uma reserva por ID
async function updateBookingById(bookingId: number, options: { roomId?: number }) {
  log('Iniciando a função updateBookingById');
  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: options,
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
