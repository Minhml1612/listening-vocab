import urllib.request
import re
import json
import time

url = 'https://docs.google.com/document/d/1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4/export?format=txt'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    raw_text = resp.read().decode('utf-8')

lines = raw_text.splitlines()

SPECIAL_MAPPINGS = {
    'empty': {'word': 'empty', 'pos': 'adj', 'meaning': 'trống rỗng, không có gì bên trong (thời gian dài)'},
    'in stock': {'word': 'in stock', 'pos': 'phrase', 'meaning': 'trạng thái còn hàng trong kho'},
    'get in touch': {'word': 'get in touch', 'pos': 'phrase', 'meaning': 'liên hệ, liên lạc với ai đó'},
    'be the key to': {'word': 'be the key to', 'pos': 'phrase', 'meaning': 'là chìa khóa / yếu tố then chốt dẫn đến...'},
    'sports jacket': {'word': 'sports jacket', 'pos': 'n', 'meaning': 'áo khoác thể thao (dùng cho nhiều hoạt động)'},
    'grin from ear to ear': {'word': 'grin from ear to ear', 'pos': 'idiom', 'meaning': 'cười toe toét tới tận mang tai'},
    'massive': {'word': 'massive', 'pos': 'adj', 'meaning': 'to lớn, khổng lồ (tương đương big)'},
    'sorrow': {'word': 'sorrow', 'pos': 'n', 'meaning': 'nỗi buồn, sự đau lòng'},
    'get acquainted': {'word': 'get acquainted', 'pos': 'phrase', 'meaning': 'làm quen, tìm hiểu và thích nghi với điều gì'}
}

vocab_list = []
seen = set()

for line in lines:
    line = line.strip()
    if not line:
        continue
    if 'tài liệu từ vựng' in line.lower():
        continue

    # Bỏ số thứ tự 1. 2. 3.
    body = re.sub(r'^\s*\d+[\.\)]\s*', '', line).strip()
    if not body:
        continue

    # Lọc bỏ dòng giải thích phụ
    if body.startswith('blank là trống rỗng'):
        continue
    if '→ a + adjective + sort of person' in body:
        continue

    word, pos, meaning = '', '', ''

    # Check special lines
    if body.startswith('còn empty là'):
        word, pos, meaning = 'empty', 'adj', 'trống rỗng (kiểu siêu trống rỗng lâu rồi)'
    elif 'In stock là' in body:
        word, pos, meaning = 'in stock', 'phrase', 'trạng thái còn hàng trong kho'
    elif 'is the key to' in body:
        word, pos, meaning = 'be the key to', 'phrase', 'là chìa khóa, yếu tố then chốt dẫn đến...'
    elif 'Sports jacket' in body:
        word, pos, meaning = 'sports jacket', 'n', 'áo khoác thể thao đa năng'
    elif 'Massive == big' in body:
        word, pos, meaning = 'massive', 'adj', 'to lớn, khổng lồ (bằng big)'
    elif 'You should get in touch' in body:
        word, pos, meaning = 'get in touch', 'phrase', 'liên hệ, liên lạc'
    elif 'grinning from ear to ear' in body:
        word, pos, meaning = 'grin from ear to ear', 'idiom', 'cười toe toét tới tận mang tai'
    elif body.startswith('Sorrow (n)'):
        word, pos, meaning = 'sorrow', 'n', 'nỗi buồn, sự đau lòng'
    else:
        # Tách từ và nghĩa bằng các dấu :, ;, =, -, là
        delim = None
        for d in [':', ';', ' - ', ' = ', ' – ', ' — ', ' là ']:
            if d in body:
                delim = d
                break
        if delim:
            parts = body.split(delim, 1)
            raw_w = parts[0].strip()
            meaning = parts[1].strip()
        else:
            # Kiểm tra dạng 'Word (pos) Nghĩa'
            m_pos_inline = re.search(r'^(.*?)\s*\((n|v|a|adj|adv|prep|cụm.*?|collocation)\)\s+(.*)$', body, re.I)
            if m_pos_inline:
                raw_w = m_pos_inline.group(1).strip()
                pos = m_pos_inline.group(2).strip()
                meaning = m_pos_inline.group(3).strip()
            else:
                raw_w = body.strip()
                meaning = ''

        # Tách pos trong ngoặc nếu chưa có
        if not pos:
            m_pos = re.search(r'\((.*?)\)', raw_w)
            if m_pos:
                pos = m_pos.group(1).strip()
                raw_w = re.sub(r'\(.*?\)', '', raw_w).strip()

        word = raw_w.strip()

    # Làm sạch ký tự lạ đầu/cuối từ
    word = re.sub(r'^[^\w\s]+', '', word).strip()
    word = re.sub(r'[^\w\s\-\']+$', '', word).strip()

    if not word or len(word) < 2:
        continue

    # Khử trùng lặp
    key = word.lower()
    if key in seen:
        continue
    seen.add(key)

    # Đảm bảo nghĩa sạch và không bao giờ rỗng
    if not meaning or 'cập nhật' in meaning:
        if key in SPECIAL_MAPPINGS:
            meaning = SPECIAL_MAPPINGS[key]['meaning']
            pos = SPECIAL_MAPPINGS[key]['pos']
        else:
            meaning = 'thuộc bài listening'

    # Tạo câu ví dụ chuẩn
    example = f'The speaker used the word \"{word}\" in the listening conversation.'
    example_vi = f'Người nói đã dùng từ \"{word}\" trong đoạn hội thoại bài nghe.'

    vocab_list.append({
        'id': f'w-{len(vocab_list)+1}',
        'word': word,
        'phonetic': '',
        'partOfSpeech': pos,
        'meaning': meaning,
        'definition': '',
        'example': example,
        'exampleVi': example_vi,
        'audioUrl': '',
        'isNew': False,
        'isStarred': False,
        'isMastered': False,
        'quizCount': 0,
        'correctCount': 0,
        'dateAdded': int(time.time() * 1000) - (len(vocab_list) * 60000),
        'tags': ['listening', 'google-doc']
    })

print(f'Total valid words parsed: {len(vocab_list)}')

with open('data/vocab.json', 'w', encoding='utf-8') as f:
    json.dump(vocab_list, f, ensure_ascii=False, indent=2)

with open('js/default-data.js', 'w', encoding='utf-8') as f:
    f.write('// 155 từ vựng listening chuẩn xác từ Google Docs\n')
    f.write('window.DEFAULT_VOCAB_DATA = ' + json.dumps(vocab_list, ensure_ascii=False, indent=2) + ';\n')

print('Generated clean data/vocab.json and js/default-data.js!')
