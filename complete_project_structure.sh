# ====================================================================
# CSV TO JSON CONVERTER - COMPLETE PROJECT STRUCTURE
# ====================================================================

# 1. CREATE PROJECT DIRECTORY
mkdir csv-json-converter
cd csv-json-converter

# 2. CREATE ALL PROJECT FILES

# ====================================================================
# FILE: requirements.txt
# ====================================================================
cat > requirements.txt << 'EOF'
Flask==2.3.3
gunicorn==21.2.0
Werkzeug==2.3.7
flask-cors==4.0.0
EOF

# ====================================================================
# FILE: main.py
# ====================================================================
cat > main.py << 'EOF'
from flask import Flask, render_template_string
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

HTML_CONTENT = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSV to JSON Converter</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            padding: 40px;
            max-width: 1200px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #333;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header p {
            color: #666;
            font-size: 1.1rem;
        }
        
        .upload-section {
            margin-bottom: 30px;
        }
        
        .file-upload-area {
            border: 2px dashed #667eea;
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
        }
        
        .file-upload-area:hover {
            border-color: #764ba2;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
            transform: translateY(-2px);
        }
        
        .file-upload-area.dragover {
            border-color: #764ba2;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
        }
        
        .upload-icon {
            font-size: 3rem;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .upload-text {
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .upload-hint {
            color: #666;
            font-size: 0.9rem;
        }
        
        #fileInput {
            display: none;
        }
        
        .processing-section {
            margin-bottom: 20px;
            display: none;
        }
        
        .processing-bar {
            background: #f0f0f0;
            border-radius: 10px;
            height: 6px;
            overflow: hidden;
        }
        
        .processing-progress {
            background: linear-gradient(90deg, #667eea, #764ba2);
            height: 100%;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .results-section {
            flex: 1;
            display: none;
            flex-direction: column;
            min-height: 0;
        }
        
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .results-info {
            color: #333;
            font-weight: 600;
        }
        
        .action-buttons {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-secondary {
            background: linear-gradient(135deg, #6c757d, #495057);
        }
        
        .btn-secondary:hover {
            box-shadow: 0 10px 20px rgba(108, 117, 125, 0.3);
        }
        
        .json-output {
            flex: 1;
            background: #2d3748;
            border-radius: 8px;
            padding: 20px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            color: #e2e8f0;
            font-size: 0.85rem;
            overflow: auto;
            white-space: pre-wrap;
            line-height: 1.5;
            min-height: 300px;
            max-height: 500px;
            border: 1px solid #4a5568;
        }
        
        .error-message {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
            display: none;
        }
        
        .success-message {
            background: linear-gradient(135deg, #51cf66, #40c057);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
            display: none;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px;
                margin: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .action-buttons {
                flex-direction: column;
            }
        }
        
        /* JSON Syntax Highlighting */
        .json-string { color: #98d982; }
        .json-number { color: #ff8a80; }
        .json-boolean { color: #ff8a80; }
        .json-null { color: #ff8a80; }
        .json-key { color: #82aaff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CSV to JSON Converter</h1>
            <p>Upload your CSV file and convert it to JSON format instantly</p>
        </div>
        
        <div class="error-message" id="errorMessage"></div>
        <div class="success-message" id="successMessage"></div>
        
        <div class="upload-section">
            <div class="file-upload-area" id="uploadArea">
                <div class="upload-icon">📊</div>
                <div class="upload-text">Drop your CSV file here or click to browse</div>
                <div class="upload-hint">Supports .csv files up to 10GB</div>
                <input type="file" id="fileInput" accept=".csv" />
            </div>
        </div>
        
        <div class="processing-section" id="processingSection">
            <div class="processing-bar">
                <div class="processing-progress" id="processingProgress"></div>
            </div>
        </div>
        
        <div class="results-section" id="resultsSection">
            <div class="results-header">
                <div class="results-info" id="resultsInfo"></div>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="resetConverter()">
                        🔄 Convert Another File
                    </button>
                    <button class="btn" onclick="downloadJson()" id="downloadBtn">
                        💾 Download JSON
                    </button>
                    <button class="btn" onclick="copyToClipboard()">
                        📋 Copy to Clipboard
                    </button>
                </div>
            </div>
            <div class="json-output" id="jsonOutput"></div>
        </div>
    </div>

    <script>
        let convertedData = null;
        let fileName = '';
        
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const processingSection = document.getElementById('processingSection');
        const resultsSection = document.getElementById('resultsSection');
        const jsonOutput = document.getElementById('jsonOutput');
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        const resultsInfo = document.getElementById('resultsInfo');
        const processingProgress = document.getElementById('processingProgress');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileSelect);
        
        function handleDragOver(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        }
        
        function handleDragLeave(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        }
        
        function handleDrop(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0]);
            }
        }
        
        function handleFileSelect(e) {
            const files = e.target.files;
            if (files.length > 0) {
                processFile(files[0]);
            }
        }
        
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
        }
        
        function showSuccess(message) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
        }
        
        function hideMessages() {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
        }
        
        function processFile(file) {
            hideMessages();
            
            if (!file.name.toLowerCase().endsWith('.csv')) {
                showError('Please select a valid CSV file.');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024 * 1024) {
                showError('File size exceeds 10GB limit. Please choose a smaller file.');
                return;
            }
            
            fileName = file.name.replace('.csv', '');
            
            processingSection.style.display = 'block';
            resultsSection.style.display = 'none';
            
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress > 90) progress = 90;
                processingProgress.style.width = progress + '%';
            }, 100);
            
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                delimitersToGuess: [',', '\t', '|', ';'],
                transform: function(value, field) {
                    return typeof value === 'string' ? value.trim() : value;
                },
                transformHeader: function(header) {
                    return header.trim();
                },
                complete: function(results) {
                    clearInterval(progressInterval);
                    processingProgress.style.width = '100%';
                    
                    setTimeout(() => {
                        if (results.errors && results.errors.length > 0) {
                            const errorMsg = results.errors.map(err => err.message).join(', ');
                            showError('CSV parsing error: ' + errorMsg);
                            processingSection.style.display = 'none';
                            return;
                        }
                        
                        if (!results.data || results.data.length === 0) {
                            showError('No data found in the CSV file.');
                            processingSection.style.display = 'none';
                            return;
                        }
                        
                        convertedData = results.data;
                        displayResults();
                    }, 500);
                },
                error: function(error) {
                    clearInterval(progressInterval);
                    showError('Error reading file: ' + error.message);
                    processingSection.style.display = 'none';
                }
            });
        }
        
        function displayResults() {
            processingSection.style.display = 'none';
            resultsSection.style.display = 'flex';
            
            const recordCount = convertedData.length;
            const fieldCount = Object.keys(convertedData[0] || {}).length;
            resultsInfo.textContent = `✅ Converted ${recordCount} records with ${fieldCount} fields`;
            
            const jsonString = JSON.stringify(convertedData, null, 2);
            jsonOutput.innerHTML = syntaxHighlight(jsonString);
            
            showSuccess(`Successfully converted ${fileName}.csv to JSON format!`);
        }
        
        function syntaxHighlight(json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }
        
        function downloadJson() {
            if (!convertedData) return;
            
            const jsonString = JSON.stringify(convertedData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showSuccess('JSON file downloaded successfully!');
        }
        
        function copyToClipboard() {
            if (!convertedData) return;
            
            const jsonString = JSON.stringify(convertedData, null, 2);
            navigator.clipboard.writeText(jsonString).then(() => {
                showSuccess('JSON copied to clipboard!');
            }).catch(() => {
                showError('Failed to copy to clipboard. Please try selecting and copying manually.');
            });
        }
        
        function resetConverter() {
            convertedData = null;
            fileName = '';
            fileInput.value = '';
            resultsSection.style.display = 'none';
            processingSection.style.display = 'none';
            hideMessages();
        }
    </script>
</body>
</html>'''

@app.route('/')
def index():
    return render_template_string(HTML_CONTENT)

@app.route('/health')
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
EOF

# ====================================================================
# FILE: Dockerfile
# ====================================================================
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["python", "main.py"]
EOF

# ====================================================================
# FILE: app.yaml (for Google App Engine)
# ====================================================================
cat > app.yaml << 'EOF'
runtime: python311

env_variables:
  FLASK_ENV: production

automatic_scaling:
  min_instances: 0
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 0.5
  disk_size_gb: 10
EOF

# ====================================================================
# FILE: cloudbuild.yaml (for Google Cloud Build)
# ====================================================================
cat > cloudbuild.yaml << 'EOF'
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/csv-json-converter:$SHORT_SHA', '.']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/csv-json-converter:$SHORT_SHA']
  
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'csv-json-converter'
      - '--image'
      - 'gcr.io/$PROJECT_ID/csv-json-converter:$SHORT_SHA'
      - '--platform'
      - 'managed'
      - '--region'
      - 'us-central1'
      - '--allow-unauthenticated'
      - '--memory'
      - '512Mi'
      - '--cpu'
      - '1'
      - '--max-instances'
      - '10'
      - '--port'
      - '8080'

images:
  - 'gcr.io/$PROJECT_ID/csv-json-converter:$SHORT_SHA'
EOF

# ====================================================================
# FILE: .gitignore
# ====================================================================
cat > .gitignore << 'EOF'
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
pip-wheel-metadata/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

.spyderproject
.spyproject
.rope_project
.DS_Store

instance/
.webassets-cache
.coverage
.pytest_cache/

*.log
EOF

# ====================================================================
# FILE: .gcloudignore
# ====================================================================
cat > .gcloudignore << 'EOF'
.git
.gitignore
README.md
.dockerignore
.gcloudignore
*.md
.DS_Store
__pycache__/
*.pyc
*.pyo
*.pyd
.env
.venv/
venv/
EOF

# ====================================================================
# FILE: README.md
# ====================================================================
cat > README.md << 'EOF'
# CSV to JSON Converter

A modern web application for converting CSV files to JSON format with privacy-focused local processing.

## Features

- 🔒 **Privacy-First**: All CSV processing happens in your browser
- 📊 **Robust CSV Parsing**: Supports multiple delimiters and formats
- ✨ **Modern UI**: Clean, responsive interface with real-time feedback
- 💾 **Export Options**: Download JSON files or copy to clipboard
- 🚀 **Fast Processing**: Efficient client-side conversion

## Local Development

### Prerequisites

- Python 3.11+
- pip

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd csv-json-converter
   ```

3. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the application:
   ```bash
   python main.py
   ```

6. Open your browser and go to: http://localhost:5000

### Usage

1. Open the application in your browser
2. Drag and drop a CSV file or click to browse
3. Wait for processing to complete
4. Review the converted JSON
5. Download the JSON file or copy to clipboard

## Deployment

### Google Cloud Run

```bash
export PROJECT_ID="your-project-id"
gcloud builds submit --config cloudbuild.yaml
```

### Google App Engine

```bash
gcloud app deploy app.yaml
```

### Docker

```bash
docker build -t csv-json-converter .
docker run -p 5000:8080 csv-json-converter
```

## Configuration

Environment variables:
- `PORT`: Server port (default: 5000 locally, 8080 in production)
- `FLASK_ENV`: Flask environment (development/production)

## Security

- All file processing happens client-side
- No data is sent to external servers
- HTTPS enabled by default on cloud platforms
- CORS configured for web security

## License

MIT License - see LICENSE file for details
EOF

# ====================================================================
# FILE: run-local.sh (Local development script)
# ====================================================================
cat > run-local.sh << 'EOF'
#!/bin/bash

# CSV to JSON Converter - Local Development Script
set -e

echo "🚀 CSV to JSON Converter - Local Setup"
echo "====================================="

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Run the application
echo "🌟 Starting the application..."
echo "🌐 Open your browser and go to: http://localhost:5000"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

python main.py
EOF

chmod +x run-local.sh

# ====================================================================
# FILE: run-local.bat (Windows batch script)
# ====================================================================
cat > run-local.bat << 'EOF'
@echo off
echo 🚀 CSV to JSON Converter - Local Setup
echo =====================================

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📚 Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Run the application
echo 🌟 Starting the application...
echo 🌐 Open your browser and go to: http://localhost:5000
echo ⏹️  Press Ctrl+C to stop the server
echo.

python main.py
EOF

# ====================================================================
# FILE: package.json (Optional - for additional tooling)
# ====================================================================
cat > package.json << 'EOF'
{
  "name": "csv-json-converter",
  "version": "1.0.0",
  "description": "CSV to JSON Converter Web Application",
  "main": "main.py",
  "scripts": {
    "dev": "python main.py",
    "build": "echo 'Building for production...'",
    "deploy:gcp": "gcloud builds submit --config cloudbuild.yaml",
    "deploy:ae": "gcloud app deploy app.yaml"
  },
  "keywords": ["csv", "json", "converter", "flask", "python"],
  "author": "Your Name",
  "license": "MIT"
}
EOF

echo ""
echo "✅ Project setup complete!"
echo ""
echo "📁 Project Structure:"
echo "csv-json-converter/"
echo "├── main.py              # Flask application"
echo "├── requirements.txt     # Python dependencies"
echo "├── Dockerfile          # Docker configuration"
echo "├── cloudbuild.yaml     # Google Cloud Build"
echo "├── app.yaml            # Google App Engine"
echo "├── run-local.sh        # Local development (Unix/Mac)"
echo "├── run-local.bat       # Local development (Windows)"
echo "├── .gitignore          # Git ignore file"
echo "├── .gcloudignore       # Google Cloud ignore"
echo "├── package.json        # NPM scripts (optional)"
echo "└── README.md           # Documentation"
echo ""
echo "🚀 To run locally:"
echo "   Unix/Mac:  ./run-local.sh"
echo "   Windows:   run-local.bat"
echo "   Manual:    python main.py"
echo ""
echo "🌐 Application will be available at: http://localhost:5000"
