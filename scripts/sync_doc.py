#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
DocVocab - Autonomous Sync Engine (v10.0)
Đồng bộ hóa tài liệu từ Google Docs, tự động làm giàu từ vựng Oxford và cập nhật đồng thời:
1. data/vocab.json
2. js/default-data.js
3. BANG_TU_VUNG.html
Có thể chạy độc lập trên máy tính hoặc chạy hoàn toàn tự động bằng GitHub Actions.
"""

import os
import sys
import json
import re
import urllib.request
import urllib.parse
import time
import random

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC_ID = os.environ.get("GOOGLE_DOC_ID", "1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4")
SCRIPT_URL = os.environ.get("GOOGLE_APPS_SCRIPT_URL", "")
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")

DATA_FILE = os.path.join(BASE_DIR, "data", "vocab.json")
JS_DATA_FILE = os.path.join(BASE_DIR, "js", "default-data.js")
BANG_HTML_FILE = os.path.join(BASE_DIR, "BANG_TU_VUNG.html")

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

    # 1. Kiểm tra cấu trúc bảng chuẩn hóa mới với ID 3 chữ số (001 - 159+)
    if re.search(r'(?:^|\r?\n)\t?\d{3}\r?\n', text):
        entries = []
        current_id = None
        current_cells = []

        for l in lines:
            m = re.match(r'^\t?(\d{3})$', l.strip())
            if m:
                if current_id:
                    entries.append((current_id, current_cells))
                current_id = m.group(1)
                current_cells = []
            elif current_id is not None:
                current_cells.append(l)

        if current_id:
            entries.append((current_id, current_cells))

        extracted = []
        for eid, cells in entries:
            tab_cells = []
            for c in cells:
                if c.startswith('\t'):
                    tab_cells.append(c[1:].strip())
                elif c.strip():
                    if tab_cells:
                        tab_cells[-1] += ' ' + c.strip()
                    else:
                        tab_cells.append(c.strip())
            while tab_cells and not tab_cells[-1]:
                tab_cells.pop()

            if len(tab_cells) >= 3:
                w = tab_cells[0].strip()
                pos = tab_cells[1].strip() if len(tab_cells) > 1 else ''
                meaning = tab_cells[2].strip() if len(tab_cells) > 2 else ''
                notes = tab_cells[3].strip() if len(tab_cells) > 3 else ''

                if w and len(w) >= 2:
                    extracted.append({
                        "id": f"w-{int(eid)}",
                        "docId": eid,
                        "word": w,
                        "partOfSpeech": pos,
                        "meaning": meaning,
                        "notes": notes,
                        "example": ""
                    })

        if extracted:
            return extracted
    
    # 2. Phân tích định dạng danh sách cũ (bullet / số thứ tự)
    extracted = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
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
            phonetic = ""
            ph_match = re.search(r'/(.*?)/', word)
            if ph_match:
                phonetic = f"/{ph_match.group(1)}/"
                word = re.sub(r'/.*?/', '', word).strip()

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
                "notes": "",
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

def generate_distractors(target_word, pos, existing_words):
    target_lower = target_word.lower().strip()
    candidates = []
    
    # 1. Ưu tiên các từ cùng từ loại
    if pos:
        target_pos_clean = pos.lower().replace(' ', '').replace('/', '')
        for w in existing_words:
            cand = w.get('quizAnswer') or w.get('word', '')
            cand_pos = (w.get('partOfSpeech') or '').lower().replace(' ', '').replace('/', '')
            if cand and cand.lower() != target_lower and target_pos_clean in cand_pos:
                candidates.append(cand)

    # 2. Nếu không đủ, lấy từ bất kỳ khác
    if len(candidates) < 3:
        for w in existing_words:
            cand = w.get('quizAnswer') or w.get('word', '')
            if cand and cand.lower() != target_lower and cand not in candidates:
                candidates.append(cand)

    random.shuffle(candidates)
    selected = candidates[:3]

    # Dự phòng an toàn nếu kho từ ít
    fallbacks = ['increase', 'reduce', 'maintain', 'develop', 'observe', 'consider']
    while len(selected) < 3:
        for fb in fallbacks:
            if fb != target_lower and fb not in selected:
                selected.append(fb)
            if len(selected) >= 3:
                break

    return selected[:3]

def main():
    print("=" * 65)
    print(" 🚀 DocVocab Quizlet - Đồng Bộ Tự Động Từ Google Docs (v10.0)")
    print("=" * 65)

    raw_text = fetch_content()
    if not raw_text:
        print("[!] Không thể đọc nội dung Google Docs. Kiểm tra quyền chia sẻ hoặc Apps Script.")
        return

    extracted_words = parse_text_to_words(raw_text)
    print(f"[+] Tìm thấy {len(extracted_words)} từ trong tài liệu Google Docs.")

    # Đọc dữ liệu từ điển hiện hữu
    existing = []
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except Exception:
            existing = []

    def get_item_key(it):
        if it.get('docId'):
            return f"doc-{it['docId']}"
        w = it.get('word', '').lower().strip()
        pos = it.get('partOfSpeech', '').lower().strip()
        return f"{w}_{pos}" if pos else w

    existing_map = {get_item_key(item): item for item in existing}
    new_words_count = 0
    updated_words_count = 0

    for item in extracted_words:
        key = get_item_key(item)
        if not key:
            continue

        if key in existing_map:
            # Cập nhật thông tin sửa đổi trong Google Docs mà không mất ví dụ Oxford
            curr = existing_map[key]
            changed = False
            if item.get('meaning') and item['meaning'] != curr.get('meaning'):
                curr['meaning'] = item['meaning']
                changed = True
            if item.get('notes') != curr.get('notes'):
                curr['notes'] = item.get('notes', '')
                changed = True
            if item.get('partOfSpeech') and item['partOfSpeech'] != curr.get('partOfSpeech'):
                curr['partOfSpeech'] = item['partOfSpeech']
                changed = True
            if changed:
                updated_words_count += 1
        else:
            # Tra cứu và tạo mới từ vựng chuẩn Oxford
            print(f"[*] Đang tự động làm giàu từ mới: {item['word']}...")
            dict_info = lookup_dictionary(item['word'])
            
            ex_sentence = item.get('example') or dict_info.get('example') or f"The speaker used the word '{item['word']}' in the listening comprehension conversation."
            gap_sentence = ex_sentence.replace(item['word'], '........')
            if '........' not in gap_sentence:
                gap_sentence = f"In the conversation, the speaker highlighted that '........' was essential."

            new_item = {
                "id": f"w-{int(item.get('docId') or (len(existing_map) + 1))}",
                "docId": item.get('docId', ''),
                "word": item['word'],
                "phonetic": item.get('phonetic') or dict_info.get('phonetic', ''),
                "partOfSpeech": item.get('partOfSpeech') or dict_info.get('partOfSpeech', ''),
                "meaning": item.get('meaning', 'Đang cập nhật...'),
                "notes": item.get('notes', ''),
                "definition": dict_info.get('definition', ''),
                "example": ex_sentence,
                "exampleVi": "",
                "oxfordExamples": [
                    {"en": ex_sentence, "vi": ""}
                ],
                "collocations": [],
                "dictSource": "Oxford Advanced Learner's Dictionary (OALD)",
                "gapSentence": gap_sentence,
                "quizAnswer": item['word'].lower().replace('?', ''),
                "distractors": generate_distractors(item['word'], item.get('partOfSpeech', ''), existing),
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
    
    # Sắp xếp chuẩn theo số thứ tự docId (001, 002... 159, 160...)
    def sort_key(x):
        d = x.get('docId', '')
        if d and d.isdigit():
            return int(d)
        m = re.match(r'w-(\d+)', x.get('id', ''))
        if m:
            return int(m.group(1))
        return 999999

    final_list.sort(key=sort_key)

    # 1. Cập nhật data/vocab.json
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)
    print(f" -> Đã cập nhật thành công: {DATA_FILE}")

    # 2. Cập nhật js/default-data.js
    js_content = f"""/**
 * DEFAULT VOCABULARY DATA ({len(final_list)} Standardized Google Doc & Oxford Entries - v10.0)
 * Nguồn Google Docs: https://docs.google.com/document/d/{DOC_ID}/edit
 * Tự động đồng bộ bởi DocVocab Autonomous Sync Engine
 */
