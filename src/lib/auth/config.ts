import NextAuth from 'next-auth';
import type { DefaultSession, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string;
      role?: string;
    } & DefaultSession['user']
  }

  interface User {
    username?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();
        
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        try {
          // Find the user by username
          const user = await UserModel.findOne({ username: credentials.username }).select('+password');

          if (!user) {
            return null;
          }

          // Check if the password is correct
          const isPasswordCorrect = await user.comparePassword(credentials.password);

          if (!isPasswordCorrect) {
            return null;
          }

          // Return the user without the password
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            username: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await connectDB();
        
        try {
          // Check if user already exists with this Google ID
          let dbUser = await UserModel.findOne({ googleId: profile?.sub });
          
          if (!dbUser) {
            // Check if a user with this email already exists
            dbUser = await UserModel.findOne({ email: profile?.email });
            
            if (dbUser) {
              // Update existing user with Google ID
              dbUser.googleId = profile?.sub;
              await dbUser.save();
            } else {
              // Create a new user
              const username = profile?.email?.split('@')[0] + '-' + Math.floor(Math.random() * 1000);
              
              dbUser = await UserModel.create({
                name: profile?.name,
                email: profile?.email,
                image: profile?.image,
                googleId: profile?.sub,
                username: username,
              });
            }
          }
          
          // Update the user object to include database ID and username
          user.id = dbUser._id.toString();
          user.username = dbUser.username;
          user.role = dbUser.role;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { auth, signIn, signOut } = NextAuth(authOptions); 