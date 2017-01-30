import { Messages } from '../../../both/collections/message.collection';
import { Message } from "../../../both/models/message.model"

export function loadMessages() {
    if (Messages.find().cursor.count() === 0) {
        const msgs: Message[] = [{
            content: 'Hello there !',
            user: 'Droopy'
        }, {
            content: 'Hey !What\'s up',
            user: 'Dramelac'
        }, {
            content: 'Nothing and u ?',
            user: 'Droopy'
        }];

        msgs.forEach((msg: Message) => Messages.insert(msg));
    }
}
