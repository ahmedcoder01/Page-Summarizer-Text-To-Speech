export const initialOptions = {
  lang: 'en',
  pitch: 1,
  rate: 1,
  voice: 1,
  volume: 1,
  showSummary: false,
};

export function createElement({ tag = 'div', append = null, ...props }) {
  let e = document.createElement(tag);

  for (let key in props) {
    e[key] = props[key];
  }

  if (append) append.append(e);

  return e;
}
