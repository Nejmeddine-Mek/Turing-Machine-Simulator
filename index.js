const slider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
let animationSpeed = parseInt(slider.value);
const codeBtn = document.getElementById("run-code-btn");
const runBtn = document.getElementById("run-btn");
const ide = document.getElementById("ide-area");
const input = document.getElementById("tm-input");
const logArea = document.getElementById("log-area");
const rules = new Set(["0","|","*", "L","R"]);
const tapeSymbols = new Set(["0","|","*"]);
const program = {}

class TuringMachine {
    tape
    current
    initialState

    constructor(code, initialState = ""){
        this.tape = ("0000000000000000000"+ code + "0000000000000000000").split("")
        this.current = "0000000000000000000".length
        this.initialState = initialState
    }

async execute(){
        
        if(Object.keys(program).length === 0){
            console.log("no program!!!")
            return;
        }
        let index = this.initialState
        await delay(800)
        console.log(program)
        while(program[index] && Object.keys(program[index]).length !== 0 ){
            let action = program[index][this.tape[this.current]]
            console.log(action)
            if(!action){
                displayLog(constructErrorLog(0,"State " + index + " does not handle reading symbol "+this.tape[this.current],"add a handler to the stated case and try again",1),true);
                return false
            }
            switch(action[0]){
                case "|":
                    this.tape[this.current] = "|"
                    animateWrite(this.current,action[0]);
                    break;
                case "0":
                    this.tape[this.current] = "0"
                    animateWrite(this.current,action[0]);
                    break;
                case "R":
                    this.current += 1
                    if(this.current === this.tape.length){
                        this.tape = [...this.tape, ...'000000000000'];
                    }
                    animateMovePointer("R");
                    animateScrollTape("R");
                    break
                case "L":
                    this.current -= 1
                    if(this.current === -1){
                        this.tape = [...'000000000000',...this.tape];
                        this.current += 12
                    }
                    animateMovePointer("L");
                    animateScrollTape("L");
                    break;
            }
            index = action[1]
            console.log(action[1])
            await delay(animationSpeed);
            renderTape(this.tape, this.current);
        }
        return true
    }

}

class SyntaxAnalysis{
    instructions
    init
    constructor(instructions){
        // here, we assign the plain string!
        this.instructions = instructions
        this.init = ""
    }
    preprocess(){
        // here we get a plain string, we break it down, remove comments!
        let temp = this.instructions.split("\n");
        temp = temp.map(line => {
            let out = line.split("//");
            if(out.length > 2){
                throw new Error("Syntax error: too many comment delimiters on one line");
            }
            return out.length > 0 ? out[0].trim():""
        })
        this.instructions = temp
    }
    processSyntax(){
        // removing any empty lines
        this.instructions = this.instructions.filter(inst => inst !== "")

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
                displayLog(constructErrorLog(i+1,"Undefined Symbol " + errSymbol +"0,|,* are the only allowed symbols"),true)
                return false
            }
            if(i === 0)
                this.init = tokens[0]
            // when an instruction is verified, we add it to a special data structure:
            if(!program[tokens[0]])
                program[tokens[0]] = {}
            program[tokens[0]][tokens[1]] = [tokens[2], tokens[3]]

            console.log("instruction: " + tokens);
            
        })
        return true
    }
}

//const analyser = new SyntaxAnalysis(["q0,0,|,q1","q1,|,R,q2","q2,0,|,q3","q3,|,R,q4"])
//-----------------------------------------------------------------------------------------
//----- HERE WE HAVE ANIMATIONS



//-----------------------------------------------------------------------
// ---- FROM HERE, YOU CAN FIND SOME FRONTEND RELATED CODE!!


let tm = null, analyser = null

