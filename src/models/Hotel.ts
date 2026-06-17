import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type PlanId = 'trial' | 'pro' | 'pro_website';

export interface IHotel extends Document {
  name: string;
  ownerName: string;
  email?: string;
  password: string;
  phone: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  plan: PlanId;
  planStartDate: Date;
  planExpiry?: Date;        // null = active paid subscription
  onboardingCompleted: boolean;
  comparePassword(password: string): Promise<boolean>;
}

const HotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, sparse: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    city: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    plan: { type: String, enum: ['trial', 'pro', 'pro_website'], default: 'trial' },
    planStartDate: { type: Date, default: Date.now },
    planExpiry: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

HotelSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

HotelSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', HotelSchema);
