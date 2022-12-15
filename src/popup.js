import { initialOptions } from './utils';

const fileOpenBtn = document.querySelector('#upload-file-btn');
const fileInput = document.querySelector('#upload-file');
const voiceSelect = document.querySelector('select#voice');
const speedRange = document.querySelector('input#rate');
const volumeRange = document.querySelector('input#volume');
const optionsToggleBtn = document.querySelector('button#options-toggle-btn');
const optionInputsDiv = document.querySelector('.options__inputs');
const inputs = [voiceSelect, speedRange, volumeRange];
const pauseBtn = document.querySelector('#pause-btn');
const stopBtn = document.querySelector('#stop-btn');
const summarizeAllBtn = document.querySelector('#summarize_all');
const showSummaryTextCheckbox = document.querySelector('#show-txt-checkbox');

let options = initialOptions;

// HTTPS REQUESTS
//TODO: showing loading state
async function extractFileText() {
  const data = new FormData();
  data.append('input_file', fileInput.files[0], fileInput.files[0].name);
  data.append('language', 'english');

  const options = {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'ae3e795ee7msh35e5ba83e704f20p12babcjsnc1e1876e52a7',
      'X-RapidAPI-Host': 'text-analysis12.p.rapidapi.com',
    },
    body: data,
  };

  try {
    let response = await fetch(
      'https://text-analysis12.p.rapidapi.com/text-mining/api/v1.1',
      options
    );
    let data = await response.json();

    chrome.runtime.sendMessage(
      { type: 'GET_SUMMARY_POPUP', text: data.text },
      () => { }
    );
    window.close();
  } catch (err) {
    console.error('cannot extract text');
  }
}

// OPTIONS HANDLING
chrome.storage.local.get(['options', 'settings'], (value) => {
  if (value.options) {
    options = value.options;
    inputs.forEach((input) => {
      let inputId = input.id;
      input.value = +options[inputId];
    });
  }

  if (value.options?.showSummary) {
    showSummaryTextCheckbox.checked = Boolean(value.options.showSummary);
  }
});

// EVENT HANDLERS
function fileInputClickHandler() {
  fileInput.click();
}
function toggleOptions() {
  optionInputsDiv.classList.toggle('active');
}

function onValueChange(e) {
  let changed = e.target.attributes.id.nodeValue;
  options = {
    ...options,
    [changed]: Math.floor(e.target.value) || e.target.value,
  };
  chrome.storage.local.set({
    options: options,
  });
}

function togglePause() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_PAUSE' }, () => { });
  });
}

function stopSpeech() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'STOP' }, () => { });
  });
}

function textVisiblityChangeHandler(e) {
  //! Overrides all settings
  const shouldShowSummary = e.target.checked;

  options = {
    ...options,
    showSummary: shouldShowSummary,
  };
  chrome.storage.local.set({
    options: options,
  });
}

// EVENT LISTENERS
fileOpenBtn.addEventListener('click', fileInputClickHandler);
fileInput.addEventListener('change', extractFileText);
optionsToggleBtn.addEventListener('click', toggleOptions);
pauseBtn.addEventListener('click', togglePause);
stopBtn.addEventListener('click', stopSpeech);
showSummaryTextCheckbox.addEventListener('change', textVisiblityChangeHandler);
inputs.forEach((input) => {
  input.addEventListener('change', onValueChange);
});
summarizeAllBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'SUMMARIZE_ALL' }, () => { });
  });
  window.close();
})

