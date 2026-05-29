const list = document.querySelector('#media-list');
const status = document.querySelector('#status');
const refreshButton = document.querySelector('#refresh');
const optionsButton = document.querySelector('#open-options');

refreshButton.addEventListener('click', loadMedia);
optionsButton.addEventListener('click', () => chrome.runtime.openOptionsPage());

loadMedia();

async function loadMedia() {
  setStatus('Keresés...');
  list.replaceChildren();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    renderEmpty('Nincs aktív lap.');
    return;
  }

  const response = await chrome.runtime.sendMessage({ type: 'GET_MEDIA', tabId: tab.id });
  if (!response?.ok) {
    renderEmpty(response?.error || 'Nem sikerült beolvasni a videókat.');
    return;
  }

  if (response.items.length === 0) {
    renderEmpty('Nem találtam letölthető videó URL-t ezen az oldalon. Indítsd el a videót, majd frissíts.');
    return;
  }

  setStatus(`${response.items.length} találat`);
  for (const item of response.items) {
    list.append(createMediaItem(item));
  }
}

function createMediaItem(item) {
  const wrapper = document.createElement('article');
  wrapper.className = 'media-item';

  const title = document.createElement('h2');
  title.textContent = item.label || 'Videó';

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `${item.type || 'video'} • ${item.source || 'ismeretlen forrás'}`;

  const url = document.createElement('p');
  url.className = 'url';
  url.textContent = item.url;
  url.title = item.url;

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = item.url.startsWith('blob:') ? 'Nem menthető' : 'Letöltés';
  button.disabled = item.url.startsWith('blob:');
  button.addEventListener('click', () => downloadItem(item));

  wrapper.append(title, meta, url, button);
  return wrapper;
}

async function downloadItem(item) {
  setStatus('Letöltés indítása...');
  const response = await chrome.runtime.sendMessage({ type: 'DOWNLOAD_MEDIA', item });
  if (response?.ok) {
    setStatus('Letöltés elindítva.');
  } else {
    setStatus(response?.error || 'Nem sikerült letölteni.');
  }
}

function renderEmpty(message) {
  const empty = document.createElement('p');
  empty.className = 'empty';
  empty.textContent = message;
  list.append(empty);
  setStatus('');
}

function setStatus(message) {
  status.textContent = message;
}
