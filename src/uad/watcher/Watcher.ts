class Watcher{

    private static instance:Watcher;
    private handler:any;

    private constructor(){
    }
    
    public getWatcherHandler():any{
        if (!this.handler){
            this.handler = {
                get: function (target: any, key: string, receiver: any) {
                    console.error(`watcher get ${key}`);
                    return Reflect.get(target, key, receiver);
                },
                set: function (target: any, key: string, value: any, receiver: any) {
                    console.error(`watcher get ${key} = ${value}`);
                    return Reflect.set(target, key, value, receiver);
                }
            };
        }
        return this.handler
    }

    public static getWatcher():Watcher{
        if (!Watcher.instance){
            Watcher.instance = new Watcher();
        }
        return Watcher.instance;
    }

}

export{
    Watcher
}