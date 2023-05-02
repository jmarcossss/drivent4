import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotel,
  createBookingTicketType,
  createRoomWithHotelId,
  createTicket,
  createTicketType,
  createUser,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicketTypeWithNoHotel,
} from '../factories';
import { createBooking } from '../factories/booking-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});
beforeEach(async () => {
  await cleanDb();
});
const server = supertest(app);

describe('GET /booking', () => {
  it('verifica se a resposta é status 401 quando nenhum token é fornecido', async () => {
    const res = await server.get('/booking');
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('verifica se a resposta é status 401 quando o token fornecido não é válido', async () => {
    const validTok = faker.lorem.word();
    const res = await server.get('/booking').set('Authorization', `Bearer ${validTok}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('verifica se a resposta é status 401 quando não há sessão para o token válido fornecido', async () => {
    const semEntrada = await createUser();
    const validTok = jwt.sign({ userId: semEntrada.id }, process.env.JWT_SECRET);
    const res = await server.get('/booking').set('Authorization', `Bearer ${validTok}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('quando o token válido é fornecido', () => {
    const generateValidBody = () => ({ email: faker.internet.email(), password: faker.internet.password(6) });

    it('verifica se a resposta é 404 quando o usuário não possui reservas', async () => {
      const createdUser = await createUser(generateValidBody());
      const validTok = await generateValidToken(createdUser);
      const res = await server.get('/booking').set('Authorization', `Bearer ${validTok}`);
      expect(res.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('verifica se a resposta inclui a reserva do usuário', async () => {
      const createdUser = await createUser(generateValidBody());
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);
      const booking = await createBooking(createdUser.id, createdRoom.id);
      const res = await server.get('/booking').set('Authorization', `Bearer ${validTok}`);
      expect(res.body).toEqual({
        id: booking.id,
        Room: {
          ...createdRoom,
          createdAt: createdRoom.createdAt.toISOString(),
          updatedAt: createdRoom.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('verifica se a resposta é status 401 quando nenhum token válido é fornecido', async () => {
    const res = await server.post('/booking');
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('verifica se a resposta é status 401 quando o token válido fornecido não é válido', async () => {
    const validTok = faker.lorem.word();
    const res = await server.post('/booking').set('Authorization', `Bearer ${validTok}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('verifica se a resposta é status 401 quando não há sessão para o token válido fornecido', async () => {
    const semEntrada = await createUser();
    const validTok = jwt.sign({ userId: semEntrada.id }, process.env.JWT_SECRET);
    const res = await server.post('/booking').set('Authorization', `Bearer ${validTok}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('quando o token válido é fornecido', () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(6),
    });

    it('verifica se a resposta é 400 quando nenhum corpo é enviado', async () => {
      const createdUser = await createUser(generateValidBody());
      const validTok = await generateValidToken(createdUser);
      const res = await server.post('/booking').set('Authorization', `Bearer ${validTok}`);
      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('verifica se a resposta é 404 quando o roomId é inválido', async () => {
      const createdUser = await createUser(generateValidBody());
      const validTok = await generateValidToken(createdUser);
      const res = await server.post('/booking').set('Authorization', `Bearer ${validTok}`).send({ roomId: 1 });
      expect(res.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('verifica se a resposta é 403 quando o roomId já está reservado', async () => {
      const createdUser = await createUser(generateValidBody());
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);
      await createBooking(createdUser.id, createdRoom.id);

      const res = await server
        .post('/booking')
        .set('Authorization', `Bearer ${validTok}`)
        .send({ roomId: createdRoom.id });
      expect(res.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('verifica se a resposta é 403 quando o ticket não está pago', async () => {
      const createdUser = await createUser(generateValidBody());
      const enrollment = await createEnrollmentWithAddress(createdUser);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);

      const res = await server
        .post('/booking')
        .set('Authorization', `Bearer ${validTok}`)
        .send({ roomId: createdRoom.id });
      expect(res.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('verifica se a resposta é 403 quando o ticket é remoto', async () => {
      const createdUser = await createUser(generateValidBody());
      const enrollment = await createEnrollmentWithAddress(createdUser);
      const ticketType = await createTicketTypeRemote();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);

      const res = await server
        .post('/booking')
        .set('Authorization', `Bearer ${validTok}`)
        .send({ roomId: createdRoom.id });

      expect(res.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('verifica se a resposta é 403 quando o ticket não inclui o hotel', async () => {
      const createdUser = await createUser(generateValidBody());
      const enrollment = await createEnrollmentWithAddress(createdUser);
      const ticketType = await createTicketTypeWithNoHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);

      const res = await server
        .post('/booking')
        .set('Authorization', `Bearer ${validTok}`)
        .send({ roomId: createdRoom.id });
      expect(res.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('verifica se a resposta é 200 e o bookingId foi criado', async () => {
      const createdUser = await createUser(generateValidBody());
      const enrollment = await createEnrollmentWithAddress(createdUser);
      const ticketType = await createBookingTicketType();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);

      const res = await server
        .post('/booking')
        .set('Authorization', `Bearer ${validTok}`)
        .send({ roomId: createdRoom.id });
      expect(res.status).toEqual(httpStatus.OK);
      expect(res.body).toEqual({
        bookingId: expect.any(Number),
      });
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  it('verifica se a resposta é status 401 quando nenhum token válido é fornecido', async () => {
    const res = await server.put('/booking/1');
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('verifica se a resposta é status 401 quando o token válido fornecido não é válido', async () => {
    const validTok = faker.lorem.word();
    const res = await server.put('/booking/1').set('Authorization', `Bearer ${validTok}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('verifica se a resposta é status 401 quando não há sessão para o token válido fornecido', async () => {
    const semEntrada = await createUser();
    const validTok = jwt.sign({ userId: semEntrada.id }, process.env.JWT_SECRET);
    const res = await server.put('/booking/1').set('Authorization', `Bearer ${validTok}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('quando o token válido é fornecido', () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(6),
    });

    it('verifica se a resposta é 404 quando o roomId é inválido', async () => {
      const createdUser = await createUser(generateValidBody());
      const validTok = await generateValidToken(createdUser);
      const res = await server.put('/booking/1').set('Authorization', `Bearer ${validTok}`).send({ roomId: 1 });
      expect(res.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('verifica se a resposta é 403 quando o roomId já está reservado', async () => {
      const createdUser = await createUser(generateValidBody());
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);
      await createBooking(createdUser.id, createdRoom.id);
      const res = await server
        .put('/booking/1')
        .set('Authorization', `Bearer ${validTok}`)
        .send({ roomId: createdRoom.id });
      expect(res.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('verifica se a resposta é 403 quando o roomId já está reservado', async () => {
      const createdUser = await createUser(generateValidBody());
      const auxUser = await createUser(generateValidBody());
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);

      await createBooking(auxUser.id, createdRoom.id);

      const res = await server
        .put('/booking/1')
        .set('Authorization', `Bearer ${validTok}`)
        .send({ roomId: createdRoom.id });
      expect(res.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond 403 if user does not have bookings', async () => {
      const createdUser = await createUser(generateValidBody());
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);

      const res = await server
        .put('/booking/1')
        .set('Authorization', `Bearer ${validTok}`)
        .send({ roomId: createdRoom.id });
      expect(res.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('verifica se a resposta é 403 quando o usuário não tem reservas', async () => {
      const createdUser = await createUser(generateValidBody());
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const auxRoom = await createRoomWithHotelId(createdHotel.id);
      const validTok = await generateValidToken(createdUser);
      const booking = await createBooking(createdUser.id, createdRoom.id);

      const res = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${validTok}`)
        .send({ roomId: auxRoom.id });

      expect(res.status).toEqual(httpStatus.OK);
      expect(res.body).toEqual({
        bookingId: booking.id,
      });
    });
  });
});
