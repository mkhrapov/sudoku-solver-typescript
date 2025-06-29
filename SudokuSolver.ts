/// <reference path="SudokuState.ts" />

class SudokuSolver {
    private init_position: number[];
    private numSearchInvoke: number;

    constructor(position: number[]) {
        this.init_position = new Array(81);
        let i: number;
        for(i = 0; i < this.init_position.length; i++) {
            this.init_position[i] = position[i];
        }
        this.numSearchInvoke = 0;
    }

    solve(): number[] {
        let state = new SudokuState();
        let i: number;

        for(i = 0; i < 81; i++) {
            if(this.init_position[i] != 0) {
                state.set_and_propagate(i, this.init_position[i]);
            }
        }

        
        if(state.is_solved()) {
            console.log("Solved without search");
        }
        else {
            console.log("Running search");
            state = this.search(state);
        }
        
        if(DEBUG) {
            state.displayState();
        }

        let solution: number[] = new Array(81);
        for(i = 0; i < solution.length; i++) {
            solution[i] = state.get(i);
        }
        if(this.numSearchInvoke > 0) {
            console.log("Search invoked " + this.numSearchInvoke + " times.");
        }
        console.log("Done.");
        return solution;
    }

    search(state: SudokuState): SudokuState {
        if(DEBUG) {
            console.log("Invoked search");
        }

        this.numSearchInvoke += 1;
        if(this.numSearchInvoke > 1000) {
            throw new Error("enough search!");
        }

        if(DEBUG) {
            state.displayState();
        }

        if(!state.isConsistent()) {
            throw new Error("State is not consistent");
        }
        let i: number;
        let j: number;
        let sortedIndex = state.sortedOrder();
        if(DEBUG) {
            console.log("Sorted state: ", sortedIndex);
        }
        for(j = 0; j < sortedIndex.length; j++) {
            i = sortedIndex[j][0];
            if(!state.is_single(i)) {
                if(DEBUG) {
                    let line: number;
                    let column: number;
                    line = Math.floor(i/9) + 1;
                    column = (i % 9) + 1;
                    console.log("Trying cell: line " + line + ", column " + column);
                }
                let j: number;
                for(j of state.options(i)) {
                    if(state.isLegal(i, j)) {
                        if(DEBUG) {
                            console.log("Trying option: " + j);
                        }
                        let next = state.copy();
                        next.set_and_propagate(i, j);
                        if(next.isConsistent()) {
                            if(DEBUG) {
                                console.log("State is consistent");
                            }
                            if(next.is_solved()) {
                                return next;
                            }
                            next = this.search(next);
                            if(next.is_solved()) {
                                return next;
                            }
                        }
                        else {
                            if(DEBUG) {
                                console.log("State is NOT consistent");
                                next.displayState();
                            }
                        }
                    }
                }
                // tried all options? none work
                // should probably get out
                return state;
            }
        }
        return state;
    }
}
