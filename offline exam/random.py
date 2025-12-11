import time
import sys

chorus = """
Umaawit ang mga anghel, umaawit ang mga anghel
Nagdiriwang sila nang makasama kita, huwag Ka sanang mawawala
Oh, oh-oh-oh
Oh, ooh
"""

def type_text(text, speed=0.03):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(speed)

print("=== Kalapastangan  Chorus (Typing Animation) ===\n - random.py:17")
type_text(chorus)

