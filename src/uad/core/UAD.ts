import { EventAgent } from "../index";

export default class UAD{

    static bootstartup(options?:any){
        EventAgent.getEventAgent().initEvent();
    }

}