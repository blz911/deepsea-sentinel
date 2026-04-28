"""
Split the INDEX into two pages and renumber ALL pages +1.
Page 2 = INDEX items 1-5
Page 3 = INDEX continued items 6-10
Everything else shifts by +1.
"""
import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('srs_report.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ── STEP 1: Replace the single-page INDEX with a two-page INDEX ──

old_index_start = '<table class="idx-tbl">'
old_index_end_marker = '<div class="page-num">2</div>\n</div>'

# Find the index table boundaries
idx_start = html.index(old_index_start)
idx_end = html.index(old_index_end_marker) + len(old_index_end_marker)

# Build the two-page INDEX replacement
page2 = '''<table class="idx-tbl">
  <tr><td class="idx-header" colspan="3">INDEX</td></tr>
  <tr><th>Sr. No.</th><th>Title</th><th>Page No.</th></tr>
  <tr><td>1</td><td>Brief Introduction of the project: Aim, Scope, Objective etc.
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>Aim &amp; Scope</li>
      <li>Target Audience</li>
      <li>Problem Statement</li>
      <li>Proposed Solution</li>
      <li>Objectives</li>
    </ul>
  </td><td style="text-align:center">4</td></tr>
  <tr><td>2</td><td>Feasibility study of the project.
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>Technical Feasibility</li>
      <li>Operational Feasibility</li>
      <li>Economic Feasibility</li>
      <li>Schedule Feasibility</li>
    </ul>
  </td><td style="text-align:center">6</td></tr>
  <tr><td>3</td><td>Functional and Non Functional Requirements.
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>Functional Requirements (FR-01 to FR-13)</li>
      <li>Non-Functional Requirements</li>
      <li>Pseudocode / Algorithm</li>
    </ul>
  </td><td style="text-align:center">8</td></tr>
  <tr><td>4</td><td>Software Requirements and Specifications (SRS)
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>Product Perspective</li>
      <li>User Classes &amp; Characteristics</li>
      <li>Operating Environment</li>
      <li>Data Dictionary</li>
      <li>Design &amp; Implementation Constraints</li>
      <li>Assumptions &amp; Dependencies</li>
    </ul>
  </td><td style="text-align:center">10</td></tr>
  <tr><td>5</td><td>Data Flow diagrams (DFD)
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>DFD Level 0 (Context Diagram)</li>
      <li>DFD Level 1</li>
      <li>DFD Level 2</li>
    </ul>
  </td><td style="text-align:center">12</td></tr>
</table>
<div class="page-num">2</div>
</div>

<!-- ═══ PAGE 3 — INDEX (continued) ═══ -->
<div class="page">
<div class="pg-hdr">
  <img src="srs_assets/cuj_logo_official.jpeg" alt="CUJ"/>
  <div class="pg-hdr-txt">
    <div class="d1">Department of Computer Science &amp; Engineering</div>
    <div class="d2">Central University of Jammu</div>
  </div>
</div>
<hr class="hdr-rule"/>

<table class="idx-tbl">
  <tr><td class="idx-header" colspan="3">INDEX (continued)</td></tr>
  <tr><th>Sr. No.</th><th>Title</th><th>Page No.</th></tr>
  <tr><td>6</td><td>Use case diagrams
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>Use Case Diagram</li>
      <li>Use Case Descriptions (UC-01 to UC-05)</li>
    </ul>
  </td><td style="text-align:center">15</td></tr>
  <tr><td>7</td><td>Sequence diagrams
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>Scan Workflow Sequence</li>
      <li>PDF Export Sequence</li>
    </ul>
  </td><td style="text-align:center">17</td></tr>
  <tr><td>8</td><td>Coding and Implementation
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>Technology Stack</li>
      <li>Project File Structure</li>
      <li>Key Code Snippets</li>
      <li>Screenshots</li>
    </ul>
  </td><td style="text-align:center">19</td></tr>
  <tr><td>9</td><td>Unit and System Testing
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>Unit Test Cases (UT-01 to UT-10)</li>
      <li>System Test Cases (ST-01 to ST-06)</li>
    </ul>
  </td><td style="text-align:center">25</td></tr>
  <tr><td>10</td><td>RMMM plan.
    <ul style="margin:2px 0 0 18px;font-weight:normal;font-size:9pt;list-style:disc">
      <li>Risk Identification Table</li>
      <li>Risk Monitoring Strategy</li>
      <li>Risk Management Plan</li>
    </ul>
  </td><td style="text-align:center">27</td></tr>
</table>
<div class="page-num">3</div>
</div>'''

html = html[:idx_start] + page2 + html[idx_end:]

# ── STEP 2: Renumber all page-num divs from page 3 onward (+1) ──
# Pages 1,2,3 stay as is (cover, index1, index2)
# Old page 3 becomes 4, old page 4 becomes 5, etc.

def bump_page_nums(match):
    num = int(match.group(1))
    if num >= 3:  # old pages 3+ become 4+
        return f'<div class="page-num">{num + 1}</div>'
    return match.group(0)

# But we need to skip the page-num divs we just inserted (2 and 3)
# Split at the end of our new index block
new_index_end = '<div class="page-num">3</div>\n</div>'
split_pos = html.index(new_index_end) + len(new_index_end)

before = html[:split_pos]
after = html[split_pos:]

# Only renumber in the "after" portion
after = re.sub(r'<div class="page-num">(\d+)</div>', bump_page_nums, after)

html = before + after

# ── STEP 3: Update the SRS Sub-Index page numbers (+1) ──
# Old page 9 → 10, old page 10 → 11
html = html.replace(
    '<tr><td>4.1</td><td>Product Perspective</td><td style="text-align:center">9</td></tr>',
    '<tr><td>4.1</td><td>Product Perspective</td><td style="text-align:center">10</td></tr>'
)
html = html.replace(
    '<tr><td>4.2</td><td>User Classes and Characteristics</td><td style="text-align:center">9</td></tr>',
    '<tr><td>4.2</td><td>User Classes and Characteristics</td><td style="text-align:center">10</td></tr>'
)
html = html.replace(
    '<tr><td>4.3</td><td>Operating Environment</td><td style="text-align:center">9</td></tr>',
    '<tr><td>4.3</td><td>Operating Environment</td><td style="text-align:center">10</td></tr>'
)
html = html.replace(
    '<tr><td>4.4</td><td>Data Dictionary</td><td style="text-align:center">10</td></tr>',
    '<tr><td>4.4</td><td>Data Dictionary</td><td style="text-align:center">11</td></tr>'
)
html = html.replace(
    '<tr><td>4.5</td><td>Design and Implementation Constraints</td><td style="text-align:center">10</td></tr>',
    '<tr><td>4.5</td><td>Design and Implementation Constraints</td><td style="text-align:center">11</td></tr>'
)
html = html.replace(
    '<tr><td>4.6</td><td>Assumptions and Dependencies</td><td style="text-align:center">10</td></tr>',
    '<tr><td>4.6</td><td>Assumptions and Dependencies</td><td style="text-align:center">11</td></tr>'
)

with open('srs_report.html', 'w', encoding='utf-8') as f:
    f.write(html)

# ── Verify ──
page_nums = re.findall(r'<div class="page-num">(\d+)</div>', html)
print(f"Page numbers found: {page_nums}")
print(f"Total content pages: {len(page_nums)}")
print("Done! INDEX split into 2 pages, all pages renumbered.")
