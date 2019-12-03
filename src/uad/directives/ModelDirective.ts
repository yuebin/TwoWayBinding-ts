import { IDirective, VNode, directive, EventType } from "../index";


@directive("u-model")
class ModelDirective implements IDirective{
    
    private vNode:VNode;

    init(vnode: VNode, binding: any): void {
        this.vNode = vnode;
        if (binding){
            this.vNode.value = binding.value;
        }
        this.vNode.addEventListener(EventType.INPUT,(event:any)=>{
            this.vNode.value = (event.target as any).value;
        });
    }    
    
    bind(vnode: VNode, binding: any): void {
    }
    
    update(vnode:VNode): void {
    }
}
export {
    ModelDirective
}