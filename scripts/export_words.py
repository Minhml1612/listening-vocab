import json

with open('js/default-data.js', encoding='utf-8') as f:
    c = f.read()

json_str = c.split('=', 1)[1].strip().rstrip(';')
data = json.loads(json_str)

with open('words_list.json', 'w', encoding='utf-8') as f:
    json.dump([{'id': w['id'], 'word': w['word'], 'pos': w.get('partOfSpeech', ''), 'meaning': w['meaning']} for w in data], f, ensure_ascii=False, indent=2)

print('Exported', len(data), 'words to words_list.json')
