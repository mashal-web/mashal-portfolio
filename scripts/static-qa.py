from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import re, sys, xml.etree.ElementTree as ET

ROOT = Path(".")
errors = []

class AuditParser(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.file = file
        self.ids = set()
        self.h1 = 0
        self.images = 0
        self.links = []
        self.styles = []
        self.scripts = []
        self.titles = 0
        self.descriptions = 0
        self.canonicals = 0
        self.in_title = False
        self.title_text = ""
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            if a["id"] in self.ids: errors.append(f"{self.file}: duplicate id {a['id']}")
            self.ids.add(a["id"])
        if tag == "h1": self.h1 += 1
        if tag == "img":
            self.images += 1
            if "alt" not in a: errors.append(f"{self.file}: img missing alt")
        if tag in ("a", "link") and a.get("href"): self.links.append(a["href"])
        if tag == "script" and a.get("src"): self.scripts.append(a["src"])
        if tag == "link" and a.get("rel") == "stylesheet" and a.get("href"): self.styles.append(a["href"])
        if tag == "title": self.titles += 1; self.in_title = True
        if tag == "meta" and a.get("name", "").lower() == "description": self.descriptions += 1
        if tag == "link" and a.get("rel") == "canonical": self.canonicals += 1
    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title_text += data

html_files = sorted(ROOT.glob("*.html"))
for file in html_files:
    parser = AuditParser(file)
    try:
        parser.feed(file.read_text(encoding="utf-8"))
        parser.close()
    except Exception as e:
        errors.append(f"{file}: HTML parser error: {e}")
    if parser.h1 != 1: errors.append(f"{file}: expected exactly one h1, found {parser.h1}")
    if parser.titles != 1 or not parser.title_text.strip(): errors.append(f"{file}: missing or duplicate title")
    if file.name != "404.html" and parser.descriptions != 1: errors.append(f"{file}: expected one meta description")
    if file.name != "404.html" and parser.canonicals != 1: errors.append(f"{file}: expected one canonical URL")
    for ref in parser.links + parser.styles + parser.scripts:
        if ref.startswith(("#", "http://", "https://", "mailto:", "tel:", "data:", "javascript:")): continue
        path = urlsplit(ref).path
        if not path: continue
        target = (file.parent / path).resolve()
        if not target.exists(): errors.append(f"{file}: missing local reference {ref}")
    if re.search(r'\sstyle\s*=|<style\b|\son[a-z]+\s*=', file.read_text(encoding="utf-8"), re.I):
        errors.append(f"{file}: inline style/block/handler found")

for css in ROOT.glob("*.css"):
    content = re.sub(r"/\\*.*?\\*/", "", css.read_text(encoding="utf-8"), flags=re.S)
    depth = 0
    quote = None
    escaped = False
    for char in content:
        if quote:
            if escaped: escaped = False
            elif char == chr(92): escaped = True
            elif char == quote: quote = None
        elif char in (chr(39), chr(34)): quote = char
        elif char == "{": depth += 1
        elif char == "}":
            depth -= 1
            if depth < 0: break
    if depth != 0 or quote: errors.append(f"{css}: unbalanced CSS blocks or strings")
    if re.search(r"^\\s*400;500;600;700", content, re.M): errors.append(f"{css}: malformed font import residue")
    if re.search(r"@import\\s+url\\(['\\"]https://fonts\\.", content, re.I): errors.append(f"{css}: external font import remains")

if Path("script.js").exists():
    import subprocess
    result = subprocess.run(["node", "--check", "script.js"], capture_output=True, text=True)
    if result.returncode: errors.append("script.js syntax error: " + result.stderr.strip())

try:
    ET.parse("sitemap.xml")
except Exception as e:
    errors.append("sitemap.xml invalid: " + str(e))

print(f"Checked {len(html_files)} HTML documents and {len(list(ROOT.glob('*.css')))} stylesheets.")
if errors:
    print("\n".join("FAIL: " + e for e in errors))
    sys.exit(1)
print("Static QA passed.")
