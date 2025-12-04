'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'

const Toaster = dynamic(() => import('sonner').then((mod) => mod.Toaster), {
  ssr: false,
});
import { useState, type ReactNode, useEffect } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    const fetchChatbaseTokenAndIdentify = async () => {
      // In a real application, you would only call this if the user is authenticated.
      // For demonstration, we'll call it unconditionally.
      try {
        const response = await fetch('/api/chatbase-auth');
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            // Ensure window.chatbase is available before calling
            if (typeof window !== 'undefined' && window.chatbase) {
              window.chatbase('identify', { token: data.token });
              console.log('Chatbase identified user with token.');
            } else {
              console.warn('window.chatbase not available yet.');
            }
          }
        } else {
          console.error('Failed to fetch Chatbase token:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching Chatbase token:', error);
      }
    };

    fetchChatbaseTokenAndIdentify();
  }, []); // Run once on component mount

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
} 