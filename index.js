// importing necessary classes and functions
import SyntaxAnalysis from "./SyntaxAnalysis.js";
import {TuringMachine, renderTape} from "./TuringMachine.js";

// references to html elements, we will need later
const codeBtn = document.getElementById("run-code-btn");
const runBtn = document.getElementById("run-btn");
const ide = document.getElementById("ide-area");
const input = document.getElementById("tm-input");
const logArea = document.getElementById("log-area");
const stopBtn = document.getElementById("stop-code-btn")

export const tapeSymbols = new Set(["0","|","*"]);
export const runCode = [true]



//handling manual stop through the halt button
stopBtn.addEventListener('click', (e) => {
    if(runCode === true)
        runCode[0] = false
})



//-----------------------------------------------------------------------
// ---- FROM HERE, YOU CAN FIND SOME FRONTEND RELATED CODE!!


let tm = null, analyser = null
// we run this when we click on the put args button
codeBtn.addEventListener('click' ,async (e) => {
    // ensure the TM is defined
    if(tm === null){
        displayLog(constructErrorLog(0,"Tape not initialized!","Initialize the tape by inserting arguments first",1),true)
        return
    }
    // initialize an analyser to analyze the code
    const analyser = new SyntaxAnalysis(ide.value);
    // try to preprocess and catch any errors, if any error occurs, we quit with an error log
    try{
        analyser.preprocess()
    } catch(err){
        displayLog(err.message || err,true)
        return
    }
    // we analyze syntax and fill the program object
    let res = analyser.processSyntax();
    // leave with an error log if it returns false
    // the log is done inside the function
    if(!res)
        return
    // now we set the initial set of the machine 
    tm.setInitialState(analyser.getInitialState()) 
    // execute the program with animations
    res = await tm.execute()
    // log successful execution, or just quit (errors are logged inside the program)
    if(res){
        displayLog("Program executed successfully!")
    } else{
        return
    }
})

// this runs when we want to run our algorithm
runBtn.addEventListener('click', (e) => {
    // clear any displayed message
    logArea.innerHTML = ""
    //verify that the args entered are valid
    let valid = !input.value.split("").some(v => !tapeSymbols.has(v));
    if(!valid){
        displayLog(constructErrorLog(0,"Attempt to insert an invalid symbol in the tape!","You can only insert |, 0 and *",1),true)
        return
    }
    // initialize our turing machine object and tape
    tm = new TuringMachine(input.value)
    renderTape(tm.tape, tm.current)
})





//------------------------------------------------------------
// --- SPEED CONTROLLER






export function constructErrorLog(line, content, fix, type = 0){
    if(type === 0)
        return "Error in line " + line + "\n" + content + "\n" + fix + "\n"
    else
        return "Runtime Error " + "\n" + content + "\n" + fix + "\n"
}


export function displayLog(message, isError = false) {
    if (!logArea) {
        console.warn("No log-area div found!");
        return;
    }

    const msgDiv = document.createElement("div");
    msgDiv.textContent = message;
    msgDiv.classList.add("log-message");
    msgDiv.classList.add(isError ? "error" : "success");

    logArea.appendChild(msgDiv);

    // Trigger fade-in animation
    requestAnimationFrame(() => {
        msgDiv.style.opacity = "1";
    });

    // Scroll to the latest message
    logArea.scrollTop = logArea.scrollHeight;
}