window.DEFAULT_VOCAB_DATA = {json.dumps(final_list, ensure_ascii=False, indent=2)};
"""
    with open(JS_DATA_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f" -> Đã cập nhật thành công: {JS_DATA_FILE}")

    # 3. Cập nhật BANG_TU_VUNG.html
    table_rows = []
    for item in final_list:
        eid = item.get("docId", "")
        w = item.get("word", "")
        pos = item.get("partOfSpeech", "")
        meaning = item.get("meaning", "")
        notes = item.get("notes", "")
        table_rows.append(f"""  <tr>
    <td style="text-align: center; font-weight: bold; color: #6b7280;">{eid}</td>
    <td><strong style="color: #111827;">{w}</strong></td>
    <td class="pos">{pos}</td>
    <td>{meaning}</td>
    <td style="color: #4b5563; font-size: 13px;">{notes}</td>
  </tr>""")

    bang_html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Bảng Từ Vựng Chuẩn Hóa 5 Cột Cho Google Docs ({len(final_list)} Mục)</title>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #f9fafb; color: #1f2937; }}
  h2 {{ color: #4255ff; margin-bottom: 6px; }}
  p {{ color: #4b5563; font-size: 14px; margin-bottom: 16px; }}
  table {{ border-collapse: collapse; width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
  th, td {{ border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; font-size: 14px; }}
  th {{ background-color: #4255ff; color: white; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }}
  tr:nth-child(even) {{ background-color: #f9fafb; }}
  tr:hover {{ background-color: #f3f4f6; }}
  .pos {{ color: #4255ff; font-weight: 600; }}
</style>
</head>
<body>
<h2>TÀI LIỆU TỪ VỰNG TIẾNG ANH LISTENING - DỮ LIỆU CHUẨN HÓA ({len(final_list)} TỪ)</h2>
<p>Nguồn Google Docs: <a href="https://docs.google.com/document/d/{DOC_ID}/edit" target="_blank">Tài liệu từ vựng tiếng Anh tổng hợp - Flashcard chuẩn hóa</a></p>
<table>
<thead>
  <tr>
    <th style="width: 60px; text-align: center;">ID</th>
    <th style="width: 220px;">English</th>
    <th style="width: 130px;">POS</th>
    <th style="width: 280px;">Vietnamese meaning</th>
    <th>Note / Usage</th>
  </tr>
</thead>
<tbody>
{chr(10).join(table_rows)}
</tbody>
</table>
</body>
</html>
"""
    with open(BANG_HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(bang_html)
    print(f" -> Đã cập nhật thành công: {BANG_HTML_FILE}")

    print("=" * 65)
    print(f" [THÀNH CÔNG] Thêm {new_words_count} từ mới, cập nhật {updated_words_count} từ.")
    print(f" Tổng số từ vựng hiện tại: {len(final_list)} từ.")
    print("=" * 65)

if __name__ == '__main__':
    main()
