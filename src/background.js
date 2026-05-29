const MEDIA_EXTENSIONS = [
  '.mp4',
  '.m4v',
  '.webm',
  '.mov',
  '.avi',
  '.mkv',
  '.ogg',
  '.ogv',
  '.m3u8',
  '.mpd'
];

const MEDIA_CONTENT_TYPES = [
  'video/',
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'application/dash+xml'
];

const DEFAULT_SETTINGS = {
  targetFolder: 'VideoStreamMento',
  saveAs: false
};

const tabMedia = new Map();

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set({ ...DEFAULT_SETTINGS, ...stored });
});

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId < 0 || !details.url || !isLikelyMedia(details.url, details.responseHeaders)) {
      return;
    }

    rememberMedia(details.tabId, {
      url: details.url,
      type: getContentType(details.responseHeaders) || guessType(details.url),
      source: 'network',
      detectedAt: Date.now()
    });
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

chrome.tabs.onRemoved.addListener((tabId) => {
  tabMedia.delete(tabId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'PAGE_MEDIA_FOUND' && sender.tab?.id !== undefined) {
    for (const item of message.items || []) {
      rememberMedia(sender.tab.id, {
        ...item,
        source: item.source || 'page',
        detectedAt: Date.now()
      });
    }
    sendResponse({ ok: true });
    return false;
  }

  if (message?.type === 'GET_MEDIA') {
    handleGetMedia(message.tabId).then(sendResponse);
    return true;
  }

  if (message?.type === 'DOWNLOAD_MEDIA') {
    handleDownload(message.item).then(sendResponse);
    return true;
  }

  return false;
});

async function handleGetMedia(tabId) {
  if (!tabId && tabId !== 0) {
    return { ok: false, error: 'Nincs aktív lap.' };
  }

  const items = Array.from(tabMedia.get(tabId)?.values() || []);
  items.sort((a, b) => (b.detectedAt || 0) - (a.detectedAt || 0));
  return { ok: true, items };
}

async function handleDownload(item) {
  if (!item?.url || item.url.startsWith('blob:')) {
    return {
      ok: false,
      error: 'Ez a videó blob/DRM vagy nem közvetlenül letölthető URL. Csak nem védett, böngészőből közvetlenül elérhető média menthető.'
    };
  }

  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const filename = buildFilename(item, settings.targetFolder);

  const downloadId = await chrome.downloads.download({
    url: item.url,
    filename,
    saveAs: Boolean(settings.saveAs),
    conflictAction: 'uniquify'
  });

  return { ok: true, downloadId };
}

function rememberMedia(tabId, item) {
  if (!item?.url) {
    return;
  }

  const normalized = normalizeUrl(item.url);
  if (!normalized) {
    return;
  }

  const entries = tabMedia.get(tabId) || new Map();
  const previous = entries.get(normalized) || {};
  entries.set(normalized, {
    ...previous,
    ...item,
    url: normalized,
    label: item.label || previous.label || createLabel(normalized),
    type: item.type || previous.type || guessType(normalized),
    detectedAt: item.detectedAt || previous.detectedAt || Date.now()
  });
  tabMedia.set(tabId, entries);
}

function isLikelyMedia(url, headers = []) {
  const lowerUrl = url.toLowerCase().split('?')[0];
  if (MEDIA_EXTENSIONS.some((extension) => lowerUrl.endsWith(extension))) {
    return true;
  }

  const contentType = getContentType(headers);
  return MEDIA_CONTENT_TYPES.some((type) => contentType.startsWith(type));
}

function getContentType(headers = []) {
  const header = headers.find((item) => item.name?.toLowerCase() === 'content-type');
  return header?.value?.toLowerCase().split(';')[0].trim() || '';
}

function guessType(url) {
  const lowerUrl = url.toLowerCase().split('?')[0];
  if (lowerUrl.endsWith('.m3u8')) {
    return 'HLS playlist';
  }
  if (lowerUrl.endsWith('.mpd')) {
    return 'DASH manifest';
  }
  const extension = MEDIA_EXTENSIONS.find((item) => lowerUrl.endsWith(item));
  return extension ? extension.replace('.', '').toUpperCase() : 'video';
}

function normalizeUrl(url) {
  if (url.startsWith('blob:')) {
    return url;
  }

  const parsed = new URL(url);
  parsed.hash = '';
  return parsed.toString();
}

function createLabel(url) {
  const parsed = new URL(url);
  const name = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || 'video');
  return name.length > 80 ? `${name.slice(0, 77)}...` : name;
}

function buildFilename(item, targetFolder) {
  const folder = sanitizePath(targetFolder || DEFAULT_SETTINGS.targetFolder);
  const parsed = new URL(item.url);
  const pathName = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || 'video');
  const cleanName = sanitizeFileName(pathName);
  const extension = extensionFromName(cleanName) || extensionFromType(item.type) || '.mp4';
  const baseName = cleanName.endsWith(extension) ? cleanName : `${cleanName}${extension}`;
  return folder ? `${folder}/${baseName}` : baseName;
}

function sanitizePath(path) {
  return path
    .split(/[\\/]+/)
    .map(sanitizeFileName)
    .filter(Boolean)
    .join('/');
}

function sanitizeFileName(name) {
  return name
    .replace(/[<>:"\\|?*\u0000-\u001F]/g, '_')
    .replace(/^\.+$/, 'video')
    .slice(0, 120) || 'video';
}

function extensionFromName(name) {
  const match = name.toLowerCase().match(/\.[a-z0-9]{2,5}$/);
  return match ? match[0] : '';
}

function extensionFromType(type = '') {
  const normalized = type.toLowerCase();
  if (normalized.includes('mpegurl') || normalized.includes('hls')) {
    return '.m3u8';
  }
  if (normalized.includes('dash')) {
    return '.mpd';
  }
  if (normalized.includes('webm')) {
    return '.webm';
  }
  if (normalized.includes('ogg')) {
    return '.ogv';
  }
  return '.mp4';
}
