import { UID, IDirective} from '../index';

class VNode{
    private id:number;
    private name:string;
    private attrs:any;
    private directives: Array<IDirective>;
    private template:string;
    private children:Array<VNode>;
    private events:Array<any>;

    constructor(){
        this.id = UID.getId();
    }
    


}


export default VNode;