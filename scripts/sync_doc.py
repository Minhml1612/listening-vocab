#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
DocVocab - Automated Sync Script
Đồng bộ hóa tài liệu từ Google Docs và làm giàu từ vựng tự động.
Có thể chạy độc lập trên máy tính hoặc chạy tự động bằng GitHub Actions.
"""

import os
import sys
import json
import re
import urllib.request
import urllib.parse
import time

DOC_ID = os.environ.get("GOOGLE_DOC_ID", "1n9VKp_QEw3ZdIyQCdkU75co8GhAZm1GY")
SCRIPT_URL = os.environ.get("GOOGLE_APPS_SCRIPT_URL", "")
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "vocab.json")

def fetch_content():
    # 1. Thử lấy từ Google Apps Script nếu có URL
    if SCRIPT_URL:
        try:
            req = urllib.request.Request(SCRIPT_URL, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if data.get("status") == "success" or data.get("rawText"):
                    print("[INFO] Đã tải thành công từ Google Apps Script!")
                    return data.get("rawText", "")
        except Exception as e:
            print(f"[WARN] Không thể lấy từ Apps Script: {e}")

    # 2. Thử export dạng text trực tiếp nếu tài liệu công khai
    export_url = f"https://docs.google.com/document/d/{DOC_ID}/export?format=txt"
    try:
        req = urllib.request.Request(export_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read().decode('utf-8')
            if "accounts.google.com" not in content and len(content) > 10:
                print("[INFO] Đã tải thành công từ Google Docs Public Export!")
                return content
    except Exception as e:
        print(f"[WARN] Không thể export trực tiếp: {e}")

    return ""

def parse_text_to_words(text):
    if not text:
        return []

    lines = text.splitlines()
    extracted = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Bỏ bullet points
        line = re.sub(r'^[\d+.)\-*•\s]+', '', line).strip()
        if len(line) < 2:
            continue

        word = ""
        meaning = ""
        example = ""

        delims = [':', ' - ', ' = ', ' – ', ' — ', '\t']
        found_d = None
        for d in delims:
            if d in line:
                found_d = d
                break

        if found_d:
            parts = line.split(found_d, 2)
            word = parts[0].strip()
            if len(parts) > 1:
                meaning = parts[1].strip()
            if len(parts) > 2:
                example = parts[2].strip()
        else:
            if len(line.split()) <= 4 and '.' not in line:
                word = line

        if word and len(word) < 60 and not word.startswith('http'):
            # Bóc tách phiên âm /.../
            phonetic = ""
            ph_match = re.search(r'/(.*?)/', word)
            if ph_match:
                phonetic = f"/{ph_match.group(1)}/"
                word = re.sub(r'/.*?/', '', word).strip()

            # Bóc tách từ loại (n, v, adj)
            pos = ""
            pos_match = re.search(r'\((n|v|adj|adv|prep|noun|verb|adjective|adverb)\)', word, re.I)
            if pos_match:
                pos = pos_match.group(1).lower()
                word = re.sub(r'\(.*?\)', '', word).strip()

            extracted.append({
                "word": word,
                "phonetic": phonetic,
                "partOfSpeech": pos,
                "meaning": meaning or "Đang cập nhật...",
                "example": example
            })

    return extracted

def lookup_dictionary(word):
    clean_word = re.sub(r'[^a-zA-Z-]', '', word).lower()
    if not clean_word:
        return {}

    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{urllib.parse.quote(clean_word)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if isinstance(data, list) and len(data) > 0:
                entry = data[0]
                phonetic = entry.get("phonetic", "")
                audio_url = ""
                for p in entry.get("phonetics", []):
                    if not phonetic and p.get("text"):
                        phonetic = p.get("text")
                    if p.get("audio") and p.get("audio").endswith('.mp3'):
                        audio_url = p.get("audio")
                        break

                part_of_speech = ""
                definition = ""
                example = ""

                meanings = entry.get("meanings", [])
                if meanings:
                    m = meanings[0]
                    part_of_speech = m.get("partOfSpeech", "")
                    defs = m.get("definitions", [])
                    if defs:
                        definition = defs[0].get("definition", "")
                        example = defs[0].get("example", "")

                return {
                    "phonetic": phonetic,
                    "audioUrl": audio_url,
                    "partOfSpeech": part_of_speech,
                    "definition": definition,
                    "example": example
                }
    except Exception:
        pass
    return {}

def main():
    print("=" * 60)
    print(" DocVocab Quizlet - Đồng bộ tự động từ Google Docs")
    print("=" * 60)

    raw_text = fetch_content()
    if not raw_text:
        print("[!] Không thể đọc nội dung Google Docs. Kiểm tra quyền chia sẻ hoặc Apps Script.")
        return

    extracted_words = parse_text_to_words(raw_text)
    print(f"[+] Tìm thấy {len(extracted_words)} từ trong tài liệu.")

    # Đọc dữ liệu cũ
    existing = []
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except Exception:
            existing = []

    existing_map = {item['word'].lower().strip(): item for item in existing}
    new_words_count = 0

    for item in extracted_words:
        key = item['word'].lower().strip()
        if not key:
            continue

        if key in existing_map:
            # Cập nhật nếu có thêm thông tin
            curr = existing_map[key]
            if item.get('meaning') and item['meaning'] != 'Đang cập nhật...':
                curr['meaning'] = item['meaning']
            if item.get('example'):
                curr['example'] = item['example']
        else:
            # Tra cứu từ điển tự động
            print(f"[*] Đang tra cứu từ mới: {item['word']}...")
            dict_info = lookup_dictionary(item['word'])
            new_item = {
                "id": f"w-{int(time.time()*1000)}-{key[:4]}",
                "word": item['word'],
                "phonetic": item.get('phonetic') or dict_info.get('phonetic', ''),
                "partOfSpeech": item.get('partOfSpeech') or dict_info.get('partOfSpeech', ''),
                "meaning": item.get('meaning', 'Đang cập nhật...'),
                "definition": dict_info.get('definition', ''),
                "example": item.get('example') or dict_info.get('example', ''),
                "exampleVi": "",
                "audioUrl": dict_info.get('audioUrl', ''),
                "isNew": True,
                "isStarred": False,
                "isMastered": False,
                "quizCount": 0,
                "correctCount": 0,
                "dateAdded": int(time.time() * 1000),
                "tags": ["google-doc", "listening"]
            }
            existing_map[key] = new_item
            new_words_count += 1
            time.sleep(0.3)

    final_list = list(existing_map.values())
    final_list.sort(key=lambda x: x.get('dateAdded', 0), reverse=True)

    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)

    print(f"[SUCCESS] Hoàn thành! Thêm {new_words_count} từ mới. Tổng cộng: {len(final_list)} từ.")

if __name__ == '__main__':
    main()
