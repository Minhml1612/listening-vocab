# -*- coding: utf-8 -*-
import sys
import json

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/vocab.json', 'r', encoding='utf-8') as f:
    v = json.load(f)

assert len(v) == 159, f"Expected 159 items, got {len(v)}"
for i, item in enumerate(v):
    w = item.get("word")
    assert w, f"Item {i} missing word"
    assert item.get("partOfSpeech"), f"Item {i} ({w}) missing partOfSpeech"
    assert item.get("meaning"), f"Item {i} ({w}) missing meaning"
    assert item.get("definition"), f"Item {i} ({w}) missing definition"
    assert item.get("phonetic"), f"Item {i} ({w}) missing phonetic"
    assert item.get("example"), f"Item {i} ({w}) missing example"
    assert item.get("gapSentence"), f"Item {i} ({w}) missing gapSentence"
    assert len(item.get("distractors", [])) >= 3, f"Item {i} ({w}) has fewer than 3 distractors"

print(f"[TEST 1 PASSED] data/vocab.json: Exactly {len(v)} valid, fully enriched words.")

with open('js/default-data.js', 'r', encoding='utf-8') as f:
    js_text = f.read()

assert 'window.DEFAULT_VOCAB_DATA =' in js_text
assert len(js_text) > 200000
print(f"[TEST 2 PASSED] js/default-data.js: Valid JS file ({len(js_text):,} bytes).")

with open('BANG_TU_VUNG.html', 'r', encoding='utf-8') as f:
    html_text = f.read()

assert '159' in html_text
assert 'TÀI LIỆU TỪ VỰNG TIẾNG ANH LISTENING' in html_text
assert html_text.count('<tr>') == 160 # 1 thead row + 159 tbody rows
print(f"[TEST 3 PASSED] BANG_TU_VUNG.html: Valid HTML table ({html_text.count('<tr>') - 1} data rows).")

with open('index.html', 'r', encoding='utf-8') as f:
    idx_text = f.read()

assert '1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4' in idx_text
assert '1n9VKp_QEw3ZdIyQCdkU75co8GhAZm1GY' not in idx_text
print("[TEST 4 PASSED] index.html: Google Doc ID is 100% updated and old ID is eliminated.")

print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
