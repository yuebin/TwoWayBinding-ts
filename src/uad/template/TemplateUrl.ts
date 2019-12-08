/**
 * TemplateUrl 为用于处理 template为URL的模板功能
 */
class TemplateUrl {

    /**
     * 通过URL加载对应的模块
     * @param url 
     */
    public static loadTemplate(url: string): Promise<any>{
        return new Promise((resovle,reject)=>{
            let request = new Request(url);
            return window.fetch(request).then((response) => {
                response.text().then(function (text) {
                    resovle(text);
                });
            });   
        });
    }
}

export {
    TemplateUrl
};