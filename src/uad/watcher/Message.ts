let messageSerial:number = 0;

enum MessageType{
    WATCHER,
    EVENT,
}

class Message{

    public type:MessageType;
    public id:number;
    public message:any;

    constructor(){
        this.message = messageSerial++;
    }
}

export {
    Message,
    MessageType
}