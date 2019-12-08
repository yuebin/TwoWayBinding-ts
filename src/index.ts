import { component, model, method, watch} from "./uad/index";
import UAD from "./uad/core/UAD";


@component({
    el:"#app",
    // template:`<div class="container" data-nid="12" @click="sayHello">
    //     Hello world! {{state.date}}.
    //     State data {{state.state.value}}
    //     Input value : {{state.value}}
    //     <br />
    //     <input type="text" u-model="state.value" />
    // </div>`
    templateUrl: "/examples/components/app/app.html"
})
class App{
    constructor(){
        this.state.date = new Date();
        this.state.state.value = new Date().getTime();
    }

    @model()
    state:any = {
        date:new Date().getTime(),
        state:{
            value:"State.Value"
        },
        value:"初始化值"
    }


    @method('sayHello')
    sayWord(){
        console.error('Say hello');
        this.state.date = new Date();
        
    }

    @watch("state.date")
    dateChange(newValue:any){
        console.error(`dateChange:${newValue}`);
    }
}

UAD.bootstartup();