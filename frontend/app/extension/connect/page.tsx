'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { EXTENSION_ID } from '@/lib/extension';
import { CheckCircle2, XCircle } from 'lucide-react';

type Status = 'connecting' | 'connected' | 'error';

interface ChromeGlobal {
  runtime?: {
    sendMessage: (
      extensionId: string,
      message: unknown,
      callback: (response: unknown) => void
    ) => void;
    lastError?: { message?: string };
  };
}

export default function ExtensionConnectPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>('connecting');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setStatus('error');
        setErrorMessage('No active session found. Try logging in again.');
        return;
      }

      const chromeApi = (window as unknown as { chrome?: ChromeGlobal }).chrome?.runtime;

      if (!chromeApi?.sendMessage) {
        setStatus('error');
        setErrorMessage(
          "Couldn't reach the refactr extension. Make sure it's installed and enabled, then try again."
        );
        return;
      }

      chromeApi.sendMessage(
        EXTENSION_ID,
        {
          type: 'REFACTR_AUTH_HANDOFF',
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
        (response: unknown) => {
          const ok = (response as { ok?: boolean } | undefined)?.ok;
          if (chromeApi.lastError || !ok) {
            setStatus('error');
            setErrorMessage(
              chromeApi.lastError?.message ||
                "Couldn't reach the refactr extension. Make sure it's installed and enabled, then try again."
            );
            return;
          }
          setStatus('connected');
        }
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-md text-center">
          {status === 'connecting' && (
            <>
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Connecting your extension...</h1>
              <p className="text-gray-600">This will only take a second.</p>
            </>
          )}

          {status === 'connected' && (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Connected!</h1>
              <p className="text-gray-600">
                You&apos;re logged in on the refactr extension. You can close this tab now.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Couldn&apos;t connect</h1>
              <p className="text-gray-600">{errorMessage}</p>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
