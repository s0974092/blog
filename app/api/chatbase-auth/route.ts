import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  // In a real application, you would fetch the currently signed-in user
  // from your authentication system (e.g., database, session).
  // For demonstration, we'll use a dummy user.
  const getSignedInUser = async () => {
    // Replace this with your actual logic to retrieve the signed-in user
    // For example:
    // const session = await getSession();
    // if (!session?.user) return null;
    // return {
    //   id: session.user.id,
    //   email: session.user.email,
    //   name: session.user.name,
    // };
    return {
      id: 'dummy-user-123',
      email: 'test@example.com',
      name: 'Test User',
      stripe_accounts: [], // Example for stripe integration
      // ... other custom attributes
    };
  };

  const user = await getSignedInUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const secret = process.env.CHATBOT_IDENTITY_SECRET;

  if (!secret) {
    console.error('CHATBOT_IDENTITY_SECRET is not defined in environment variables.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const token = jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      name: user.name,
      stripe_accounts: user.stripe_accounts,
      // ... other custom attributes
    },
    secret,
    { expiresIn: '1h', algorithm: 'HS256' } // Ensure HS256 is used as mentioned in Chatbase docs
  );

  return NextResponse.json({ token });
}
