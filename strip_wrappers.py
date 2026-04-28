"""
Strip all page-content wrapper divs and rebuild the HTML clean.
"""
with open(r'srs_report.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove page-content wrappers
html = html.replace('<div class="page-content">\n', '')
html = html.replace('<div class="page-content">\r\n', '')
html = html.replace('</div><!-- /page-content -->\n', '')
html = html.replace('</div><!-- /page-content -->\r\n', '')

with open(r'srs_report.html', 'w', encoding='utf-8') as f:
    f.write(html)

remaining = html.count('page-content')
print(f"Remaining page-content refs: {remaining}")
print("Done stripping page-content wrappers")
