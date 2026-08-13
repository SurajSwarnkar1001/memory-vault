export function groupEntriesByDate(entries) {
  if (!entries || entries.length === 0) return [];

  const groups = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  entries.forEach((entry) => {
    const entryDate = new Date(entry.entryDate);
    entryDate.setHours(0, 0, 0, 0);

    let dateHeader = '';

    if (entryDate.getTime() === today.getTime()) {
      dateHeader = 'Today';
    } else if (entryDate.getTime() === yesterday.getTime()) {
      dateHeader = 'Yesterday';
    } else {
      dateHeader = entryDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    if (!groups[dateHeader]) {
      groups[dateHeader] = [];
    }
    groups[dateHeader].push(entry);
  });

  // Convert groups object to sorted array
  // Since original entries are already sorted by entryDate, the keys will retain their relative order of appearance.
  return Object.keys(groups).map((header) => ({
    dateHeader: header,
    entries: groups[header],
  }));
}
