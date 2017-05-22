import {DisplayNamePipe} from "./display-name.pipe";
import {DisplayMainImagePipe} from "./display-main-image.pipe";
import {DisplayFileNamePipe} from "./display-file-name.pipe";

export const SHARED_DECLARATIONS: any[] = [
    DisplayNamePipe,
    DisplayMainImagePipe,
    DisplayFileNamePipe
];