const template = "Hello ${this.word}!";
const tpl = new Function("return `"+template+"`;");

console.log(tpl.call({
    word: "world"    
}));