codeBtn.addEventListener('click' ,async (e) => {
    if(tm === null){
        displayLog(constructErrorLog(0,"Tape not initialized!","Initialize the tape by inserting arguments first",1),true)
        return
    }
    const analyser = new SyntaxAnalysis(ide.value);
    try{
        analyser.preprocess()
    } catch(err){
        displayLog(err.message || err,true)
        return
    }
    let res = analyser.processSyntax();
    if(!res){
        console.log("err")
        return
    }
    tm.initialState = analyser.init
    res = await tm.execute()
    if(res){
        displayLog("Program executed successfully!")
    } else{
        return
    }
})

runBtn.addEventListener('click', (e) => {
    logArea.innerHTML = ""
    
    let valid = !input.value.split("").some(v => !tapeSymbols.has(v));
    if(!valid){
        displayLog(constructErrorLog(0,"Attempt to insert an invalid symbol in the tape!","You can only insert |, 0 and *",1),true)
        return
    }
    tm = new TuringMachine(input.value)
    renderTape(tm.tape, tm.current)
})




function renderTape(tapeArray, currentIndex) {
    const tapeView = document.getElementById("tape-view");
    const cells = tapeView.querySelectorAll('.tape-cell');

    // If cells already exist, just update active class and value
    if (cells.length === tapeArray.length) {
        cells.forEach((cell, i) => {
            cell.textContent = tapeArray[i];
            if (i === currentIndex) cell.classList.add('active');
            else cell.classList.remove('active');
        });
    } else {
        // Otherwise, build the tape
        tapeView.innerHTML = "";
        tapeArray.forEach((cellContent, i) => {
            const div = document.createElement("div");
            div.classList.add("tape-cell");
            div.textContent = cellContent;
            if (i === currentIndex) div.classList.add("active");
            tapeView.appendChild(div);
        });
    }

    // Scroll the tape so the active cell is under the pointer
    const activeCell = tapeView.querySelector(".tape-cell.active");
    if (activeCell) {
        const offset = activeCell.offsetLeft - tapeView.offsetWidth / 2 + activeCell.offsetWidth / 2;
        tapeView.scrollTo({
            left: offset,
            behavior: "smooth"
        });
    }
}

//------------------------------------------------------------
// --- SPEED CONTROLLER


slider.addEventListener('input', () => {
  speedValue.textContent = `${slider.value}`;
});

slider.addEventListener('change', () => {
  animationSpeed = parseInt(slider.value);
});


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function animateWrite(cellIndex, newSymbol) {
    const cells = document.querySelectorAll('.tape-cell');
    const cell = cells[cellIndex];
    if (!cell) return;

    cell.classList.add('writing');
    const old = cell.textContent;

    // quick visual feedback
    cell.textContent = newSymbol;
    setTimeout(() => {
        cell.classList.remove('writing');
    }, animationSpeed * 3);
}

function animateMovePointer(direction) {
  const pointer = document.querySelector('.pointer');
  const moveBy = 40;
  const currentLeft = parseFloat(getComputedStyle(pointer).left) || 0;

  pointer.style.transition = `left ${animationSpeed / 1000}s ease`; // convert ms→s
  pointer.style.left = direction === 'R'
    ? `${currentLeft + moveBy}px`
    : `${currentLeft - moveBy}px`;
}
function animateScrollTape(direction) {
  const tapeView = document.querySelector('.tape-view');
  const scrollBy = 44; // width of one tape cell

  // compute scroll behavior based on speed
  const behavior = animationSpeed <= 200 ? 'auto' : 'smooth';

  tapeView.scrollBy({
    left: direction === 'R' ? scrollBy : -scrollBy,
    behavior
  });

  // Optional subtle highlight pulse to indicate movement
  tapeView.style.transition = `transform ${animationSpeed / 1000}s ease`;
  tapeView.style.transform = 'scale(1.02)';
  setTimeout(() => {
    tapeView.style.transform = 'scale(1)';
  }, animationSpeed / 4);
}

function constructErrorLog(line, content, fix, type = 0){
    if(type === 0)
        return "Error in line " + line + "\n" + content + "\n" + fix + "\n"
    else
        return "Runtime Error " + "\n" + content + "\n" + fix + "\n"
}


function displayLog(message, isError = false) {
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