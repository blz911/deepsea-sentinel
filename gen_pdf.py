import subprocess, os, sys, time

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
url = "http://localhost:5173/srs_report.html"
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "DeepSea_Sentinel_SRS_Report.pdf")

print(f"Chrome: {chrome}")
print(f"URL:    {url}")
print(f"Output: {out}")

if not os.path.exists(chrome):
    print("ERROR: Chrome not found!")
    sys.exit(1)

args = [
    chrome,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-extensions",
    f"--print-to-pdf={out}",
    "--print-to-pdf-no-header",
    "--no-pdf-header-footer",
    "--no-margins",
    "--virtual-time-budget=15000",
    url
]

print("Running Chrome headless...")
try:
    result = subprocess.run(args, timeout=60, capture_output=True, text=True)
    print(f"Exit code: {result.returncode}")
    if result.stdout: print(f"stdout: {result.stdout[:500]}")
    if result.stderr: print(f"stderr: {result.stderr[:500]}")
except subprocess.TimeoutExpired:
    print("Chrome timed out after 60s")
except Exception as e:
    print(f"Error: {e}")

time.sleep(1)
if os.path.exists(out):
    size = os.path.getsize(out)
    print(f"\nSUCCESS! PDF created: {size:,} bytes ({size/1024:.1f} KB)")
else:
    print("\nFAILED: PDF file was not created")
