import NextAuth, {AuthOptions} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";

export const authOptions: AuthOptions = {
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: {label: 'Email', type: 'email'},
                password: {label: 'Password', type: 'password'}
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    throw new Error('Please provide email and password');
                }

                await connectDB();

                const admin = await Admin.findOne({email: credentials.email});

                if(!admin){
                    throw new Error('Invalid email or password');
                }

                const isPasswordValid = await admin.comparePassword(credentials.password);

                if(!isPasswordValid) {
                    throw new Error('Invalid email or password');
                }

                return {
                    id: admin._id.toString(),
                    email: admin.email,
                    name: admin.name,
                }
            }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/admin/login',
    },
    callbacks: {
        async jwt({token, user}){
            if(user){
                token.id = user.id;
            }
            return token;
        },
        async session({session, token}){
            if(session.user){
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export{handler as GET, handler as POST};
