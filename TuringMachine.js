
// importing some variables and functions
import { runCode , displayLog, constructErrorLog} from "./index.js";

// references to the corresponding components to control the speed of the animation
const slider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
// speed values
let animationSpeed = parseInt(slider.value);
// this object will contain the states and the corresponding ways of handling each case as follows:
/* program = {
        reading:{
            [action, next_state]
            ... (this here takes at most 3 values, |, 0 or *)
        }... (this can have as many states as the suer defines)
    }  
*/
const program = {}

class TuringMachine {
    tape    // the tape of the machine
    current // index of the current cell
    initialState    // the initial state, entry point of the algorithm in some sense

    constructor(code, initialState = ""){
        // :))
        this.tape = ("0000000000000000000"+ code + "0000000000000000000").split("")
        this.current = "0000000000000000000".length // to point to the beginning of the arguments
        this.initialState = initialState
    }
    // this here executes the algorithm written
async execute(){
        // if there is nothing, we display a message
        if(Object.keys(program).length === 0){
            displayLog("No program to Execute!", true)
            return;
        }
        // we must define the initial state to start executing because we have this here
        let index = this.initialState
        // we wait for 800 ms before starting (just giving the user some time to see any changes at the beginning)
        await delay(800)
        // while we have a defined "STATE" we continue executing the loop
        // I think the second condition isn't necessary
        while(program[index] && Object.keys(program[index]).length !== 0 ){
            // this handles the case when the user stops the program manually
            if(!runCode[0]){
                displayLog("Code Stopped by the user")
                runCode[0] = true
                return
            }
            // we get the array where we have the action to take and the next state
            let action = program[index][this.tape[this.current]]
            // if the action is not defined, we throw a runtime error
            if(!action){
                displayLog(constructErrorLog(0,"State " + index + " does not handle reading symbol "+this.tape[this.current],"add a handler to the stated case and try again",1),true);
                return false
            }
            // here we define the machine behavior based on the action specified
            // we also add the necessary information
            // whenever we reach the end of the tape, we add more 0 cells to it to simulate
            // the infiniteness of the tape
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
            // delay, render the tape again, to center the selected cell, then continue
            await delay(animationSpeed);
            renderTape(this.tape, this.current);
        }
        return true
    }
    setInitialState(state){
        this.initialState = state
    }
}

// writing animation
function animateWrite(cellIndex, newSymbol) {
    // we get the list of all cells
    // then we select the current cell
    const cells = document.querySelectorAll('.tape-cell');
    const cell = cells[cellIndex];
    if (!cell) return;
    // if it is defined, we proceed to this section which is styles related
    cell.classList.add('writing');
    const old = cell.textContent;

    // quick visual feedback
    cell.textContent = newSymbol;
    setTimeout(() => {
        cell.classList.remove('writing');
    }, animationSpeed * 3);
}

function animateMovePointer(direction) {
    // here we animate the movement of the pointer, I think it doesn't work
  const pointer = document.querySelector('.pointer');
  const moveBy = 40;
  const currentLeft = parseFloat(getComputedStyle(pointer).left) || 0;

  pointer.style.transition = `left ${animationSpeed / 1000}s ease`; // convert ms→s
  pointer.style.left = direction === 'R'
    ? `${currentLeft + moveBy}px`
    : `${currentLeft - moveBy}px`;
}
function animateScrollTape(direction) {
    // when the selected cell is to the left or right, we scroll the tape to center it
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

// these are speed control event listeners
slider.addEventListener('input', () => {
  speedValue.textContent = `${slider.value}`;
});

slider.addEventListener('change', () => {
  animationSpeed = parseInt(slider.value);
});


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

// this delays + used to make our execute async
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export {TuringMachine, renderTape, program}