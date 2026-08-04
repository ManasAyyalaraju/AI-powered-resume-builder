import { getSupabaseClient } from './lib/supabase-client';

interface DownloadFileMessage {
  type: 'DOWNLOAD_FILE';
  url: string;
  filename: string;
}

type Message = DownloadFileMessage;

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  if (message.type === 'DOWNLOAD_FILE') {
    chrome.downloads.download(
      { url: message.url, filename: message.filename, saveAs: false },
      () => sendResponse({ ok: !chrome.runtime.lastError })
    );
    return true; // keep the message channel open for the async sendResponse
  }
  return false;
});

interface AuthHandoffMessage {
  type: 'REFACTR_AUTH_HANDOFF';
  access_token: string;
  refresh_token: string;
}

// Received from the refactr web app (see externally_connectable in manifest.json)
// after the user logs in there, so the extension picks up the same session.
chrome.runtime.onMessageExternal.addListener((message: AuthHandoffMessage, _sender, sendResponse) => {
  if (message.type !== 'REFACTR_AUTH_HANDOFF') return false;

  const supabase = getSupabaseClient();
  supabase.auth
    .setSession({ access_token: message.access_token, refresh_token: message.refresh_token })
    .then(({ error }) => sendResponse({ ok: !error, error: error?.message }))
    .catch((err) => sendResponse({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' }));

  return true; // keep the message channel open for the async sendResponse
});
