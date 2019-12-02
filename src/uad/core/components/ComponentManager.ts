import { Component } from "./Component";
import { EventType } from "../../index";
import VNode from "../../vnode/VNode";

/**
 * 组件管理类，
 * 用于管理系统中组件，系统中需要使用的组件都要在此进行管理。
 */
class ComponentManager{
    
    private static instance: ComponentManager;

    private readonly componentMap: Map<string, Component> = new Map<string, Component>();
    private readonly componentVnodeMap: Map<string, Component> = new Map<string, Component>();

    private constructor(){
        if (ComponentManager.instance){
            throw new Error("ComponentManager系统中只能有一个，可以通过fangfa'ComponentManager.getComponentManager()'获取，不能new");
        }
    }

    public register(_component:Component):void{
        if(this.componentMap.has(_component.name)){
            console.error(`组件已经注册${_component.name}`);
        }else{
            this.componentMap.set(_component.name,_component);
        }
    }


    _registerVNode(vNode: VNode, _component: Component): any {
        if (vNode.children && vNode.children.length > 0) {
            vNode.children.forEach((cVNode:VNode)=>{
                this.componentVnodeMap.set(`${cVNode.id}`, _component);
                if (cVNode.children && cVNode.children.length > 0){
                    this._registerVNode(cVNode, _component);
                }
            });
        }
    }

    registerVNode(_component: Component):void{
        let vNode: VNode = _component.getVNode();
        this.componentVnodeMap.set(`${vNode.id}`, _component);
        this._registerVNode(vNode, _component);
    }


    /**
     * 获取ComponentManager实例
     */
    public static getComponentManager(): ComponentManager{
        if (!ComponentManager.instance){
            ComponentManager.instance = new ComponentManager();
        }
        return ComponentManager.instance;
    }

}


export {
    ComponentManager
}