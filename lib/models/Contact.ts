import mongoose, {Schema, Document, Model} from "mongoose";

export interface IContactInfo{
    id: string;
    icon: string;
    title: string;
    details: string;
    order: number;
}

export interface IContact extends Document{
    title: string;
    subtitle: string;
    description: string;
    contactInfo: IContactInfo[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ContactInfoSchema = new Schema<IContactInfo>({
    id: {type: String, required: true},
    icon: {type: String, required: true},
    title: {type: String, required: true},
    details: {type: String, required: true},
    order: {type: Number, default: 0}
}, {_id: false});

const ContactSchema = new Schema<IContact>({
    title: {
        type: String,
        required: true,
        default: 'Get a Free Quote'
    },
    subtitle: {
        type: String,
        required: true,
        default: 'Contact Information'
    },
    description: {
        type: String,
        required: true,
        default: 'Ready to bring your printing project to life? Contact us today for a free, no-obligation quote.'
    },
    contactInfo: [ContactInfoSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

const Contact: Model<IContact>=
    mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;