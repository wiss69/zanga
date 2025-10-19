import NextAuth, { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }
        // Placeholder auth logic — to be replaced by real provider (DB, API, etc.)
        if (parsed.data.email.endsWith('@zinga.io') && parsed.data.password === 'zinga-demo') {
          return {
            id: 'demo-user',
            name: 'Demo User',
            email: parsed.data.email
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/user'
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
