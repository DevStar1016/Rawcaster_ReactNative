export type BadgesType =
  | 'valued'
  | 'premium'
  | 'diamond'
  | 'nano'
  | 'micro'
  | 'macro'
  | 'mega';
const Badges = (id: number) => {
  switch (id) {
    case 1:
      return 'valued';
    case 3:
      return 'premium';
    case 4:
      return 'diamond';
    case 5:
      return 'nano';
    case 6:
      return 'micro';
    case 7:
      return 'macro';
    case 8:
      return 'mega';
    default:
      return 'valued';
  }
};

export default Badges;
