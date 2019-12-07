import { Component, ComponentManager } from "../../index";
import VNode from "../../vnode/VNode";

enum EventType{
    CLICK = "click",
    INPUT = "input",
    COMPOSITION_UPDATE = "compositionupdate",
    COMPOSITION_END= "compositionend",
    COMPOSITION_START = "compositionstart",
}

class EventAgent{
    
    private static instace:EventAgent;
    private eventMap:Map<string,any>;
    private eventVNodeComponentMap: Map<string, any>;


    private constructor(){
        if (EventAgent.instace) {
            throw Error("请使用getEventAgent获取其实例！");
        }
        this.eventMap = new Map<string,any>();
        this.eventVNodeComponentMap = new Map<string, any>();
        
    }


    public initEvent(): any {

        let compositionstart:boolean = false;
        
        document.addEventListener(EventType.INPUT, (event: any) => {
            if (!compositionstart){
                this.dispatcher(EventType.INPUT, event);
            }
        },true);

        document.addEventListener(EventType.COMPOSITION_END, (event: any)=>{
            if (compositionstart){
                compositionstart = false;
                this.dispatcher(EventType.INPUT, event);
            }
        });

        document.addEventListener(EventType.COMPOSITION_START, (event: any) => {
            if (!compositionstart){
                compositionstart = true;
            }
        });

        document.addEventListener(EventType.CLICK, (event: any) => {
            this.dispatcher(EventType.CLICK, event);
        });

    }

    public dispatcher(type:EventType,event:Event){
        // ComponentManager.getComponentManager().dispatcher(type,event);
        let id = (event.target as any).dataset.vnodeId;
        let key = `${id}_${type}`;
        
        if (this.eventVNodeComponentMap.has(key)){
            let eventValue = this.eventVNodeComponentMap.get(key);
            eventValue.comp.dispatcherEvent(eventValue.exporess,event);
        }
    }

    public addVNodeEvent(eventType:EventType|string,vnode: VNode, exporess: any, _component: Component): any {
        this.eventVNodeComponentMap.set(`${vnode.id}_${eventType}`, { comp: _component, vnode: vnode, exporess: exporess});
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
    EventAgent,
    EventType
}