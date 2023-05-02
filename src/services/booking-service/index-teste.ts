// import { Booking } from '@prisma/client';
// import { forbiddenBookingError } from './errors';
// import bookingRepository from '@/repositories/booking-repository';
// import enrollmentRepository from '@/repositories/enrollment-repository';
// import ticketsRepository from '@/repositories/tickets-repository';
// import hotelRepository from '@/repositories/hotel-repository';
// import { notFoundError } from '@/errors';

// // Função de log
// function log(message: string) {
//   console.log(`[LOG] ${message}`);
// }

// async function findBooking(userId: number): Promise<Booking> {
//   log('Iniciando a função findBooking');
//   const booking = await bookingRepository.findBookingByUserId(userId);
//   if (!booking) {
//     log('Booking não encontrado');
//     throw notFoundError('No booking found for this user!');
//   }
//   log('Booking encontrado');
//   return booking;
// }

// async function createBooking(roomId: number, userId: number): Promise<{ bookingId: number }> {
//   log('Iniciando a função createBooking');
//   const room = await hotelRepository.findRoomById(roomId);
//   if (!room) {
//     log('Sala não encontrada');
//     throw notFoundError('Room not found!');
//   }
//   const booking = await bookingRepository.findBookingByRoomId(roomId);
//   if (booking) {
//     log('Reserva já existe');
//     throw forbiddenBookingError('Booking already exists!');
//   }
//   const enrollment = await enrollmentRepository.findByUserId(userId);
//   const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
//   const ticketType = await ticketsRepository.findTicketTypeById(ticket.ticketTypeId);
//   if (ticket.status !== 'PAID' || ticketType.isRemote || !ticketType.includesHotel) {
//     log('Verifique se o ticket está pago, é presencial e inclui hotel');
//     throw forbiddenBookingError('Verify if ticket is paid, presencial and includes hotel!');
//   }
//   const { id: bookingId } = await bookingRepository.createBooking(roomId, userId);
//   log('Reserva criada');
//   return { bookingId };
// }

// async function updateBooking(roomId: number, userId: number, bookingId: number) {
//   log('Iniciando a função updateBooking');
//   const room = await hotelRepository.findRoomById(roomId);
//   if (!room) {
//     log('Sala não encontrada');
//     throw notFoundError('Room not found!');
//   }
//   const roomIsAlreadyBooked = await bookingRepository.findBookingByRoomId(roomId);
//   if (roomIsAlreadyBooked) {
//     log('Sala já está reservada');
//     throw forbiddenBookingError('Room is already booked!');
//   }
//   const userBooking = await bookingRepository.findBookingByUserId(userId);
//   if (!userBooking || userBooking.id !== bookingId) {
//     log('Este usuário não tem uma reserva');
//     throw forbiddenBookingError('This user does not have a booking!');
//   }
//   log('Reserva atualizada');
//   return await bookingRepository.updateBookingById(bookingId, roomId);
// }

// const bookingService = { findBooking, createBooking, updateBooking };

// export default bookingService;
