import {Mongo} from "meteor/mongo"


export const Chat = new Mongo.Collection('chat');
export const Message = new Mongo.Collection('message');
//export  const Profile = new Mongo.Collection('profile');