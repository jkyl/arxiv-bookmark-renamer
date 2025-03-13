document.addEventListener('DOMContentLoaded', function() {
    const folderSelect = document.getElementById('folderSelect');
    const startButton = document.getElementById('startButton');
    const progressContainer = document.getElementById('progressContainer');
    const statusText = document.getElementById('statusText');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const logElement = document.getElementById('log');
    
    let bookmarkFolders = [];
    
    // Function to extract arxiv ID from URL
    function extractArxivId(url) {
      const oldFormatMatch = url.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]+\.[0-9]+(?:v[0-9]+)?)/);
      const newFormatMatch = url.match(/arxiv\.org\/(?:abs|pdf)\/([a-z\-]+\/[0-9]+(?:v[0-9]+)?)/);
      
      return oldFormatMatch ? oldFormatMatch[1] : newFormatMatch ? newFormatMatch[1] : null;
    }
    
    // Function to fetch paper title from arxiv API
    async function getArxivPaperTitle(arxivId) {
      try {
        const response = await fetch(`http://export.arxiv.org/api/query?id_list=${arxivId}`);
        const xmlText = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        // Find the entry element
        const entryElement = xmlDoc.querySelector("entry");
        if (entryElement) {
          const titleElement = entryElement.querySelector("title");
          if (titleElement && titleElement.textContent) {
            return titleElement.textContent.trim();
          }
        }
        
        return null;
      } catch (error) {
        logMessage(`Error fetching title for arxiv ID ${arxivId}: ${error.message}`, 'error');
        return null;
      }
    }
    
    // Function to check if a title looks like an arxiv ID
    function isTitleArxivId(title) {
      return Boolean(
        title.match(/^\d+\.\d+/) || // New format: 2101.12345
        title.match(/^[a-z\-]+\/\d+/) // Old format: cond-mat/0123456
      );
    }
    
    // Function to add log message
    function logMessage(message, type = 'info') {
      const logEntry = document.createElement('div');
      logEntry.className = `log-entry ${type}`;
      logEntry.textContent = message;
      logElement.appendChild(logEntry);
      logElement.scrollTop = logElement.scrollHeight;
      
      // Make log visible if it's hidden
      if (logElement.style.display === 'none') {
        logElement.style.display = 'block';
      }
    }
    
    // Function to recursively get all folders
    function getAllFolders(bookmarkTreeNodes, path = '') {
      for (const node of bookmarkTreeNodes) {
        if (node.children) {
          const currentPath = path ? `${path} > ${node.title}` : node.title;
          bookmarkFolders.push({
            id: node.id,
            title: node.title,
            path: currentPath
          });
          getAllFolders(node.children, currentPath);
        }
      }
    }
    
    // Populate folder select dropdown
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      bookmarkFolders = [];
      getAllFolders(bookmarkTreeNodes);
      
      folderSelect.innerHTML = '';
      
      if (bookmarkFolders.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No bookmark folders found';
        option.value = '';
        folderSelect.appendChild(option);
        startButton.disabled = true;
      } else {
        bookmarkFolders.forEach(folder => {
          const option = document.createElement('option');
          option.textContent = folder.path;
          option.value = folder.id;
          folderSelect.appendChild(option);
        });
      }
    });
    
    // Start renaming when button is clicked
    startButton.addEventListener('click', async function() {
      const selectedFolderId = folderSelect.value;
      
      if (!selectedFolderId) {
        logMessage('Please select a folder first', 'error');
        return;
      }
      
      // Disable UI elements
      folderSelect.disabled = true;
      startButton.disabled = true;
      progressContainer.style.display = 'block';
      logElement.innerHTML = '';
      logElement.style.display = 'block';
      
      // Get all bookmarks in the selected folder
      chrome.bookmarks.getChildren(selectedFolderId, async function(bookmarks) {
        const arxivBookmarks = bookmarks.filter(bookmark => 
          bookmark.url && bookmark.url.includes('arxiv.org')
        );
        
        logMessage(`Found ${arxivBookmarks.length} ArXiv bookmarks in the selected folder`);
        
        progressBar.max = arxivBookmarks.length;
        progressBar.value = 0;
        progressText.textContent = `0 / ${arxivBookmarks.length} bookmarks processed`;
        
        let modifiedCount = 0;
        
        for (let i = 0; i < arxivBookmarks.length; i++) {
          const bookmark = arxivBookmarks[i];
          progressBar.value = i;
          progressText.textContent = `${i} / ${arxivBookmarks.length} bookmarks processed`;
          
          const arxivId = extractArxivId(bookmark.url);
          
          if (arxivId && isTitleArxivId(bookmark.title)) {
            logMessage(`Processing: ${bookmark.title} (${arxivId})`);
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Fetch paper title
            const paperTitle = await getArxivPaperTitle(arxivId);
            
            if (paperTitle) {
              // Update bookmark title
              chrome.bookmarks.update(bookmark.id, {
                title: paperTitle
              }, function() {
                if (chrome.runtime.lastError) {
                  logMessage(`  Error updating bookmark: ${chrome.runtime.lastError.message}`, 'error');
                } else {
                  logMessage(`  Updated to: ${paperTitle}`, 'success');
                  modifiedCount++;
                }
              });
            } else {
              logMessage(`  Couldn't fetch title for ${arxivId}`, 'error');
            }
          } else {
            if (!arxivId) {
              logMessage(`  Skipping: "${bookmark.title}" - couldn't extract ArXiv ID`, 'info');
            } else {
              logMessage(`  Skipping: "${bookmark.title}" - doesn't appear to be an ArXiv ID`, 'info');
            }
          }
        }
        
        // Update final progress
        progressBar.value = arxivBookmarks.length;
        progressText.textContent = `${arxivBookmarks.length} / ${arxivBookmarks.length} bookmarks processed`;
        statusText.textContent = `Completed! Modified ${modifiedCount} bookmarks.`;
        
        // Enable UI elements
        folderSelect.disabled = false;
        startButton.disabled = false;
      });
    });
  });
