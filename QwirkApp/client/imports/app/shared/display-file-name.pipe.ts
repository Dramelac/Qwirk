import {Pipe, PipeTransform} from "@angular/core";
import {Files} from "../../../../both/collections";

@Pipe({
    name: 'displayFileName'
})
export class DisplayFileNamePipe implements PipeTransform {
    transform(imageId: string) {
        if (!imageId) {
            return;
        }

        let imageName: string;

        const found = Files.findOne(imageId);

        if (found) {
            imageName = found.name;
        } else {
            //TODO default image
        }

        return imageName;
    }
}