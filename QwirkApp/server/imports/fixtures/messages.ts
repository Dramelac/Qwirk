import { Messages } from '../../../both/collections/message.collection';
import { Message } from "../../../both/models/message.model"

export function loadMessages() {
    if (Messages.find().cursor.count() === 0) {
        const msgs: Message[] = [{
            content: 'Hello there !',
            user: 'Droopy',
            publicly: true
        }, {
            content: 'Hey !What\'s up',
            user: 'Dramelac',
            publicly: true
        }, {
            content: 'Nothing and u ?',
            user: 'Droopy',
            publicly: false
        }];

        msgs.forEach((msg: Message) => Messages.insert(msg));
    }
}
