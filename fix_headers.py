"""
Remove logo header (pg-hdr) and info-tbl from continuation pages.
Keep them ONLY on pages that have a blue box (obj-hdr = main topic pages).
Also add page numbers to the INDEX table.
"""
import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'srs_report.html', 'r', encoding='utf-8') as f:
    html = f.read()

lines = html.split('\n')

# First pass: identify which pages are MAIN (have obj-hdr) vs CONTINUATION
# Page boundaries are marked by <!-- ... PAGE N ... -->
page_starts = []  # (line_index, page_num, is_main)
for i, line in enumerate(lines):
    s = line.strip()
    if s.startswith('<!-- ') and 'PAGE' in s:
        m = re.search(r'PAGE\s+(\d+)', s)
        if m:
            page_num = int(m.group(1))
            page_starts.append((i, page_num, False))  # is_main will be set below

# Mark pages that have obj-hdr as MAIN
for idx, (start_line, page_num, _) in enumerate(page_starts):
    end_line = page_starts[idx+1][0] if idx+1 < len(page_starts) else len(lines)
    has_obj_hdr = False
    for j in range(start_line, end_line):
        if 'obj-hdr' in lines[j] and '<td' in lines[j]:
            has_obj_hdr = True
            break
    page_starts[idx] = (start_line, page_num, has_obj_hdr)

print("Page analysis:")
for start, num, is_main in page_starts:
    label = "MAIN (keep header)" if is_main else "CONTINUATION (remove header)"
    print(f"  Page {num}: {label}")

# Second pass: remove pg-hdr and info-tbl from CONTINUATION pages
# We need to remove:
# 1. The <div class="pg-hdr">...</div> block
# 2. The <hr class="hdr-rule"/> line
# 3. The <table class="info-tbl">...</table> block (if present)

continuation_pages = [(s, n) for s, n, m in page_starts if not m and n > 2]

for start_line, page_num in reversed(continuation_pages):  # reverse to not mess up indices
    end_line_idx = None
    for idx, (s, n, _) in enumerate(page_starts):
        if s == start_line:
            end_line_idx = page_starts[idx+1][0] if idx+1 < len(page_starts) else len(lines)
            break
    
    if end_line_idx is None:
        continue
    
    # Find and remove pg-hdr block
    i = start_line
    while i < end_line_idx:
        if '<div class="pg-hdr">' in lines[i]:
            # Find the closing </div> of pg-hdr (it's a few lines later)
            j = i
            depth = 0
            while j < end_line_idx:
                depth += lines[j].count('<div')
                depth -= lines[j].count('</div')
                if depth <= 0:
                    break
                j += 1
            # Remove lines i through j
            for k in range(i, j+1):
                lines[k] = ''
            break
        i += 1
    
    # Find and remove <hr class="hdr-rule"/>
    for i in range(start_line, end_line_idx):
        if 'hdr-rule' in lines[i]:
            lines[i] = ''
            break
    
    # Find and remove info-tbl block (if any - continuations shouldn't have it but just in case)
    i = start_line
    while i < end_line_idx:
        if '<table class="info-tbl">' in lines[i]:
            j = i
            while j < end_line_idx:
                if '</table>' in lines[j]:
                    break
                j += 1
            for k in range(i, j+1):
                lines[k] = ''
            break
        i += 1

# Clean up empty lines
new_lines = []
prev_empty = False
for line in lines:
    if line.strip() == '':
        if not prev_empty:
            new_lines.append(line)
        prev_empty = True
    else:
        new_lines.append(line)
        prev_empty = False

html_out = '\n'.join(new_lines)

# Now fix the INDEX table to add page numbers in right column
# Current format: <tr><td>1</td><td>Introduction</td></tr>
# New format: <tr><td>1</td><td>Introduction</td><td>3</td></tr>

# Map of index items to page numbers
index_pages = {
    '1': '3',   # Introduction
    '2': '5',   # Feasibility
    '3': '7',   # Functional & Non-Functional Requirements  
    '4': '9',   # SRS
    '5': '11',  # DFD
    '6': '14',  # Use Case Diagrams
    '7': '16',  # Sequence Diagrams
    '8': '18',  # Coding and Implementation
    '9': '24',  # Unit and System Testing
    '10': '26', # RMMM Plan
}

# Add header row for page numbers in index table
html_out = html_out.replace(
    '<tr><td class="idx-header" colspan="2">INDEX</td></tr>',
    '<tr><td class="idx-header" colspan="3">INDEX</td></tr>'
)

# Also fix the <th> row if it exists
html_out = html_out.replace(
    '<tr><th>S.No</th><th>Topic</th></tr>',
    '<tr><th>S.No</th><th>Topic</th><th>Page No.</th></tr>'
)

# Add page numbers to each index row
for num, page in index_pages.items():
    # Match the table row for this index number
    old = f'<tr><td>{num}</td><td>'
    if old in html_out:
        # Find the full row and add page number column
        pattern = f'<tr><td>{num}</td><td>(.*?)</td></tr>'
        replacement = f'<tr><td>{num}</td><td>\\1</td><td style="text-align:center">{page}</td></tr>'
        html_out = re.sub(pattern, replacement, html_out)

with open(r'srs_report.html', 'w', encoding='utf-8') as f:
    f.write(html_out)

print("\nDone! Headers removed from continuation pages. Page numbers added to INDEX.")
