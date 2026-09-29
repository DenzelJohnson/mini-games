import { ADDITIONAL_CATEGORIES } from './additional-categories.mjs?v=1';

// Both modes use these same pools. Await user input before generating Anime/Movies.
export const CATEGORIES = [
  { id: 'nba', name: 'NBA Players', items: [
    'LeBron James', 'Stephen Curry', 'Shai Gilgeous-Alexander', 'Nikola Jokić', 'Giannis Antetokounmpo',
    'Kevin Durant', 'Luka Dončić', 'Anthony Edwards', 'Cade Cunningham', 'Jalen Brunson',
    'Joel Embiid', 'James Harden', 'Jimmy Butler', 'Kawhi Leonard', 'Scottie Barnes',
    'Victor Wembanyama', 'Donovan Mitchell', 'Jayson Tatum', 'Devin Booker', 'Cooper Flagg',
    'Tyrese Maxey', 'Jaylen Brown', 'Jalen Johnson', 'Karl-Anthony Towns', 'Tyrese Haliburton',
    'Jalen Williams', 'Alperen Şengün', 'Chet Holmgren', 'Jamal Murray', 'Amen Thompson',
    'Ausar Thompson', 'Evan Mobley', 'Paolo Banchero', 'Austin Reaves', 'Stephon Castle',
    'Zion Williamson', 'LaMelo Ball', 'Bam Adebayo', 'Pascal Siakam', 'Trae Young',
    'Kon Knueppel', 'Deni Avdija', 'Anthony Davis', 'Lauri Markkanen', 'Domantas Sabonis',
    'Jalen Duren', 'Dylan Harper', 'VJ Edgecombe', 'Franz Wagner', 'Julius Randle',
    'De’Aaron Fox', 'Rudy Gobert', 'Derrick White', 'Payton Pritchard', 'Brandon Ingram',
    'Kyrie Irving', 'Damian Lillard', 'OG Anunoby', 'Darius Garland', 'Jarrett Allen',
    'AJ Dybantsa', 'Jaren Jackson Jr.', 'Josh Giddey', 'Tyler Herro', 'Desmond Bane',
    'Klay Thompson', 'Draymond Green', 'Ja Morant', 'Norman Powell', 'Ivica Zubac',
    'Mikal Bridges', 'Cameron Johnson', 'Kristaps Porziņģis', 'Keyonte George', 'Myles Turner',
    'Cason Wallace', 'Aaron Gordon', 'Michael Porter Jr.', 'Naz Reid', 'Devin Vassell',
    'Jaden McDaniels', 'Jabari Smith Jr.', 'Zach LaVine', 'DeMar DeRozan', 'Nickeil Alexander-Walker',
    'Jalen Green', 'Dillon Brooks', 'RJ Barrett', 'Cameron Boozer', 'Darryn Peterson',
    'Darius Acuff Jr.', 'Caleb Wilson', 'Alex Sarr', 'Will Riley',
    'Russell Westbrook', 'Dejounte Murray', 'CJ McCollum', 'Tobias Harris', 'Brook Lopez', 'Bobby Portis',
  ] },
  { id: 'anime', name: 'Anime Characters', pending: true, items: [] },
  { id: 'movies', name: 'Movies', pending: true, items: [] },
  ...ADDITIONAL_CATEGORIES,
];
