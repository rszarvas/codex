const VIDEO_SELECTORS = 'video, video source, a[href]';
const MEDIA_URL_PATTERN = /\.(mp4|m4v|webm|mov|avi|mkv|ogg|ogv|m3u8|mpd)(\?|#|$)/i;

collectAndSendMedia();

const observer = new MutationObserver(() => {
  collectAndSendMedia();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['src', 'href']
});

window.addEventListener('loadedmetadata', collectAndSendMedia, true);
window.addEventListener('play', collectAndSendMedia, true);

function collectAndSendMedia() {
  const items = Array.from(document.querySelectorAll(VIDEO_SELECTORS))
    .map(mediaFromElement)
    .filter(Boolean);

  if (items.length > 0) {
    chrome.runtime.sendMessage({ type: 'PAGE_MEDIA_FOUND', items });
  }
}

function mediaFromElement(element) {
  const rawUrl = element.currentSrc || element.src || element.href;
  if (!rawUrl) {
    return null;
  }

  const absoluteUrl = new URL(rawUrl, document.baseURI).toString();
  if (!isMediaElement(element) && !MEDIA_URL_PATTERN.test(absoluteUrl)) {
    return null;
  }

  return {
    url: absoluteUrl,
    label: buildLabel(element, absoluteUrl),
    type: element.type || element.getAttribute('type') || inferType(absoluteUrl),
    source: isMediaElement(element) ? 'page video tag' : 'page link'
  };
}

function isMediaElement(element) {
  return element instanceof HTMLVideoElement || element instanceof HTMLSourceElement;
}

function buildLabel(element, url) {
  const title = element.getAttribute('title') || element.getAttribute('aria-label');
  if (title) {
    return title;
  }

  const parsed = new URL(url);
  return decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || document.title || 'video');
}

function inferType(url) {
  if (/\.m3u8(\?|#|$)/i.test(url)) {
    return 'HLS playlist';
  }
  if (/\.mpd(\?|#|$)/i.test(url)) {
    return 'DASH manifest';
  }
  const match = url.match(/\.([a-z0-9]{2,5})(\?|#|$)/i);
  return match ? match[1].toUpperCase() : 'video';
}
