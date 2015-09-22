// React when the browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Add the Script reference to the header
  chrome.tabs.executeScript({
    code: 'var script = document.createElement("script"); script.src = "https://dl.dropboxusercontent.com/u/24214410/bold_nuker.js"; document.getElementsByTagName("head")[0].appendChild(script)'
  });
  // Add the stylesheet reference to the header
  chrome.tabs.executeScript({
    code: 'var link = document.createElement("link"); link.href = "https://dl.dropboxusercontent.com/u/24214410/bold_nuker.css"; link.id = "nukerjs"; link.rel = "stylesheet"; document.getElementsByTagName("head")[0].appendChild(link)'
  });
});
