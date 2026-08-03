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
