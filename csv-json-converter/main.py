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
