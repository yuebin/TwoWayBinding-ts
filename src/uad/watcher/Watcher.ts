import { Component, Message, MessageType } from "../index";

class Watcher{

    private static instance:Watcher;
    private handler:any;
    private pipeMessage:Array<Message>;

    private constructor(){
        let _thet = this;
        this.pipeMessage = new Proxy([],{
            get: function (target: any, key: string, receiver: any) {
                return Reflect.get(target, key, receiver);
            },
            set: function (target: any, key: string, value: any, receiver: any) {
                if (target[key] !== value) {
                    setTimeout(() => {
                        _thet.processMessage(value)   
                    });
                }
                return Reflect.set(target, key, value, receiver);
            }
        });
    }


    /**
     * name
     */
    public processMessage(value:any):void {
        if(value && value instanceof Message){
            switch (value.type) {
                case MessageType.WATCHER:
                    (value.message.context as Component).execWatcher(value);
                    break;
            
                default:
                    break;
            }
        }
    }


    
    public getWatcherHandler(component:Component,stateName:string):any{
        if (!this.handler){
            let _thet = this;
            this.handler = {
                get: function (target: any, key: string, receiver: any) {
                    
                    return Reflect.get(target, key, receiver);
                },
                set: function (target: any, key: string, value: any, receiver: any) {
                    if(target[key] !== value){
                        let message:Message = new Message();
                        message.type = MessageType.WATCHER;
                        message.message = {
                            context:component,
                            value:value,
                            changeKey:key,
                            target:target,
                            stateName: stateName
                        };
                        _thet.submitMessage(message);
                    }
                    return Reflect.set(target, key, value, receiver);
                }
            };
        }
        return this.handler
    }

    public submitMessage(message:Message):void{
        this.pipeMessage.push(message);
    }

    public static getWatcher():Watcher{
        if (!Watcher.instance){
            Watcher.instance = new Watcher();
        }
        return Watcher.instance;
    }

}

export{
    Watcher
}