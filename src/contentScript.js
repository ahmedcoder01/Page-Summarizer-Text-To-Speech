import { initialOptions } from './utils';
import { displayAudioText, displayReadyAudioBtn } from './components';

let voices = [];
const speech = new SpeechSynthesisUtterance();
let options = initialOptions;
let audioText;

// get voices
chrome.storage.local.get(['options'], (res) => {
  console.log(res);
  if (res?.options) {
    options = res.options;
  }
});
// real time update options
chrome.storage.onChanged.addListener((changes) => {
  console.log(changes);
  if (changes?.options?.newValue) {
    options = changes.options.newValue;
  }
});

//* run speech command (double shift)
let commandTriggerCount = 0;
function checkKey(e) {
  //* Shift button will trigger the translation process;
  if (e.keyCode != 16) {
    commandTriggerCount = 0;
    return;
  }

  if (commandTriggerCount == 0) {
    commandTriggerCount++;
    return;
  }

  commandTriggerCount = 0;
  chrome.runtime.sendMessage(
    { type: 'GET_SUMMARY', text: window.getSelection().toString() },
    (text) => {
      console.log(text);
      speak(text);
    }
  );
}

// SPEECH FUNCTIONS
function speak(text) {
  updateOptions(options);
  const showSummaryText = options?.showSummary;

  if (showSummaryText) {
    console.log('should show summary');
    audioText = displayAudioText(text);
    speech.addEventListener('end', () => {
      audioText.remove();
    });
  }

  if (speechSynthesis.paused) {
    speechSynthesis.paused = false;
  }

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  speech.text = text;
  speechSynthesis.speak(speech);
  console.log(speechSynthesis.speaking);
}
function togglePause() {
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
  } else {
    speechSynthesis.pause();
  }
}
function cancelCurrentSpeech() {
  speechSynthesis.cancel();
}

// REALTIME MESSAGING HANDLING
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'SPEAK':
      console.log(request.text);
      displayReadyAudioBtn(() => speak(request.text));
      break;
    case 'TOGGLE_PAUSE':
      togglePause();
      break;
    case 'STOP':
      cancelCurrentSpeech();
      break;

    case "SUMMARIZE_ALL":
      console.log("summarize all");
      const allText = document.body.innerText;
      chrome.runtime.sendMessage(
        { type: "GET_SUMMARY", text: allText },
        (text) => {
          console.log(text);
          speak(text);
        }
      );

    default:
      break;
  }
});

// HELPER FUNCTIONS
function updateOptions(options) {
  for (let option in options) {
    if (!isNaN(speech[option])) {
      if (option == 'voice') {
        speech.voice = voices[+options[option]];
        continue;
      }

      speech[option] = +options[option] || options[option];
    }
  }
}

// EVENT HANDLERS
function populateVoices() {
  voices = this.getVoices().filter((voice) => voice.lang.includes('en'));
  speech.voice = voices[options.voice];
}

// LISTENERS
document.addEventListener('keydown', checkKey);
speechSynthesis.addEventListener('voiceschanged', populateVoices);

