import { ChatAddTemplate } from './chat-add.template.js';

export const ChatAdd = {
    render() {
        document.querySelector('.main')
                .innerHTML = ChatAddTemplate();
    }
}