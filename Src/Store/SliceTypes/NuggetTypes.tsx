import { NuggetDataProp } from "./HomeTypes";

type LikedNuggetsProp = {
    id:number;
    total_likes:number
}

type UnlikedNuggetsProp = {
    id: number,
    total_likes: number,
}

type UploadingNuggetProp = {
    id: string,
    progressValue: number,
}


export type NuggetActionsDataProp = {
    likedNuggets: LikedNuggetsProp[], //{ id:nugget_id,total_likes:TOTAL_LIKES}
    savedNuggetsIds: number[],
    unLikedNuggetsFromLikedNuggets: UnlikedNuggetsProp[],
    editedNuggets: NuggetDataProp[],
    deletedNuggetsIds: number[],
    translatedNuggets: NuggetDataProp[],
    uploadingNuggets: UploadingNuggetProp[],
}