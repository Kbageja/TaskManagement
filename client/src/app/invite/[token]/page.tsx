import { Metadata } from 'next';
import AcceptInviteButton from './acceptinvitebutton';

// Define the params type as a Promise
type PageParams = Promise<{ token: string }>;

// Generate metadata (must be async)
export const generateMetadata = async ({ params }: { params: PageParams }): Promise<Metadata> => {
  const { token } = await params;
  return {
    title: `Invitation - ${token}`,
  };
};

// Async page component
export default async function InvitePage({ params }: { params: PageParams }) {
  // Await the params Promise
  const { token } = await params;

  return (
    <div className="flex flex-col text-black items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl text-black font-bold mb-4">You are Invited!</h1>
        <p className="mb-6">
          Join our platform and start collaborating with your team
        </p>
        {/* Pass the resolved token */}
        <AcceptInviteButton token={token} />
        <p className="text-sm text-gray-400 mt-4">
          By accepting, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}