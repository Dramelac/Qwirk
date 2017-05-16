import {Pipe, PipeTransform} from "@angular/core";
import {Files} from "../../../../both/collections";

@Pipe({
    name: 'displayMainImage'
})
export class DisplayMainImagePipe implements PipeTransform {
    transform(imageId: string) {
        if (!imageId) {
            return;
        }

        let imageUrl: string;

        const found = Files.findOne(imageId);

        if (found) {
            imageUrl = found.url;
        } else {
            //TODO default image
        }

        return imageUrl;
    }
}