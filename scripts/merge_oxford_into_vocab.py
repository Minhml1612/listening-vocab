import json
from oxford_data import OXFORD_DATABASE

with open('js/default-data.js', encoding='utf-8') as f:
    c = f.read()

json_str = c.split('=', 1)[1].strip().rstrip(';')
vocab = json.loads(json_str)

matched = 0
unmatched = []

for item in vocab:
    w = item['word']
    # Tìm kiếm trong OXFORD_DATABASE
    entry = None
    if w in OXFORD_DATABASE:
        entry = OXFORD_DATABASE[w]
    else:
        # Thử tìm không phân biệt hoa thường
        for k, v in OXFORD_DATABASE.items():
            if k.lower() == w.lower():
                entry = v
                break

    if entry:
        item['example'] = entry['oxford']
        item['exampleVi'] = entry['vi']
        item['gapSentence'] = entry['gap']
        matched += 1
    else:
        unmatched.append(w)
        item['gapSentence'] = f"The speaker emphasized the importance of ________ in the conversation."

print(f"Matched {matched} / {len(vocab)} words with Oxford Dictionary examples.")
if unmatched:
    print("Unmatched words:", unmatched)

# Ghi ra data/vocab.json
with open('data/vocab.json', 'w', encoding='utf-8') as f:
    json.dump(vocab, f, ensure_ascii=False, indent=2)

# Ghi ra js/default-data.js
with open('js/default-data.js', 'w', encoding='utf-8') as f:
    f.write('// 155 từ vựng kèm câu ví dụ ngữ cảnh chuẩn Oxford Learner\'s Dictionary\n')
    f.write('window.DEFAULT_VOCAB_DATA = ' + json.dumps(vocab, ensure_ascii=False, indent=2) + ';\n')

print("Successfully updated data/vocab.json and js/default-data.js!")
