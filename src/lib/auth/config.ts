import NextAuth from 'next-auth';
import type { DefaultSession, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/postgresql';
import { UserModel } from '@/models/postgresql';
import bcrypt from 'bcryptjs';

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
          const result = await UserModel.findByUsername(credentials.username);
          const user = result?.rows[0];
          
          if (!user) {
            return null;
          }
          
          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password_hash);
          
          if (!isValid) {
            return null;
          }
          
          // Return user without password
          return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            name: user.display_name || user.username,
            image: user.avatar_url,
            role: user.role
          };
        } catch (error) {
          console.error('Error authenticating user:', error);
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
          const existingUser = await UserModel.findByGoogleId(profile?.sub);
          
          if (existingUser?.rows.length > 0) {
            // User exists, update the user object
            const dbUser = existingUser.rows[0];
            user.id = dbUser.id.toString();
            user.username = dbUser.username;
            user.role = dbUser.role;
          } else {
            // Check if a user with this email already exists
            const emailUser = await UserModel.findByEmail(profile?.email);
            
            if (emailUser?.rows.length > 0) {
              // Update existing user with Google ID
              const dbUser = emailUser.rows[0];
              await UserModel.updateGoogleId(dbUser.id, profile?.sub);
              
              user.id = dbUser.id.toString();
              user.username = dbUser.username;
              user.role = dbUser.role;
            } else {
              // Create a new user
              const username = `${profile?.email?.split('@')[0]}-${Math.floor(Math.random() * 1000)}`;
              
              const newUser = await UserModel.createUser({
                display_name: profile?.name,
                email: profile?.email,
                avatar_url: profile?.image,
                google_id: profile?.sub,
                username: username,
                role: 'user',
                password_hash: await bcrypt.hash(Math.random().toString(36).substring(2), 10),
              });
              
              const dbUser = newUser.rows[0];
              user.id = dbUser.id.toString();
              user.username = dbUser.username;
              user.role = dbUser.role;
            }
          }
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