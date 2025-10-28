// here we define the set of available syntax, more specifically the allowed symbols to read/write and movement keywords
const rules = new Set(["0","|","*", "L","R"]);
// some imports, program 
import { program} from "./TuringMachine.js";
import {constructErrorLog, displayLog , tapeSymbols} from "./index.js"
class SyntaxAnalysis{
    instructions    // list of instructions
    init    // initial state
    constructor(instructions){
        // here, we assign the plain string!
        this.instructions = instructions
        this.init = ""
    }
    // preprocessing unit
    preprocess(){
        // here we get a plain string, we break it down, remove comments!
        let temp = this.instructions.split("\n");
        temp = temp.map(line => {
            let out = line.split("//"); // this removes comments
            // if it breaks the line into more than 3 elements, we throw an error
            if(out.length > 2){
                throw new Error("Syntax error: too many comment delimiters on one line");
            }
            return out.length > 0 ? out[0].trim():""
        })
        // when done, we assign the array of instructions found to this variable
        this.instructions = temp
    }
    // here we do some simple and straight forward syntax analysis 
    processSyntax(){
        // removing any empty lines
        this.instructions = this.instructions.filter(inst => inst !== "")
        // now we analyze the syntax of each line 
        this.instructions.forEach((inst, i) => {
            // for each instruction, we break it down into tokens and verify two things:
            let tokens = inst.split(",").map(t => t.trim());
            // 1 - WE HAVE EXACTLY 4 ELEMENTS
            if(tokens.length !== 4){
                displayLog(constructErrorLog(i+1,"instruction format mismatched! "+ tokens.length + " instead of 4!",
                     "PLease respect instructions'' structure <cur_state>,<cur_read>,<action>,<next_state>\nOr refer to the documentation. "), true)
                     return false
            }
            // 4 - THE TWO TOKENS IN THE MIDDLE ARE IN THE SET OF RULES
            else if(!rules.has(tokens[1]) || !rules.has(tokens[2])){
                let errSymbol = !rules.has(tokens[1]) ? tokens[1]:tokens[2]
                displayLog(constructErrorLog(i+1,"Undefined Symbol " + errSymbol +" 0,|,* are the only allowed symbols, and R,L are the only actions"),true)
                return false
            // 5 - IF THE READ ELEMENT IS R OR L (ACTION NOT ALLOWED IN <READ>)
            } else if(tokens[1] === "R" || tokens[1] === "L"){
                displayLog(constructErrorLog(i+1,"Symbol " + errSymbol +" is not allowed here, 0,|,* are the only allowed symbols"),true)
                return false         
            }
            // here, we add the initial state at the beginning
            if(i === 0)
                this.init = tokens[0]
            // when an instruction is verified, we add it to a special data structure:
            if(!program[tokens[0]])
                program[tokens[0]] = {}
            program[tokens[0]][tokens[1]] = [tokens[2], tokens[3]]            
        })
        return true
    }

    getInitialState(){
        return this.init
    }
}

export default SyntaxAnalysis