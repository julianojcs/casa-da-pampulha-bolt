import { Schema } from 'mongoose';
import { IHost } from '@/types';

/**
 * HostSchema - Schema for host data embedded in User documents
 * Note: The Host collection has been deprecated. Host data is now
 * stored as a subdocument in the User.host field.
 */
const HostSchema = new Schema<Omit<IHost, '_id'>>(
  {
    bio: { type: String, required: true },
    role: { type: String, required: true },
    languages: [{ type: String }],
    responseTime: { type: String, required: true },
    responseRate: { type: String, required: true },
    isSuperhost: { type: Boolean, default: false },
    joinedDate: { type: Date, required: true },
  },
  { _id: false }
);

// Export schema for embedding in User.host
export { HostSchema };
