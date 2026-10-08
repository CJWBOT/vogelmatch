#!/usr/bin/env python3
"""Optioneel: bouwt index.html + src/*.js tot één los bestand (dist/vogelmatch.html).
Handig om de quiz als enkel bestand te delen of te openen op een telefoon."""
import re
from pathlib import Path

root = Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")

def inline(m):
    code = (root / m.group(1)).read_text(encoding="utf-8")
    assert "</script" not in code, f"{m.group(1)} bevat </script>"
    return f"<script>\n{code}\n</script>"

html = re.sub(r'<script src="([^"]+)"></script>', inline, html)
out = root / "dist"
out.mkdir(exist_ok=True)
(out / "vogelmatch.html").write_text(html, encoding="utf-8")
print(f"dist/vogelmatch.html geschreven ({len(html.encode('utf-8')) // 1024} kB)")
