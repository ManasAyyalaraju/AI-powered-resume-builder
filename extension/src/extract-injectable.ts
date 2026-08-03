// Standalone bundle injected into arbitrary pages via chrome.scripting.executeScript
// (files-based injection) when the popup is opened manually on a page the
// content script isn't already running on. Stashes the result on `window`
// so a second, trivial `func`-based executeScript call can read it back
// reliably (chrome.scripting's `result` capture is only reliable for `func`,
// not for the completion value of an injected file).
import { extractJobContext } from './lib/extract-jd';

(window as unknown as { __refactrJobContext: ReturnType<typeof extractJobContext> }).__refactrJobContext =
  extractJobContext();
