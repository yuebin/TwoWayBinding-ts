export default function Component(options:any) {
    console.error(options);
    return function(target:any,name:string,descriptor:any) {
        return target;
    }
}