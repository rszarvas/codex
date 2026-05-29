const DEFAULT_SETTINGS = {
  targetFolder: 'VideoStreamMento',
  saveAs: false
};

const form = document.querySelector('#options-form');
const targetFolder = document.querySelector('#target-folder');
const saveAs = document.querySelector('#save-as');
const status = document.querySelector('#status');

loadSettings();
form.addEventListener('submit', saveSettings);

async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  targetFolder.value = settings.targetFolder;
  saveAs.checked = Boolean(settings.saveAs);
}

async function saveSettings(event) {
  event.preventDefault();

  const settings = {
    targetFolder: sanitizePath(targetFolder.value) || DEFAULT_SETTINGS.targetFolder,
    saveAs: saveAs.checked
  };

  await chrome.storage.sync.set(settings);
  targetFolder.value = settings.targetFolder;
  status.textContent = 'Beállítások elmentve.';
  setTimeout(() => {
    status.textContent = '';
  }, 2500);
}

function sanitizePath(path) {
  return path
    .split(/[\\/]+/)
    .map((part) => part.replace(/[<>:"\\|?*\u0000-\u001F]/g, '_').trim())
    .filter(Boolean)
    .join('/');
}
