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
