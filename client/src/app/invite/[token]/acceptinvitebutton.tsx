'use client';

import { AuthContext } from '../../context/authcontext';
import { useAcceptInvite } from '../../../services/groups/mutations';
import { useCheckInvite } from '../../../services/groups/queries';
import { useRouter } from "next/navigation"; 

import React, { useContext, useEffect } from 'react';
 // Adjust the import path

interface AcceptInviteButtonProps {
  token: string;
}

const AcceptInviteButton = ({ token }: AcceptInviteButtonProps) => {
    const router = useRouter();
    const auth = useContext(AuthContext);
  const { data, isLoading, isError, refetch } = useCheckInvite(token);
  const { mutate: acceptInvite, isPending } = useAcceptInvite();

   const isAuthenticated = auth?.data?.user?.id;
   //("Auth state:", isAuthenticated ? "Authenticated" : "Not authenticated");
 
   useEffect(() => {
     // If auth is not loading and the user is not authenticated, redirect to home
     if (!auth?.isLoading && !isAuthenticated) {
       //("User not authenticated, redirecting to home");
       router.push("/");
     }
   }, [isAuthenticated, auth?.isLoading, router]);

  const handleAcceptInvite = async () => {
    try {
      acceptInvite(token);
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  if (isLoading) {
    return <div>Loading invite details...</div>;
  }

  if (isError) {
    return (
      <div>
        <div>Invalid invite link</div>
        <button
          onClick={() => refetch()}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (data?.success) {
    return (
      <button
        onClick={handleAcceptInvite}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300" disabled={isPending}
      >
       {isPending ? 'Accepting...' : 'Accept Invite'}
      </button>
    );
  }

  return <div>Invalid invite link or invite already accepted</div>;
};

export default AcceptInviteButton;