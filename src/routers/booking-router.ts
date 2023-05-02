import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { createBooking, findBooking, updateBooking } from '@/controllers';
import { bookingSchema, bookingSchemaUpdate } from '@/schemas/booking-schemas';

const bookingsRouter = Router();

// Middleware para autenticação em todas as rotas
bookingsRouter.all('/*', authenticateToken);

// Rota para buscar todas as reservas
bookingsRouter.get('/', findBooking);

// Rota para criar uma nova reserva
bookingsRouter.post('/', validateBody(bookingSchema), createBooking);

// Rota para atualizar uma reserva específica
bookingsRouter.put('/:bookingId', validateBody(bookingSchemaUpdate), updateBooking);

export { bookingsRouter };
