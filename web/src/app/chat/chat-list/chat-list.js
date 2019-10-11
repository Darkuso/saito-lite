import { ChatListTemplate ***REMOVED*** from './chat-list.template.js';
import { ChatListRowTemplate ***REMOVED*** from './chat-list-row.template.js';

import { ChatRoom ***REMOVED*** from '../chat-room/chatroom.js';
import { ChatAdd  ***REMOVED*** from '../chat-add/chatadd.js';

export const ChatList = {
    render(mod) {
        document.querySelector('.main').innerHTML = ChatListTemplate();

        Object.values(mod.chat.rooms).forEach((room) => {
            document.querySelector('.chat').innerHTML
                += ChatListRowTemplate(room, room.messages[room.messages.length - 1]);
    ***REMOVED***);

        this.bindDOMFunctionstoModule(mod);

        this.attachEvents(mod);
***REMOVED***,

    attachEvents(mod) {
***REMOVED*** add click event to all of our existing chat rows
        Array.from(document.getElementsByClassName('chat-row'))
             .forEach(row => row.addEventListener('click', (e) => {
                let room_id = e.currentTarget.id;
                ChatRoom.render(mod, mod.chat.rooms[room_id]);
         ***REMOVED***)
        );

***REMOVED*** add click event to create-button
        document.querySelector('#chat.create-button')
                .addEventListener('click', ChatAdd.render);
***REMOVED***,

    // persepctive of Module
    bindDOMFunctionstoModule(mod) {
        mod.chat.renderChatList = this.renderChatList(mod);
***REMOVED***,

    renderChatList(mod) {
        return function () {
            Object.values(mod.chat.rooms).forEach((room) => {
                document.querySelector('.chat').innerHTML
                    += ChatListRowTemplate(room, room.messages[room.messages.length - 1]);
        ***REMOVED***);

            Array.from(document.getElementsByClassName('chat-row'))
                .forEach(row => row.addEventListener('click', (e) => {
                    let room_id = e.currentTarget.id;
                    ChatRoom.render(mod, mod.chat.rooms[room_id]);
            ***REMOVED***)
            );

    ***REMOVED*** add click event to create-button
            document.querySelector('#chat.create-button')
                    .addEventListener('click', ChatAdd.render);
    ***REMOVED***
***REMOVED***,
***REMOVED***
