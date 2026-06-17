import mongoose, { Schema, Document } from 'mongoose';

export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | string;

export interface IRoom extends Document {
  hotelId: mongoose.Types.ObjectId;
  roomNumber: string;
  roomType: RoomType;
  price: number;
  status: RoomStatus;
}

const RoomSchema = new Schema<IRoom>(
  {
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    roomNumber: { type: String, required: true },
    roomType: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  },
  { timestamps: true }
);

RoomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
