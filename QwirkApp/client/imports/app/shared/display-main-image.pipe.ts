import {Pipe, PipeTransform} from "@angular/core";
import {Images} from "../../../../both/collections/images.collection";

@Pipe({
    name: 'displayMainImage'
})
export class DisplayMainImagePipe implements PipeTransform {
    transform(imageId: string) {
        if (!imageId) {
            return;
        }

        let imageUrl: string;

        const found = Images.findOne(imageId);
        console.log(found);

        if (found) {
            imageUrl = found.url;
        } else {
            //TODO default image
        }

        return imageUrl;
    }
}