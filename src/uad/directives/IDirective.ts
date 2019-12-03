import { VNode } from "../index";

export default interface IDirective{

    init(vnode: VNode,binding:any):void;
   
    /**在元素绑定是使用**/
    bind(vnode:VNode,binding:any):void;
   
    /**在元素有更新是绑定**/
    update(vnode:VNode):void;
}
