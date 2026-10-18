

// Email that receives document requests and enrollment details
const REGISTRAR_EMAIL = "registrar@cvlis.example";

// Default announcements
const DEFAULT_NEWS = [
  ["JUL", "28", "Brigada Eskwela wrap-up and thank you to volunteers",
   "Classrooms across all grade levels have been repainted and repaired ahead of the term.", "General"],
  ["JUL", "22", "Second quarter exam schedule now posted",
   "Junior High and Senior High schedules are up under Events — check your section's time block.", "Academics"],
  ["JUL", "15", "Registrar office closed for inventory, July 18",
   "Document requests filed that day will be processed starting July 19.", "Registrar"]
];

// Default events
const DEFAULT_EVENTS = [
  ["AUG", "04", "First day, 2nd quarter", "All grade levels"],
  ["AUG", "11", "Parent-Teacher conference", "Covered court"],
  ["AUG", "21", "Buwan ng Wika opening program", "School grounds"]
];

// Live data (loaded from localStorage or defaults)
let NEWS = [...DEFAULT_NEWS];
let EVENTS = [...DEFAULT_EVENTS];

// [document name, turnaround time]
const DOCS = [
  ["Good Moral Certificate", "~2 days"],
  ["Form 137 / SF10", "~3 days"],
  ["Certificate of Enrollment", "~1 day"],
  ["Diploma / Transcript copy", "~5 days"]
];

const ENROLLMENT_STEPS = [
  "Prepare the requirements for your student type (see the Enrollment page).",
  "Go to the school with the student and a parent or guardian, and proceed to the registrar's office.",
  "Submit your documents, fill out the enrollment form on site, and get your section and schedule."
];

// Enrollment is done in person at the school. There is NO online enrollment.
// Edit the details below to match the school's actual office and schedule.
const ENROLL_OFFICE = "Registrar's Office, Camp Vicente Lim Integrated School, Brgy. Mayapa, Calamba City";
const ENROLL_HOURS = "Monday to Friday, 8:00 AM – 4:00 PM";

// [title, details]
const ENROLL_PROCEDURE = [
  ["Check the enrollment schedule",
   "Read the Announcements page for the enrollment period and any special instructions from the school."],
  ["Prepare your requirements",
   "Gather the documents for your student type (listed below). Bring the original and a photocopy of each."],
  ["Go to the school",
   "The student should come with a parent or guardian. Bring a valid ID and the student's LRN."],
  ["Proceed to the registrar's office",
   "Submit your documents for checking. For Grade 11 and 12, tell the registrar which SHS strand you choose."],
  ["Fill out the enrollment form",
   "The registrar will give you the official enrollment form. Fill it out completely and sign it."],
  ["Get your section and schedule",
   "Once your documents are complete, the registrar will assign the student a section and give the class schedule."],
  ["Settle any remaining requirements",
   "If a document is missing, ask the registrar how and when to submit it. Keep your copy of the enrollment form."]
];

const GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

const STUDENT_TYPES = [
  ["new", "New student"],
  ["transferee", "Transferee"],
  ["returning", "Returning student"]
];

// SHS Strands available at CVLIS
const SHS_STRANDS = [
  ["ICT", "Information & Communications Technology"],
  ["STEM", "Science, Technology, Engineering & Mathematics"],
  ["ABM", "Accountancy, Business & Management"],
  ["Cookery", "Cookery NC II"],
  ["EIM", "Electrical Installation & Maintenance"],
  ["SMAW", "Shielded Metal Arc Welding"],
  ["CSS", "Computer Systems Servicing"]
];

// [id, label, hint, required for which student types]
const ENROLL_DOCS = [
  ["birth", "PSA Birth Certificate", "Clear scan or photo of the original", ["new", "transferee"]],
  ["card", "Report Card (Form 138)", "Latest report card", ["new", "transferee", "returning"]],
  ["sf10", "Form 137 / SF10", "Permanent record from your previous school", ["new", "transferee"]],
  ["moral", "Good Moral Certificate", "Issued by your previous school", ["transferee"]],
  ["photo", "2x2 ID Photo", "Plain background, recent photo", []]
];

const STAFF = [
  ["Registrar", "Registrar's Office"],
  ["School Principal", "Office of the Principal"],
  ["Junior High Coordinator", "Grades 7–10"],
  ["Senior High Coordinator", "Grades 11–12"],
  ["Guidance Counselor", "Guidance Office"],
  ["Clinic / Nurse", "School Clinic"]
];

const POLL_QUESTION = "Which event should we hold next?";
const POLL_OPTIONS = ["Sports Fest", "Science Fair", "Cultural Day"];

// ----- Help guide -----
const HELP = [
  ["Getting around the website", [
    "Tap the menu button (the three lines at the top left) to open the side menu.",
    "Choose a page, such as School Info, Announcements, or Events. The menu closes by itself.",
    "To close the menu without choosing, tap the dark area outside it.",
    "Choose Home any time to go back to the front page."
  ]],
  ["Create an account and log in", [
    "Tap Sign up at the top right of the page.",
    "Enter your full name, email, and a password, then tap Continue.",
    "Next time, tap Log in and use the same email and password.",
    "When you are logged in, your name and email are filled in automatically on the forms."
  ]],
  ["How to enroll", [
    "Enrollment is done in person at the school. There is no online enrollment.",
    "Open Enrollment from the menu to see the steps and the list of requirements for your student type.",
    "Prepare the documents. Bring the originals and photocopies, a valid ID, and the student's LRN.",
    "Go to the registrar's office with the student and a parent or guardian.",
    "Submit your documents, fill out the enrollment form, and get your section and schedule."
  ], "enroll", "Go to Enrollment"],
  ["How to request a document", [
    "Open Document Requests from the menu.",
    "Enter the full name, LRN, and email of the student the document is for.",
    "Choose the document you need and write the purpose.",
    "Tap Send request via email."
  ], "request", "Go to Document Requests"],
  ["Announcements and events", [
    "Open Announcements to read the latest school news.",
    "Open Events to see the school calendar with dates and places.",
    "The Home page shows the newest announcements and the next events."
  ], "news", "See announcements"],
  ["Quick poll", [
    "Find the Quick poll on the Home page.",
    "Tap Vote under your choice. You can vote once in each browser.",
    "The results show right after you vote."
  ], "home", "Go to Home"],
  ["Who to contact", [
    "Open Staff Directory from the menu.",
    "Find the office you need, such as the Registrar, Guidance, or the Clinic.",
    "Bring a valid ID or your LRN when visiting an office."
  ], "staff", "Open Staff Directory"],
  ["Admin Panel (school head only)", [
    "The Admin Panel is for the school head to manage announcements and events.",
    "Tap Log in at the top and use the admin email and password. The Admin Panel appears in the menu only for the admin.",
    "Add, edit, or delete announcements and events — changes appear on the site right away."
  ], "admin", "Go to Admin Panel"],
  ["Having trouble?", [
    "You forgot your password: passwords cannot be recovered yet. Sign up again with a different email, or ask the school for help.",
    "The page looks out of date: refresh the page or close and reopen the browser."
  ]]
];