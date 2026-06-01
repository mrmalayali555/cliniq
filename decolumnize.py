import re
import os

# Set of regexes to filter out headers, footers, and other junk
JUNK_PATTERNS = [
    re.compile(r'MCQ COMPANION', re.I),
    re.compile(r'COMMUNITY MEDICINE', re.I),
    re.compile(r'FORENSIC MEDICINE', re.I),
    re.compile(r'CONCEPT OF HEALTH', re.I),
    re.compile(r'CONCEPT OF HEA', re.I),
    re.compile(r'AND DISEASE', re.I),
    re.compile(r'SFI MEDICOS', re.I),
    re.compile(r'QUESTION BANK', re.I),
    re.compile(r'PHYSIOLOGY', re.I),
    re.compile(r'BIOCHEMISTRY', re.I),
    re.compile(r'ANATOMY', re.I),
    re.compile(r'^\s*\d+\s*$', re.I), # Lines with only numbers (like page numbers)
]

def is_junk_line(line):
    for pattern in JUNK_PATTERNS:
        if pattern.search(line):
            return True
    return False

def decolumnize_file(input_path, output_path):
    print(f"Decolumnizing {input_path} -> {output_path}")
    with open(input_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    pages = content.split('\x0c')
    out_pages = []

    for page_num, page in enumerate(pages):
        lines = page.split('\n')
        if not lines:
            continue
        
        left_col = []
        right_col = []

        for line in lines:
            if not line.strip():
                left_col.append("")
                right_col.append("")
                continue
            
            # Count leading spaces
            leading_spaces = len(line) - len(line.lstrip(' '))
            
            if leading_spaces >= 35:
                left_col.append("")
                right_col.append(line.strip())
            else:
                # Look for a gap of 3 or more spaces in the middle (between 25 and 60)
                matches = list(re.finditer(r' {3,}', line))
                split_idx = -1
                for m in matches:
                    start, end = m.span()
                    if 25 <= start <= 60:
                        split_idx = start
                        break
                
                if split_idx != -1:
                    left_part = line[:split_idx].rstrip()
                    right_part = line[split_idx:].strip()
                    left_col.append(left_part)
                    right_col.append(right_part)
                else:
                    left_col.append(line.rstrip())
                    right_col.append("")

        # Reconstruct page: left column first, then right column
        # Clean up junk lines and consecutive empty lines
        def clean_lines(lines_list):
            res = []
            prev_empty = False
            for l in lines_list:
                cleaned = l.strip()
                if is_junk_line(cleaned):
                    continue
                if not cleaned:
                    if not prev_empty:
                        res.append("")
                        prev_empty = True
                else:
                    res.append(l)
                    prev_empty = False
            return "\n".join(res)

        left_text = clean_lines(left_col)
        right_text = clean_lines(right_col)
        
        out_pages.append(left_text + "\n\n" + right_text)

    new_content = "\n\f\n".join(out_pages)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Done!")

if __name__ == "__main__":
    decolumnize_file("Forensic-Medicine-MCQ-Companion.txt", "Forensic-Medicine-MCQ-Companion-Clean.txt")
    decolumnize_file("Community-Medicine-MCQ-Companion.txt", "Community-Medicine-MCQ-Companion-Clean.txt")
