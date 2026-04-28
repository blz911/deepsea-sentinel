with open(r'srs_report.html', 'r', encoding='utf-8') as f:
    html = f.read()

# The pattern is:
# </div><!-- /page-content -->
# <div class="page-num">X</div>
# </div>
#
# We need to change it to:
# <div class="page-num">X</div>
# </div><!-- /page-content -->
# </div>

import re

# Swap the order: move page-num BEFORE the page-content closing tag
html = re.sub(
    r'</div><!-- /page-content -->\r?\n<div class="page-num">(\d+)</div>',
    r'<div class="page-num">\1</div>\n</div><!-- /page-content -->',
    html
)

with open(r'srs_report.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Verify
count = html.count('<div class="page-num">')
content_close = html.count('</div><!-- /page-content -->')
print(f"page-num divs: {count}")
print(f"page-content close divs: {content_close}")
print("Done - page-num moved inside page-content")
