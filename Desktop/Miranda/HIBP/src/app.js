// Import our components
import BatchManager from './BatchManager.js';
import SecurityAnalyzer from './SecurityAnalyzer.js';
import ProgressTracker from './ProgressTracker.js';

// Initialize Dexie database with expanded schema
const db = new Dexie('PasswordCleanupDB');

db.version(1).stores({
  passwords: '++id, website, username, batchNumber, status, priority, importance, lastModified, breached',
  batches: '++batchNumber, totalPasswords, completed, deleted, skipped, pending, inProgress, startTime, completionTime',
  securityMetrics: '++id, timestamp',
  progress: '++id, timestamp',
  config: 'key'
});

// Initialize components
const batchManager = new BatchManager(db);
const securityAnalyzer = new SecurityAnalyzer(db);
const progressTracker = new ProgressTracker(db);

// Enhanced UI Elements
const ui = {
  upload: {
    area: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput')
  },
  stats: {
    totalPasswords: document.getElementById('totalPasswords'),
    completedPasswords: document.getElementById('completedPasswords'),
    currentBatch: document.getElementById('currentBatch'),
    overallProgress: document.getElementById('overallProgress'),
    progressFill: document.getElementById('progressFill')
  },
  security: {
    riskLevel: document.getElementById('securityRiskLevel'),
    criticalIssues: document.getElementById('criticalIssues'),
    weakPasswords: document.getElementById('weakPasswords'),
    reusedPasswords: document.getElementById('reusedPasswords')
  },
  progress: {
    daysActive: document.getElementById('daysActive'),
    averagePerDay: document.getElementById('averagePerDay'),
    estimatedCompletion: document.getElementById('estimatedCompletion'),
    batchProgress: document.getElementById('batchProgress')
  },
  containers: {
    batch: document.getElementById('batchContainer'),
    security: document.getElementById('securityContainer'),
    recommendations: document.getElementById('recommendationsContainer')
  }
};

// Event Listeners
ui.upload.area.addEventListener('dragover', (e) => {
  e.preventDefault();
  ui.upload.area.classList.add('drag-over');
});

ui.upload.area.addEventListener('dragleave', () => {
  ui.upload.area.classList.remove('drag-over');
});

ui.upload.area.addEventListener('drop', async (e) => {
  e.preventDefault();
  ui.upload.area.classList.remove('drag-over');
  
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'text/csv') {
    await processCSVFile(file);
  } else {
    showNotification('Please upload a CSV file', 'error');
  }
});

ui.upload.fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await processCSVFile(file);
  }
});

// Enhanced CSV Processing
async function processCSVFile(file) {
  try {
    showLoadingIndicator('Analyzing file...');
    
    const text = await file.text();
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        await importPasswords(results.data);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        showNotification('Error parsing CSV file', 'error');
      }
    });
  } catch (error) {
    console.error('Error reading file:', error);
    showNotification('Error reading file', 'error');
  } finally {
    hideLoadingIndicator();
  }
}

// Enhanced Password Import
async function importPasswords(data) {
  try {
    showLoadingIndicator('Processing passwords...');
    
    // Clear existing data
    await db.transaction('rw', db.passwords, db.batches, async () => {
      await db.passwords.clear();
      await db.batches.clear();
      
      // Process and enhance password data
      const passwords = data.map((row, index) => ({
        website: row.Website || row.website || '',
        url: row.URL || row.url || '',
        username: row.Username || row.username || '',
        password: row.Password || row.password || '',
        priority: parseInt(row.Priority) || 3,
        importance: parseInt(row.Importance) || 1,
        status: 'pending',
        lastModified: new Date(),
        breached: row.Breached === 'true' || false,
        notes: row.Notes || '',
        category: row.Category || 'Uncategorized'
      }));

      // Organize into batches
      const batches = await batchManager.organizeBatches(passwords);
      
      // Perform security analysis
      const securityReport = await securityAnalyzer.analyzePasswords();
      
      // Initialize progress tracking
      await progressTracker.initialize();
      
      // Update UI with all new information
      await updateDashboard();
      
      showNotification(`Successfully imported ${passwords.length} passwords into ${batches.length} batches`, 'success');
    });
  } catch (error) {
    console.error('Error importing passwords:', error);
    showNotification('Error importing passwords', 'error');
  } finally {
    hideLoadingIndicator();
  }
}

