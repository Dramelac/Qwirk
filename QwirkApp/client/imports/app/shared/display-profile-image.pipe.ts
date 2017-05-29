import {Pipe, PipeTransform} from "@angular/core";
import {Files} from "../../../../both/collections";

@Pipe({
    name: 'displayProfileImage'
})
export class DisplayProfileImagePipe implements PipeTransform {
    transform(imageId: string) {
        if (!imageId) {
            return "/asset/user.png";
        }
        if (/https?:\/\/.*/g.test(imageId)){
            return imageId;
        }

        let imageUrl: string;
        const found = Files.findOne(imageId);

        if (found && /image\/.*/g.test(found.type)) {
            imageUrl = found.url;
        } else {
            imageUrl = "/asset/user.png";
        }

        return imageUrl;
    }
}