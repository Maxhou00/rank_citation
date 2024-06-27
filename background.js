chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchCsvFile") {
      const csvFilePath = chrome.runtime.getURL('assets/scimagojr_2023.csv');
      fetch(csvFilePath)
          .then(response => response.text())
          .then(data => {
              sendResponse({data: data});
          })
          .catch(error => console.error('Error fetching CSV:', error));
      return true; // Indicates you wish to send a response asynchronously
  }
});
