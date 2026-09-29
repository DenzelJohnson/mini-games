// Group boundaries preserve the user's requested counts; the game samples one shared pool.
export const SUPERHERO_GROUPS = Object.freeze({
  "Provided": Object.freeze(["Superman","Wonder Woman","Green Lantern","Flash","Martian Manhunter","Aquaman","Batman","Iron Man","Captain America","Thor","Hulk","Hawkeye","Green Arrow","Black Widow","Doctor Strange","Spider-Man","Winter Soldier","Black Panther","Captain Marvel","Scarlet Witch","Shang-Chi","Daredevil","Punisher","Moon Knight","Taskmaster"]),
  "X-Men heroes": Object.freeze(["Wolverine","Cyclops","Jean Grey","Storm","Rogue","Gambit","Nightcrawler","Beast","Professor X","Iceman","Colossus","Kitty Pryde","Jubilee","Psylocke","Angel","Bishop","Cable","Magik","Emma Frost","Havok"]),
  "X-Men villains": Object.freeze(["Magneto","Mystique","Apocalypse","Mr. Sinister","Juggernaut"]),
  "Justice League heroes": Object.freeze(["Cyborg","Black Canary","Hawkgirl","Hawkman","Shazam","Zatanna","The Atom","Blue Beetle","Firestorm","Red Tornado"]),
  "Avengers": Object.freeze(["Ant-Man","Wasp","Vision","War Machine","Falcon","She-Hulk","Spider-Woman","Quicksilver","Black Knight","Ms. Marvel"]),
  "DC villains": Object.freeze(["Lex Luthor","Darkseid","Brainiac","General Zod","Doomsday","Reverse-Flash","Sinestro","Black Manta","Ocean Master","Cheetah","Ares","Gorilla Grodd","Deathstroke","Black Adam","Atrocitus","Anti-Monitor","Trigon","Despero","Starro","Parasite","Metallo","Livewire","Vandal Savage","Eclipso","Giganta"]),
  "Marvel villains": Object.freeze(["Thanos","Loki","Ultron","Kang the Conqueror","Doctor Doom","Galactus","Hela","Red Skull","Baron Zemo","Abomination","The Leader","Enchantress","Malekith","The Mandarin","Killmonger","Ronan the Accuser","Super-Skrull","Annihilus","Dormammu","Mephisto","Gorr the God Butcher","High Evolutionary","MODOK","The Hood","Bullseye"]),
  "Batman villains": Object.freeze(["Joker","Harley Quinn","The Riddler","The Penguin","Two-Face","Poison Ivy","Scarecrow","Bane","Mr. Freeze","Ra's al Ghul","Talia al Ghul","Clayface","Man-Bat","Firefly","The Mad Hatter"]),
  "Spider-Man villains": Object.freeze(["Green Goblin","Doctor Octopus","Venom","Carnage","Mysterio","Kraven the Hunter","Electro","Sandman","Vulture","Rhino","Scorpion","Lizard","Hobgoblin","Kingpin","Chameleon"]),
  "Fantastic Four": Object.freeze(["Mr. Fantastic","Invisible Woman","Human Torch","The Thing"]),
});
export const SUPERHEROES = Object.freeze(Object.values(SUPERHERO_GROUPS).flat());
