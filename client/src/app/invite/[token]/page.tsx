import React from 'react';
import AcceptInviteButton from './acceptinvitebutton';


interface PageProps {
  params: {
    token: string;
  };
}

const InvitePage = async ({ params }: PageProps) => {
  const { token } = await params;

  return (
    <div className="flex flex-col text-black items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl text-black font-bold mb-4">You're Invited!</h1>
        <p className=" mb-6">
          Join our platform and start collaborating with your team
        </p>
        <AcceptInviteButton token={token} />
        <p className="text-sm text-gray-400  mt-4">
          By accepting, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default InvitePage;