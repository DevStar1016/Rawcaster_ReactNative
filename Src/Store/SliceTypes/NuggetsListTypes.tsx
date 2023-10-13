import {NuggetDataProp} from './HomeTypes';

type NuggetsListProp = {
  influencing: NuggetDataProp[];
  forYou: NuggetDataProp[];
  [key: string]: NuggetDataProp[];
};

type NuggetsLoadingProp = {
  influencing: boolean;
  forYou: boolean;
  [key: string]: boolean;
};

type NuggetsErrorMessageProp = {
  influencing: string;
  forYou: string;
  [key: string]: string;
};

type TotalPagesProp = {
  influencing: number;
  forYou: number;
  [key: string]: number;
};

export type NuggetsListDataProp = {
  totalPages: TotalPagesProp;
  nuggetsLoading: NuggetsLoadingProp;
  nuggetsList: NuggetsListProp;
  nuggetsErrorMessage: NuggetsErrorMessageProp;
};
