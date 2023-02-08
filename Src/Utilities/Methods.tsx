export function getyears(startingYear = 1900) {
  const offset = new Date().getFullYear() - startingYear;

  let thisYear = new Date().getFullYear();
  let allYears = [];
  for (let x = 0; x <= offset; x++) {
    allYears.push(thisYear - x);
  }
  return allYears;
}
