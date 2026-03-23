/**
 * Name pools by region for the Starting Conditions Generator.
 * Minimal MVP set — expand for content sprints.
 */

export const NAME_POOLS: Record<string, readonly string[]> = {
  north_american_suburban: [
    "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia",
    "Mason", "Isabella", "Lucas", "Mia", "Logan", "Charlotte", "Alex",
  ],
  european_urban: [
    "Lukas", "Amelie", "Matteo", "Elena", "Hugo", "Clara", "Felix", "Elise",
    "Leo", "Margot", "Nils", "Ingrid", "Anton", "Chiara", "Henri",
  ],
  east_asian_metro: [
    "Haruki", "Yuki", "Jian", "Mei", "Sora", "Hana", "Wei", "Aiko",
    "Riku", "Sakura", "Min-jun", "Eunji", "Kai", "Lin", "Ren",
  ],
  latin_american: [
    "Mateo", "Valentina", "Santiago", "Camila", "Sebastian", "Lucia",
    "Daniel", "Sofia", "Miguel", "Isabella", "Diego", "Martina", "Carlos", "Ana", "Rafael",
  ],
  south_asian: [
    "Arjun", "Priya", "Rohan", "Aanya", "Vivaan", "Diya", "Aarav", "Meera",
    "Kabir", "Ananya", "Ishaan", "Saanvi", "Dev", "Nisha", "Rahul",
  ],
  african_urban: [
    "Kwame", "Amara", "Tendai", "Zuri", "Kofi", "Nia", "Jabari", "Aisha",
    "Chidi", "Fatima", "Oluwaseun", "Ayo", "Emeka", "Lina", "Sekou",
  ],
  rural_small_town: [
    "Jack", "Daisy", "Billy", "Rose", "Hank", "Ruby", "Clay", "Violet",
    "Jesse", "Lily", "Travis", "Pearl", "Wade", "June", "Cole",
  ],
  immigrant_experience: [
    "Andre", "Yara", "Marco", "Leila", "Pavel", "Nadia", "Omar", "Sana",
    "Viktor", "Jasmine", "Reza", "Maria", "Tomas", "Lien", "Darius",
  ],
};

export const REGION_LOCATIONS: Record<string, readonly string[]> = {
  north_american_suburban: ["Cedar Hills", "Maple Ridge", "Lakewood", "Riverside"],
  european_urban: ["Berlin", "Lyon", "Milan", "Amsterdam"],
  east_asian_metro: ["Seoul", "Tokyo", "Taipei", "Shanghai"],
  latin_american: ["Buenos Aires", "Bogotá", "São Paulo", "Lima"],
  south_asian: ["Mumbai", "Dhaka", "Lahore", "Bangalore"],
  african_urban: ["Lagos", "Nairobi", "Accra", "Johannesburg"],
  rural_small_town: ["Millfield", "Dust Creek", "Pinehaven", "Stoneybrook"],
  immigrant_experience: ["New City", "Westside", "Harbor District", "Greenfield"],
};
