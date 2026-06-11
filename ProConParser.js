function getFieldKey(line) {
  const lower = line.toLowerCase().trim();
  if (lower.startsWith("date:"))             return "date";
  if (lower.startsWith("attendance:"))       return "attendance";
  if (lower.startsWith("pros:"))             return "pros";
  if (lower.startsWith("cons:"))             return "cons";
  if (lower.startsWith("comments:"))         return "comments";
  if (lower.startsWith("notes for future:")) return "notes_for_future";
  return null;
}

function parseAttendance(line) {
  const match = line.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

function extractFieldValue(line) {
  const colonIndex = line.indexOf(":");
  return line.slice(colonIndex + 1).trim();
}

function stripBullet(line) {
  return line.trimStart().replace(/^[\*\-]\s*/, "").trim();
}

function newEvent(name) {
  return {
    event_name: name,
    date: "",
    attendance: null,
    pros: [],
    cons: [],
    comments: [],
    notes_for_future: []
  };
}

function parseSASEDoc(rawText) {
  const lines = rawText.split("\n");
  const events = [];

  let currentEvent = null;
  let currentField = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines — and reset currentField if we're in notes_for_future
    // because Notes for Future is always last; an empty line after it means
    // the next non-empty line is a new event title
    if (line === "") {
      if (currentField === "notes_for_future") {
        currentField = null;
      }
      continue;
    }

    // Check if this line is a field label
    const fieldKey = getFieldKey(line);

    if (fieldKey) {
      currentField = fieldKey;

      if (fieldKey === "date") {
        if (currentEvent) currentEvent.date = extractFieldValue(line);
      }

      if (fieldKey === "attendance") {
        if (currentEvent) currentEvent.attendance = parseAttendance(extractFieldValue(line));
      }

      continue;
    }

    // If we're inside a content field, treat this as content
    if (currentField && currentEvent && Array.isArray(currentEvent[currentField])) {
      const content = stripBullet(line);
      if (content !== "") {
        currentEvent[currentField].push(content);
      }
      continue;
    }

    // Not empty, not a field label, not inside a content field — new event title
    if (currentEvent !== null) {
      events.push(currentEvent);
    }

    currentEvent = newEvent(line);
    currentField = null;
  }

  if (currentEvent !== null) {
    events.push(currentEvent);
  }

  return events;
}


// --- USAGE ---
// node parser.js

const rawInput = `
Cultural Dance Fest - Interns
Date: 4/5/2026
Attendance: 29 (but more irl)
Pros:
Super fun and refreshing
Reitz rooms with no chairs were good spaces
So many people pulled up
We loved this event thank you Yuwei
Cons: 
Didn't have enough snacks for goodie bags
Comments: 
Sign in was a little chaotic
Some of the people that didn't rsvp didn't show up
Lot of people from Indian didn't reserve, so it made up for it
Notes for Future:




Sticker Competition
Date: 4/5/2026
Attendance: 
Pros:
Good submission - see minutes
Cons: 
One singular submission
Comments: 
Maybe not advertised well? Need more word of mouth or just earlier in the year
Lowkey released in a very busy time of year
Notes for Future:



Atlas Merch Drop
Date: close 4/4/2026
Attendance: 
Pros:
LOOKS FIRE
Cons: 
Dropped pretty late + had to be extended
Comments: 
Spring drop earlier in the semester so it doesn't clash as much with interns merch
Notes for Future:
`;

const result = parseSASEDoc(rawInput);
console.log(JSON.stringify(result, null, 2));