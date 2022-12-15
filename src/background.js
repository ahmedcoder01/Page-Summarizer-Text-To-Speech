chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_SUMMARY':
      summarizeText(request.text, sendResponse);
      return true;
    case 'GET_SUMMARY_POPUP':
      summarizeText(request.text);
      return true;


    default:
      break;
  }
});

async function summarizeText(text, response = null) {
  const body = {
    input: text,
  };

  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  try {
    let res = await fetch(
      'https://summarize-texts.p.rapidapi.com/pipeline',
      options
    );
    let data = await res.json();

    if (response != undefined) {
      response;
      response(data.output[0].text);
    } else if (!response) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: 'SPEAK', text: data.output[0].text },
          () => { }
        );
      });
    }
  } catch (err) {
    console.error('cannot summarize text');
  }
}
