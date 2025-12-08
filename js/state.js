// App state management
export const state = {
  lastLatitude: null,
  lastLongitude: null,
  offset: 0,
  PAGE_SIZE: 50,
  hasMore: true,
  isLoading: false,
  
  // App mode
  currentMode: "note",
  currentNoteType: "normal",
  
  // Gate verification
  hasLocation: false,
  hasSelfie: false,
  selfieData: null,
};

export const nicknames = [
  "Meri Sukoon",
  "Silent Magic",
  "Yaad ki Raani",
  "Little Storm",
  "Tumhara Phir?",
  "Meri Saanth",
  "My 'Aapko Pata Nhi'",
  "Angry Switch",
  "Koot Dungi Express",
  "Soft Chaos",
  "Silent Symphony",
  "Meri Shaanti",
  "Calendar Queen",
  "Dil Ka Haal",
  "Pyaari Si Musibat",
  "Meethi Gussa",
  "Chup Chaap Toofan",
  "Meri Zindagi",
];