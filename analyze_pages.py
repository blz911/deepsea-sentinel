import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'srs_report.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    s = line.strip()
    if s.startswith('<!-- ') and 'PAGE' in s:
        print(f'Line {i+1}: {s}')
    elif 'pg-hdr' in s and '<div class="pg-hdr">' in s:
        print(f'  HAS logo header')
    elif '<table class="info-tbl">' in s:
        print(f'  HAS info table')
    elif 'obj-hdr' in s and '<td' in s:
        print(f'  BLUE BOX: {s[:100]}')
