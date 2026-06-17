import mongoose, { Schema, Document } from 'mongoose';
import { ID_LABELS } from '@/lib/constants';

export type IdType =
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'driving_license'
  | 'voter_id'
  | 'other';

export { ID_LABELS };

export interface IBooking extends Document {
  hotelId:    mongoose.Types.ObjectId;
  roomId:     mongoose.Types.ObjectId;
  roomNumber: string;
  roomType:   string;
  price:      number;
  guestName:  string;
  idType:     IdType;
  idNumber:   string;
  checkIn:    Date;
  checkOut:   Date | null;
  nights:     number | null;
  totalAmount: number | null;
  status:     'active' | 'completed';
}

const BookingSchema = new Schema<IBooking>(
  {
    hotelId:     { type: Schema.Types.ObjectId, ref: 'Hotel',  required: true, index: true },
    roomId:      { type: Schema.Types.ObjectId, ref: 'Room',   required: true, index: true },
    roomNumber:  { type: String, required: true },
    roomType:    { type: String, required: true },
    price:       { type: Number, required: true },
    guestName:   { type: String, required: true },
    idType:      { type: String, enum: Object.keys(ID_LABELS), required: true },
    idNumber:    { type: String, required: true },
    checkIn:     { type: Date, required: true },
    checkOut:    { type: Date, default: null },
    nights:      { type: Number, default: null },
    totalAmount: { type: Number, default: null },
    status:      { type: String, enum: ['active', 'completed'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>('Booking', BookingSchema);
