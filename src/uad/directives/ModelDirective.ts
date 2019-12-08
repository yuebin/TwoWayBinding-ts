import { IDirective, VNode, directive, EventType } from "../index";

/**
 * u-model指令相当于执行了 bind与 input ，两个指令的表达式
 */
@directive("u-model")
class ModelDirective implements IDirective{
    
    private vNode:VNode;

    init(vnode: VNode, binding: any): void {
        this.vNode = vnode;

        if (binding){
            //1,此处相当于表达式 value = {{value= binding.vaue}}
            this.vNode.value = binding.value;
        }

        //2,此处相当于 指令的表达式 onInput =  {{value = binding.value }}
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