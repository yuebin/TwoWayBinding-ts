import { Component, component } from "../../index";

class EventAgent{
    
    private static instace:EventAgent;
    private eventMap:Map<string,any>;


    private constructor(){
        if (EventAgent.instace) {
            throw Error("请使用getEventAgent获取其实例！");
        }
        this.eventMap = new Map<string,any>();
        document.addEventListener('input',(event:any)=>{
            console.error(event);
        });
    }


    public addEvent(eventType: string, component:Component):void{
        this.eventMap.set(eventType,component);
    }


    public static getEventAgent():EventAgent{
        if (!EventAgent.instace){
            EventAgent.instace = new EventAgent();
        }
        return EventAgent.instace;
    }

}

export {
    EventAgent
}