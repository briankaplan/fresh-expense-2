// Initialize Dexie database
const db = new Dexie('PasswordCleanupDB');

// Define database schema
db.version(1).stores({
  passwords: '++id, website, username, batchNumber, status, priority, importance',
  batches: '++batchNumber, totalPasswords, completed, deleted, skipped, pending, inProgress'
});

// Constants
const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  DELETED: 'deleted',
  SKIPPED: 'skipped'
};

// UI Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const totalPasswordsEl = document.getElementById('totalPasswords');
const completedPasswordsEl = document.getElementById('completedPasswords');
const currentBatchEl = document.getElementById('currentBatch');
const overallProgressEl = document.getElementById('overallProgress');
const progressFillEl = document.getElementById('progressFill');
const batchContainer = document.getElementById('batchContainer');

// Event Listeners
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', async (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'text/csv') {
    await processCSVFile(file);
  } else {
    alert('Please upload a CSV file');
  }
});

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await processCSVFile(file);
  }
});

// Process CSV file
async function processCSVFile(file) {
  try {
    const text = await file.text();
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        await importPasswords(results.data);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file');
      }
    });
  } catch (error) {
    console.error('Error reading file:', error);
    alert('Error reading file');
  }
}

// Import passwords into database
async function importPasswords(data) {
  try {
    // Clear existing data
    await db.passwords.clear();
    await db.batches.clear();
    
    // Process passwords
    const batchSize = 15; // Configurable batch size
    const passwords = data.map((row, index) => ({
      website: row.Website || row.website || '',
      url: row.URL || row.url || '',
      username: row.Username || row.username || '',
      priority: parseInt(row.Priority) || 3,
      importance: parseInt(row.Importance) || 1,
      status: STATUS.PENDING,
      batchNumber: Math.floor(index / batchSize) + 1
    }));
    
    // Create batches
    const batchCount = Math.ceil(passwords.length / batchSize);
    const batches = Array.from({ length: batchCount }, (_, i) => {
      const batchPasswords = passwords.filter(p => p.batchNumber === i + 1);
      return {
        batchNumber: i + 1,
        totalPasswords: batchPasswords.length,
        completed: 0,
        deleted: 0,
        skipped: 0,
        pending: batchPasswords.length,
        inProgress: 0
      };
    });
    
    // Save to database
    await db.passwords.bulkAdd(passwords);
    await db.batches.bulkAdd(batches);
    
    // Update UI
    await updateUI();
    
    alert(`Successfully imported ${passwords.length} passwords into ${batchCount} batches`);
  } catch (error) {
    console.error('Error importing passwords:', error);
    alert('Error importing passwords');
  }
}

// Update UI with current stats
async function updateUI() {
  try {
    const totalPasswords = await db.passwords.count();
    const completedPasswords = await db.passwords.where('status').anyOf([STATUS.COMPLETED, STATUS.DELETED, STATUS.SKIPPED]).count();
    const currentBatch = await getCurrentBatch();
    const progress = totalPasswords ? Math.round((completedPasswords / totalPasswords) * 100) : 0;
    
    // Update stats
    totalPasswordsEl.textContent = totalPasswords;
    completedPasswordsEl.textContent = completedPasswords;
    currentBatchEl.textContent = currentBatch;
    overallProgressEl.textContent = `${progress}%`;
    progressFillEl.style.width = `${progress}%`;
    
    // Update batch list
    await updateBatchList();
  } catch (error) {
    console.error('Error updating UI:', error);
  }
}

// Get current batch number
async function getCurrentBatch() {
  const batches = await db.batches.toArray();
  for (const batch of batches) {
    if (batch.pending > 0 || batch.inProgress > 0) {
      return batch.batchNumber;
    }
  }
  return batches.length;
}

// Update batch list display
async function updateBatchList() {
  try {
    const batches = await db.batches.toArray();
    batchContainer.innerHTML = '';
    
    for (const batch of batches) {
      const completed = batch.completed + batch.deleted + batch.skipped;
      const progress = Math.round((completed / batch.totalPasswords) * 100);
      
      const batchEl = document.createElement('div');
      batchEl.className = 'batch-item';
      batchEl.innerHTML = `
        <div>
          <h3>Batch ${batch.batchNumber}</h3>
          <p>${completed}/${batch.totalPasswords} passwords processed</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
        <div>
          <span class="badge badge-success">${batch.completed} completed</span>
          <span class="badge badge-danger">${batch.deleted} deleted</span>
          <span class="badge badge-warning">${batch.skipped} skipped</span>
          ${batch.pending > 0 ? `<span class="badge badge-info">${batch.pending} pending</span>` : ''}
        </div>
      `;
      
      batchContainer.appendChild(batchEl);
    }
  } catch (error) {
    console.error('Error updating batch list:', error);
  }
}

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
}); 