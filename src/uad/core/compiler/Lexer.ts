let OPERATORS = Object.create(null);
const operstr = '+ - * / % === !== == != < > <= >= && || ! = |';
operstr.split(' ').forEach(function (operator: string) { OPERATORS[operator] = true; });
const ESCAPE:any = { 'n': '\n', 'f': '\f', 'r': '\r', 't': '\t', 'v': '\v', '\'': '\'', '"': '"' };

let HTML_TAGS = Object.create(null);
const htmlTags = 'div,span,input,p,ul,li,textarea,select,br,hr';
htmlTags.split(',').forEach(function (tag: string) { HTML_TAGS[tag] = true; });

class Lexer{

    private text:string;
    private index:number;
    private tokens:Array<any>;
    private options: any;

    constructor(options?:any){
        if (options){
            this.options = options;
        }else{
            this.options = {};
        }
        
    }

    public lex(text:string,index?:number):Array<any> {
        this.text = text;
        this.index = 0;
        if (this.isDefined(index)){
            this.index = index;
        }
        this.tokens = [];
        let openTag = false;
        let attrTag = false;
        let quoMarks = false;
        let startQuoMarks = null

        while (this.index < this.text.length) {
            let ch = this.text.charAt(this.index);
            // debugger;
            if (ch === '"' || ch === '\'') {
                if (!quoMarks){
                    quoMarks = true;
                    startQuoMarks = ch;
                    this.tokens.push({
                        index: this.index,
                        text: ch,
                        quo: true,
                        type: 'quo',
                        name: 'start'
                    });
                }
                
                this.readString(ch);

                if (attrTag && quoMarks && startQuoMarks === ch) {
                    quoMarks = false
                    this.tokens.push({
                        index: this.index,
                        text: ch,
                        quo: true,
                        type: 'quo',
                        name: 'end'
                    });
                }
            } else if (this.isNumber(ch) || ch === '.' && this.isNumber(this.peek())) {
                this.readNumber();
            } else if (this.is(ch,'u') && this.peek() === "-") {
                this.readDirective(ch);
            } else if (this.isIdentifierStart(this.peekMultichar())) {
                this.readIdent();
            } else if (this.is(ch, '<') && this.peek() === "/"){
                this.peekHtmlEndTag();
                openTag = false;
                attrTag = false;
            } else if (this.is(ch, '<') && this.isHtmlTag(ch)){ //如果是html标签
                this.index++;
                openTag = true;
                attrTag = true;
                this.readHtmlTag(ch);
            } else if (openTag && this.is(ch, '>')){
                this.index ++;
                openTag = false;
                attrTag = false;
            } else if (openTag && this.is(ch, '/') && this.isTagClose(ch)){
                this.index +=2;
                openTag = false;
                attrTag = false;
            } else if (this.is(ch, '@') && this.isEvent()){
                this.readEvent();
            } else if (this.is(ch, '(){}[].,;:?')) {
                this.tokens.push({ index: this.index, text: ch });
                this.index++;
            } else if (this.isWhitespace(ch)) {
                this.index++;
            } else {
                let ch2 = ch + this.peek();
                let ch3 = ch2 + this.peek(2);
                let op1 = OPERATORS[ch];
                let op2 = OPERATORS[ch2];
                let op3 = OPERATORS[ch3];
                if (op1 || op2 || op3) {
                    let token = op3 ? ch3 : (op2 ? ch2 : ch);
                    this.tokens.push({ index: this.index, text: token, operator: true });
                    this.index += token.length;
                } else {
                    this.throwError('Unexpected next character ', this.index, this.index + 1);
                }
            }
        }
        return this.tokens;
    }

    peekHtmlEndTag():void{
        let start = this.index;
        while(this.index < this.text.length){
            let ch = this.text.charAt(this.index);
            if(ch === ">"){
                this.index++;
                break;
            }else{
                this.index++;
            }
        }
    }

    isTagClose(ch:string):boolean{
        if (ch === "/" && this.peek() === ">"){
            return true;
        }else{
            return false;
        }
    }

    isEvent(ch?:string):boolean{
        let start:number = this.index;
        let tempIndex:number = this.index + 1;
        while (tempIndex < this.text.length) {
            let ch = this.text.charAt(tempIndex);
            if (!this.isIdentifierContinue(ch)) {
                break;
            }
            tempIndex += ch.length;
        }

        if(this.text.slice(start, tempIndex).length > 1){
            return true;
        }else{
            return false;
        }
    }

    readEvent():void{
        let start = this.index;
        this.index += this.peekMultichar().length;
        while (this.index < this.text.length) {
            let ch = this.peekMultichar();
            if (!this.isIdentifierContinue(ch)) {
                break;
            }
            this.index += ch.length;
        }
        this.tokens.push({
            index: start,
            text: this.text.slice(start, this.index),
            event: true,
            type: 'event',
            name: this.text.slice(start + 1, this.index)
        });
    }

    readDirective(ch:string):void{
        let start = this.index;
        this.index += this.peekMultichar().length;
        while (this.index < this.text.length) {
            let ch = this.peekMultichar();
            if (!this.isIdentifierContinue(ch)) {
                break;
            }
            this.index += ch.length;
        }
        this.tokens.push({
            index: start,
            text: this.text.slice(start, this.index),
            name: this.text.slice(start+2,this.index),
            directive: true
        });

    }

    isHtmlTag(ch:string):boolean{
        let start:number,tempIndex:number; 
        start = tempIndex = this.index +1;
        
        
        while (tempIndex < this.text.length) {
            let ch = this.text.charAt(tempIndex);
            if (!this.isIdentifierContinue(ch)) {
                break;
            }
            tempIndex += ch.length;
        }
        let tag = this.text.slice(start, tempIndex);
        return HTML_TAGS[tag];
    }