// Enhanced Dashboard Update
async function updateDashboard() {
  try {
    // Get latest data
    const progress = await progressTracker.updateStats();
    const security = await securityAnalyzer.analyzePasswords();
    
    // Update progress statistics
    updateProgressStats(progress);
    
    // Update security information
    updateSecurityStats(security);
    
    // Update batch list
    await updateBatchList();
    
    // Update recommendations
    updateRecommendations(security.recommendations);
    
  } catch (error) {
    console.error('Error updating dashboard:', error);
    showNotification('Error updating dashboard', 'error');
  }
}

// Update Progress Statistics
function updateProgressStats(progress) {
  const { overview, timeline, batches } = progress;
  
  // Update basic stats
  ui.stats.totalPasswords.textContent = overview.total;
  ui.stats.completedPasswords.textContent = overview.completed;
  ui.stats.currentBatch.textContent = progress.current.batch;
  ui.stats.overallProgress.textContent = `${overview.percentComplete}%`;
  ui.stats.progressFill.style.width = `${overview.percentComplete}%`;
  
  // Update timeline information
  ui.progress.daysActive.textContent = timeline.daysActive;
  ui.progress.averagePerDay.textContent = timeline.averagePerDay.toFixed(1);
  ui.progress.estimatedCompletion.textContent = timeline.estimatedCompletion
    ? timeline.estimatedCompletion.toLocaleDateString()
    : 'Calculating...';
}

// Update Security Statistics
function updateSecurityStats(security) {
  const { summary, issues } = security;
  
  ui.security.riskLevel.textContent = summary.overallRisk;
  ui.security.riskLevel.className = `risk-level risk-${summary.overallRisk.toLowerCase()}`;
  
  ui.security.criticalIssues.textContent = summary.criticalIssues;
  ui.security.weakPasswords.textContent = issues.weakPasswords;
  ui.security.reusedPasswords.textContent = issues.reusedPasswords;
}

// Update Batch List
async function updateBatchList() {
  const batches = await db.batches.toArray();
  ui.containers.batch.innerHTML = '';
  
  batches.forEach(batch => {
    const completed = batch.completed + batch.deleted + batch.skipped;
    const progress = Math.round((completed / batch.totalPasswords) * 100);
    
    const batchEl = createBatchElement(batch, progress);
    ui.containers.batch.appendChild(batchEl);
  });
}

// Create Batch Element
function createBatchElement(batch, progress) {
  const batchEl = document.createElement('div');
  batchEl.className = 'batch-item';
  batchEl.innerHTML = `
    <div class="batch-info">
      <h3>Batch ${batch.batchNumber}</h3>
      <p>${completed}/${batch.totalPasswords} passwords processed</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
    </div>
    <div class="batch-stats">
      <span class="badge badge-success">${batch.completed} completed</span>
      <span class="badge badge-danger">${batch.deleted} deleted</span>
      <span class="badge badge-warning">${batch.skipped} skipped</span>
      ${batch.pending > 0 ? `<span class="badge badge-info">${batch.pending} pending</span>` : ''}
    </div>
    ${batch.inProgress > 0 ? `
    <div class="batch-actions">
      <button class="btn btn-primary btn-sm" onclick="continueBatch(${batch.batchNumber})">
        Continue Batch
      </button>
    </div>
    ` : ''}
  `;
  
  return batchEl;
}

// Update Recommendations
function updateRecommendations(recommendations) {
  ui.containers.recommendations.innerHTML = recommendations
    .map(rec => `
      <div class="recommendation-item priority-${rec.priority.toLowerCase()}">
        <h4>${rec.priority} Priority</h4>
        <p>${rec.action}</p>
        <span class="affected-count">${rec.affected} affected</span>
      </div>
    `)
    .join('');
}

// Utility Functions
function showNotification(message, type = 'info') {
  // Implementation depends on your preferred notification system
  console.log(`${type.toUpperCase()}: ${message}`);
}

function showLoadingIndicator(message) {
  // Implementation depends on your UI
  console.log(`Loading: ${message}`);
}

function hideLoadingIndicator() {
  // Implementation depends on your UI
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
}); 