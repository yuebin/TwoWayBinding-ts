import IDirective from "./IDirective";
import { stringify } from "querystring";

class DirectiveManager{

    private directiveMap:Map<string,Function>;

    findDirective(key: any): IDirective {
        let directiveClass = this.directiveMap.get(key);
        if (!directiveClass){
            throw new Error(`指令${key}未注册！`);
        }
        return new directiveClass.prototype.constructor();
    }

    static instance: DirectiveManager;

    constructor(){
        if (DirectiveManager.instance){
            throw new Error("User DirectiveManager.getDirectiveManager");
        }
        this.directiveMap = new Map<string, Function>();
    }


    static getDirectiveManager(): DirectiveManager{
        
        if (!DirectiveManager.instance){
            DirectiveManager.instance = new DirectiveManager();
        }

        return DirectiveManager.instance;
    }

    public registerDirective(directiveName:string,directive:Function):void{
        if (this.directiveMap.has(directiveName)){
            throw new Error(`指令${directiveName} 重复注册。`);
        }
        this.directiveMap.set(directiveName, directive);
    }

}

export {
    DirectiveManager
}