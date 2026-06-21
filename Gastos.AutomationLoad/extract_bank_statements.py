import pypdf
import ollama
import requests
import json
import os
import shutil

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(BASE_DIR, 'input')
PROCESSED_DIR = os.path.join(BASE_DIR, 'processed')
OLLAMA_MODEL = 'qwen2.5-coder'
TRIAGE_ENDPOINT = 'http://localhost:5000/api/transactions/triage'

def ensure_directories_exist():
    """Ensures input and processed directories exist."""
    os.makedirs(INPUT_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts text from a PDF file."""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at: {pdf_path}")

    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = pypdf.PdfReader(file)
            for page_num in range(len(reader.pages)):
                text += reader.pages[page_num].extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""

def parse_transactions_with_ollama(statement_text: str) -> list[dict]:
    """Sends text to Ollama for parsing and returns a list of transaction dictionaries."""
    system_prompt = """You are a financial assistant. Your task is to extract transaction details from bank statement text.
    Return only a raw JSON array of objects. Each object must have the following keys and types:
    - 'amount': decimal (e.g., 123.45)
    - 'description': string
    - 'categoryId': integer (default to 1)
    - 'type': integer (0 for Expense, 1 for Income)
    - 'date': string (format YYYY-MM-DD)

    Example input: "2023-01-15 Purchase at Starbucks $5.50"
    Example output:
    [
      {
        "amount": 5.50,
        "description": "Starbucks",
        "categoryId": 1,
        "type": 0,
        "date": "2023-01-15"
      }
    ]
    Ensure the output is ONLY the JSON array, with no additional text or formatting.
    For missing data, use the default values specified or infer logically where possible (e.g., negative amounts imply expense).
    """

    try:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': statement_text}
            ],
            options={'temperature': 0.0}
        )
        json_string = response['message']['content'].strip()
        transactions = json.loads(json_string)
        if not isinstance(transactions, list):
            raise ValueError("Ollama did not return a JSON array.")
        return transactions
    except ollama.ResponseError as e:
        print(f"Error communicating with Ollama: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON response from Ollama: {e}")
        print(f"Raw Ollama response: {json_string[:500]}...")
        return []
    except Exception as e:
        print(f"An unexpected error occurred during Ollama parsing: {e}")
        return []

def send_transaction_to_api(transaction: dict, endpoint: str):
    """Sends a single transaction to the specified API endpoint."""
    try:
        response = requests.post(endpoint, json=transaction)
        response.raise_for_status()  # Raise an exception for HTTP errors
        print(f"Successfully sent transaction: {transaction.get('description')} (Status: {response.status_code})")
        return True
    except requests.exceptions.ConnectionError as e:
        print(f"Connection error when sending transaction to {endpoint}: {e}")
    except requests.exceptions.Timeout as e:
        print(f"Request timed out when sending transaction to {endpoint}: {e}")
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error when sending transaction {transaction.get('description')} (Status: {response.status_code}): {e}")
    except Exception as e:
        print(f"An unexpected error occurred while sending transaction: {e}")
    return False

def main():
    print("Starting bank statement extraction and processing...")
    ensure_directories_exist()

    pdf_files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith('.pdf')]
    if not pdf_files:
        print(f"No PDF files found in {INPUT_DIR}. Exiting.")
        return

    for pdf_file in pdf_files:
        full_pdf_path = os.path.join(INPUT_DIR, pdf_file)
        print(f"\n--- Processing {pdf_file} ---")
        try:
            # 1. Extract text from PDF
            print(f"Attempting to extract text from {pdf_file}...")
            statement_text = extract_text_from_pdf(full_pdf_path)
            if not statement_text:
                print(f"No text extracted from {pdf_file}. Skipping.")
                continue

            # 2. Parse transactions with Ollama
            print("Sending extracted text to Ollama for transaction parsing...")
            transactions = parse_transactions_with_ollama(statement_text)
            if not transactions:
                print(f"No transactions parsed for {pdf_file}. Skipping.")
                continue

            print(f"Successfully parsed {len(transactions)} transactions from {pdf_file}.")
            
            # 3. Send each transaction to the API
            print(f"Sending transactions to API endpoint: {TRIAGE_ENDPOINT}...")
            all_sent_successfully = True
            for transaction in transactions:
                if not send_transaction_to_api(transaction, TRIAGE_ENDPOINT):
                    all_sent_successfully = False
                    break # Stop processing this file if one transaction fails to send
            
            if all_sent_successfully:
                # 4. Move processed file
                destination_path = os.path.join(PROCESSED_DIR, pdf_file)
                shutil.move(full_pdf_path, destination_path)
                print(f"Successfully processed and moved {pdf_file} to {PROCESSED_DIR}.")
            else:
                print(f"Failed to send all transactions for {pdf_file}. Keeping in {INPUT_DIR}.")

        except Exception as e:
            print(f"An unhandled error occurred while processing {pdf_file}: {e}")
            print(f"Keeping {pdf_file} in {INPUT_DIR} due to error.")
    
    print("\nAll documents processed or skipped.")

if __name__ == "__main__":
    main()
