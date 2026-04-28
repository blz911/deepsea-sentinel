import re

with open(r'srs_report.html', 'r', encoding='utf-8') as f:
    html = f.read()

lines = html.split('\n')
new_lines = []
page_content_opened = False

for i, line in enumerate(lines):
    stripped = line.strip()
    
    if stripped == '<div class="page">':
        new_lines.append(line)
        new_lines.append('<div class="page-content">')
        page_content_opened = True
        continue
    
    if '<div class="page-num">' in stripped and page_content_opened:
        new_lines.append('</div><!-- /page-content -->')
        new_lines.append(line)
        page_content_opened = False
        continue
    
    # For pages without page-num (cover page): close before final </div>
    if stripped == '</div>' and page_content_opened:
        remaining = [l.strip() for l in lines[i+1:i+4] if l.strip()]
        if remaining and (remaining[0].startswith('<!--') or remaining[0].startswith('<div class="page">') or remaining[0] == '</body>'):
            new_lines.append('</div><!-- /page-content -->')
            new_lines.append(line)
            page_content_opened = False
            continue
    
    new_lines.append(line)

result = '\n'.join(new_lines)
with open(r'srs_report.html', 'w', encoding='utf-8') as f:
    f.write(result)
    
print(f'Done. Total lines: {len(new_lines)}')
