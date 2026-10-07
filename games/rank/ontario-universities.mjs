// Ontario's publicly assisted universities; federal Royal Military College is excluded.
// Names/logos: https://www.ontario.ca/page/ontario-universities (checked 2026-10-06).
const schools = [
  ['Algoma University', 'https://files.ontario.ca/images/algoma.gif'],
  ['Brock University', 'https://files.ontario.ca/images/brock2.gif'],
  ['Carleton University', 'https://files.ontario.ca/carletonu-logo-july21-200pxw_0.jpg'],
  ['Lakehead University', 'https://files.ontario.ca/images/lakehead.png'],
  ['Laurentian University', 'https://files.ontario.ca/images/uLaurent.jpg'],
  ['McMaster University', 'https://files.ontario.ca/images/mcmaster.gif'],
  ['Nipissing University', 'https://files.ontario.ca/images/nipiss.gif'],
  ['NOSM University', 'https://ontario.ca/files/2022-08/mcu-northern-ont-school-med-logo-en-2022-08-30-200x60px.jpg'],
  ['OCAD University', 'https://files.ontario.ca/ocadu_ocaduniversity_logo_0.jpg'],
  ['Ontario Tech University', 'https://files.ontario.ca/ontario-tech-u-200pxw.jpg'],
  ['Queen’s University', 'https://files.ontario.ca/images/queens2.gif'],
  ['Toronto Metropolitan University', 'https://ontario.ca/files/2022-08/mcu-toronto-metropolitan-u-logo-2022-08-30-200pxw.png'],
  ['Trent University', 'https://files.ontario.ca/trentu.png'],
  ['University of Guelph', 'https://files.ontario.ca/images/guelph.jpg'],
  ['Université de Hearst', 'https://files.ontario.ca/hearst-fr.png'],
  ['Université de l’Ontario français', 'https://d2khazk8e83rdv.cloudfront.net/univ-ontario-fr.png'],
  ['University of Ottawa', 'https://files.ontario.ca/images/uologobw.jpg'],
  ['University of Toronto', 'https://files.ontario.ca/images/toronto.png'],
  ['University of Waterloo', 'https://files.ontario.ca/waterloo.png'],
  ['University of Windsor', 'https://files.ontario.ca/uofwindsor.png'],
  ['Western University', 'https://files.ontario.ca/western.png'],
  ['Wilfrid Laurier University', 'https://files.ontario.ca/wilfrid-laurier-university-logo.jpg'],
  ['York University', 'https://files.ontario.ca/images/yorkulogo.jpg'],
];

export const ONTARIO_UNIVERSITIES = Object.freeze(schools.map(([name]) => name));
export const ONTARIO_UNIVERSITY_IMAGES = Object.freeze(Object.fromEntries(schools.map(([name, src]) => [name, Object.freeze({
  src,
  source: 'https://www.ontario.ca/page/ontario-universities',
  credit: `${name} logo via Ontario’s university directory; trademark belongs to the university`,
})])));
