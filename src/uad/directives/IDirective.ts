
export default interface IDirective{
   /**在元素绑定是使用**/
   bind(vnode:VNode);
   /**在元素有更新是绑定**/
   update(vnode:VNode);
}
