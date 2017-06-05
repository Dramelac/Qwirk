import {DisplayNamePipe} from "./display-name.pipe";
import {DisplayMainImagePipe} from "./display-main-image.pipe";
import {DisplayFileNamePipe} from "./display-file-name.pipe";
import {DisplayProfileImagePipe} from "./display-profile-image.pipe";

export const SHARED_DECLARATIONS: any[] = [
    DisplayNamePipe,
    DisplayMainImagePipe,
    DisplayFileNamePipe,
    DisplayProfileImagePipe
];