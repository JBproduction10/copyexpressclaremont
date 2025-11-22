import mongoose, {Schema, Document, Model} from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminDocument extends Document{
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdminDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password:{
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true
    }
)

// Hash password before saving
AdminSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }catch(error: unknown){
        next(error as Error);
    }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function
    (candidatePassword: string): Promise<boolean>{
        return bcrypt.compare(candidatePassword, this.password);
    };

const Admin: Model<IAdminDocument>=
    mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);

export default Admin;