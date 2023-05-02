import Joi from 'joi';
import { Booking } from '@prisma/client';

export const bookingSchema = Joi.object<Booking>({ roomId: Joi.number().required() });

function obterBooking(booking: any, schema: Joi.ObjectSchema<Booking>) {
  const { error } = schema.validate(booking);
  if (error) {
    throw new Error(`Invalid booking data: ${error.message}`);
  }
}

export const bookingSchemaUpdate = Joi.object<Booking>({ roomId: Joi.number() });
