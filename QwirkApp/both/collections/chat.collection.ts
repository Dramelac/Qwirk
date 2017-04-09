import {MongoObservable} from "meteor-rxjs";
import {Chat} from "../models/chat.model";

export const Chats = new MongoObservable.Collection<Chat>("chats");

