import {GetYearProps} from './Types';

export function getyears({
  startingYear = 1900,
  decreasedYears = 0,
}: GetYearProps) {
  let thisYear = new Date().getFullYear() - decreasedYears;
  const offset = thisYear - startingYear;
  let allYears = [];
  for (let x = 0; x <= offset; x++) {
    allYears.push(thisYear - x);
  }
  return allYears;
}
