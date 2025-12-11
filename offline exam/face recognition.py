import cv2
import numpy as np

# Load Haarcascade
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")

def extract_face_gray(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return None

    x, y, w, h = faces[0]
    face = gray[y:y+h, x:x+w]
    face = cv2.resize(face, (200, 200))

    return face, (x, y, w, h)

# -------------------------------
# STEP 1: ENROLL YOUR FACE
# -------------------------------
def capture_known_face():
    cap = cv2.VideoCapture(0)
    print("Press SPACE to capture your face... - face recognition.py:25")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        cv2.imshow("Capture Known Face", frame)

        if cv2.waitKey(1) & 0x20:  # SPACE key
            cv2.imwrite("known.jpg", frame)
            print("Saved known face as known.jpg - face recognition.py:36")
            break

    cap.release()
    cv2.destroyAllWindows()

# -------------------------------
# STEP 2: VERIFY USING CAMERA
# -------------------------------
def verify_live(threshold=3500):
    known_img = cv2.imread("known.jpg")
    known_face_data = extract_face_gray(known_img)

    if known_face_data is None:
        print("No face found in known.jpg. Recapture your face. - face recognition.py:50")
        return

    known_face, _ = known_face_data

    cap = cv2.VideoCapture(0)
    print("Starting live verification... Press Q to quit. - face recognition.py:56")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        result = extract_face_gray(frame)

        if result is not None:
            live_face, (x, y, w, h) = result

            diff = cv2.absdiff(known_face, live_face)
            score = np.sum(diff)
            match = score < threshold

            text = f"Match: {match} | Score: {score:.0f}"
            color = (0,255,0) if match else (0,0,255)

            cv2.rectangle(frame, (x,y), (x+w,y+h), color, 2)
            cv2.putText(frame, text, (x, y-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        cv2.imshow("Live Verification", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# -------------------------------
# MAIN PROGRAM
# -------------------------------
print("[1] Capture known face - face recognition.py:90")
print("[2] Start verification - face recognition.py:91")
choice = input("Choose: ")

if choice == "1":
    capture_known_face()
elif choice == "2":
    verify_live()
else:
    print("Invalid choice. - face recognition.py:99")
