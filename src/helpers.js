import { createElement } from './utils';
import './components.css';


export function displayReadyAudioBtn(callback) {
  let holder = createElement({
    id: 'tts-extension-holder',
    innerHTML: `Document Summarized!`,
  });
  let playBtn = createElement({
    tag: 'button',
    id: 'tts-extension-btn',
    innerHTML: "Play",
    append: holder,
  });
  playBtn.addEventListener('click', playDoc);
  function playDoc(e) {
    callback(e);
    holder.remove();
  }
  document.body.append(holder);

  setTimeout(() => {
    holder.remove();
  }, 20000);
}

export function displayAudioText(text) {
  let holder = createElement({
    id: 'tts-extension-holder',
    textContent: text,
    append: document.body,
  });
  return holder;
}