    readHtmlTag(ch?:string):void{
        let start = this.index;
        this.index += this.peekMultichar().length;
        while (this.index < this.text.length) {
            let ch = this.peekMultichar();
            if (!this.isIdentifierContinue(ch)) {
                break;
            }
            this.index += ch.length;
        }
        this.tokens.push({
            index: start,
            text: this.text.slice(start, this.index),
            tag:true,
            type:'tag',
            name: this.text.slice(start, this.index)
        });
    }

    is(ch:string, chars:string):boolean {
        return chars.indexOf(ch) !== -1;
    };

    peek(i?:number):any{
        var num = i || 1;
        return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
    }

    isNumber(ch:string):boolean{
        return ('0' <= ch && ch <= '9') && typeof ch === 'string';
    }

    isWhitespace(ch: string) {
        // IE treats non-breaking space as \u00A0
        return (ch === ' ' || ch === '\r' || ch === '\t' ||
            ch === '\n' || ch === '\v' || ch === '\u00A0');
    }

    isIdentifierStart(ch:string):boolean|string {
        return this.options.isIdentifierStart ?
            this.options.isIdentifierStart(ch, this.codePointAt(ch)) :
            this.isValidIdentifierStart(ch);
    }


    isValidIdentifierStart(ch: string,cp?:string):boolean {
        return ('a' <= ch && ch <= 'z' ||
            'A' <= ch && ch <= 'Z' ||
            '_' === ch || ch === '$' || ch === '-');
    }


    isIdentifierContinue(ch: string):boolean {
        return this.options.isIdentifierContinue ?
            this.options.isIdentifierContinue(ch, this.codePointAt(ch)) :
            this.isValidIdentifierContinue(ch);
    }

    isValidIdentifierContinue(ch: string, cp?: string) {
        return this.isValidIdentifierStart(ch, cp) || this.isNumber(ch);
    }


    codePointAt(ch: string):boolean|number {
        if (ch.length === 1) return ch.charCodeAt(0);
        return (ch.charCodeAt(0) << 10) + ch.charCodeAt(1) - 0x35FDC00;
    }

    peekMultichar():string{
        let ch = this.text.charAt(this.index);
        let peek = this.peek();
        if (!peek) {
            return ch;
        }
        let cp1 = ch.charCodeAt(0);
        let cp2 = (peek as string).charCodeAt(0);
        if (cp1 >= 0xD800 && cp1 <= 0xDBFF && cp2 >= 0xDC00 && cp2 <= 0xDFFF) {
            return ch + peek;
        }
        return ch;
    }

    isExpOperator(ch: string):string|boolean {
        return (ch === '-' || ch === '+' || this.isNumber(ch));
    }

    throwError(error: string, start?:number, end?:number) {
        end = end || this.index;
        var colStr = (this.isDefined(start)
            ? 's ' + start + '-' + this.index + ' [' + this.text.substring(start, end) + ']'
            : ' ' + end);

        throw new Error(`'Lexer Error: ${error} at column${colStr} in expression [${end}].'`);

    }


    lowercase(str:string):string{
        return (str + "").toLowerCase();
    }

    readNumber() {
        var number = '';
        var start = this.index;
        while (this.index < this.text.length) {
            var ch = this.lowercase(this.text.charAt(this.index));
            if (ch === '.' || this.isNumber(ch)) {
                number += ch;
            } else {
                var peekCh = this.peek();
                if (ch === 'e' && this.isExpOperator(peekCh)) {
                    number += ch;
                } else if (this.isExpOperator(ch) &&
                    peekCh && this.isNumber(peekCh) &&
                    number.charAt(number.length - 1) === 'e') {
                    number += ch;
                } else if (this.isExpOperator(ch) &&
                    (!peekCh || !this.isNumber(peekCh)) &&
                    number.charAt(number.length - 1) === 'e') {
                    this.throwError('Invalid exponent');
                } else {
                    break;
                }
            }
            this.index++;
        }
        this.tokens.push({
            index: start,
            text: number,
            constant: true,
            value: Number(number)
        });
    }

    readIdent() {
        let start = this.index;
        this.index += this.peekMultichar().length;
        while (this.index < this.text.length) {
            let ch = this.peekMultichar();
            if (!this.isIdentifierContinue(ch)) {
                break;
            }
            this.index += ch.length;
        }
        this.tokens.push({
            index: start,
            text: this.text.slice(start, this.index),
            identifier: true
        });
    }

    readString(quote: string) {
        let start = this.index;
        this.index++;
        let string = '';
        let rawString = quote;
        let escape = false;
        while (this.index < this.text.length) {
            let ch = this.text.charAt(this.index);
            rawString += ch;
            if (escape) {
                if (ch === 'u') {
                    let hex = this.text.substring(this.index + 1, this.index + 5);
                    if (!hex.match(/[\da-f]{4}/i)) {
                        this.throwError('Invalid unicode escape [\\u' + hex + ']');
                    }
                    this.index += 4;
                    string += String.fromCharCode(parseInt(hex, 16));
                } else {
                    var rep = ESCAPE[ch];
                    string = string + (rep || ch);
                }
                escape = false;
            } else if (ch === '\\') {
                escape = true;
            } else if (ch === quote) {
                this.index++;
                this.tokens.push({
                    index: start,
                    text: rawString,
                    constant: true,
                    value: string
                });
                return;
            } else {
                string += ch;
            }
            this.index++;
        }
        this.throwError('Unterminated quote', start);
    }

    isDefined(value:any):boolean { 
        return typeof value !== 'undefined'; 
    }
}


export {
    Lexer
}