import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import credentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import {
  getAddressFromMessage,
  getChainIdFromMessage,
  SIWESession,
  verifySignature,
} from '@web3modal/siwe';

const walletConnectProjectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!walletConnectProjectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set');
}

interface Credentials {
  message: string;
  signature: string;
}

declare module 'next-auth' {
  interface Session extends SIWESession {
    address: string;
    chainId: number;
  }
}

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
  },
  providers: [
    GitHub,
    credentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials) {
        console.log('credentialsProvider authorize');
        try {
          if (!credentials?.message) {
            throw new Error('SiweMessage is undefined');
          }
          const { message, signature } = credentials as Credentials; // for some reason NextAuth doesn't infer the type of credentials correctly, so we need to cast it
          const address = getAddressFromMessage(message);
          const chainId = getChainIdFromMessage(message);

          const isValid = await verifySignature({
            address,
            message,
            signature,
            chainId,
            projectId: walletConnectProjectId,
          });

          if (isValid) {
            return {
              id: `${chainId}:${address}`,
            };
          }

          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token, user }) {
      console.log('session callback', token);
      if (!token?.sub) {
        return session;
      }

      const [, chainId, address] = token.sub.split(':');
      if (chainId && address) {
        session.address = address;
        session.chainId = parseInt(chainId, 10);
      }

      return session;
    },
  },
});
