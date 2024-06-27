
// Define the observer
const observer = new MutationObserver((mutations, obs) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(addedNode => {
        const listItems = getListItems();

        if (listItems.length > 0) {
          listItems.forEach(item => {
            item.setAttribute('data-sjr-processed', 'true');
            const journalName = item.getElementsByTagName('i')[0].textContent;

            chrome.runtime.sendMessage({action: "fetchCsvFile"}, (response) => {
              const csvData = parseCsv(response.data);
              const journalData = findJournalInCsv(journalName, csvData);

              if (journalData) {
                const newDiv = createSjrTag(journalData);

                item.appendChild(newDiv);
              } else {
                const errorDiv = document.createElement('div');

                errorDiv.textContent = "Rank not found";
              }
            });
          });
        }
      });
    };
  });
});

const config = { childList: true, subtree: true };
observer.observe(document.body, config);

function getListItems() {
  return document.querySelectorAll('.contents[role="listitem"] > .group.contents > div:nth-child(3):not([data-sjr-processed]');
}

function parseCsv(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    const headers = lines[0].split(';').map(header => header.replace(/ /g, '_'));

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim().length === 0) {
        continue;
      }

      const obj = {};
      const currentline = lines[i].split(';');

      for (let j = 0; j < headers.length; j++) {
        if (headers[j] == 'Title') {
          obj[headers[j]] = currentline[j].replace(/^"|"$/g, '');
        } else {
          obj[headers[j]] = currentline[j];
        }
      }
      result.push(obj);
    }
    return result;
}

function findJournalInCsv(journalName, csvData) {
  return csvData.find(row => row.Title === journalName);
}

function createSjrTag(journalData) {
  const flexDiv = document.createElement('div');
  flexDiv.classList.add('flex', 'gap-2');

  const sjrDiv = document.createElement('div');
  sjrDiv.classList.add('p-1', 'text-white');
  sjrDiv.textContent = "SJR: " + journalData.SJR_Best_Quartile + "; " + journalData.SJR
  switch (journalData.SJR_Best_Quartile) {
    case 'Q1':
      sjrDiv.classList.add('bg-green-9');
      break;
    case 'Q2':
      sjrDiv.classList.add('bg-yellow-9');
      break;
    case 'Q3':
      sjrDiv.classList.add('bg-orange-9');
      break;
    case 'Q4':
      sjrDiv.classList.add('bg-red-9');
      break;
    default:
      break;
  }
  flexDiv.appendChild(sjrDiv);

  const rankDiv = document.createElement('div');
  rankDiv.textContent = 'SciMagoJr rank: ' + journalData.Rank;
  flexDiv.appendChild(rankDiv);

  const scimagojrTag = document.createElement('a');
  const scimagojrUrl = "https://www.scimagojr.com/journalsearch.php?q=" + journalData.Sourceid + "&tip=sid&clean=0";
  scimagojrTag.href = scimagojrUrl;
  scimagojrTag.style = "color: blue; text-decoration: underline;";
  scimagojrTag.textContent = "Scimago Source";
  flexDiv.appendChild(scimagojrTag);

  return flexDiv;
}

