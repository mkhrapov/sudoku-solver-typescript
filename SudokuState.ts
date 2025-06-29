class SudokuState {
    private data;
    private numPropagateInvoked: number;
    private static Groups: number[][] = [
        [0, 1, 2, 9, 10, 11, 18, 19, 20],
        [27, 28, 29, 36, 37, 38, 45, 46, 47],
        [54, 55, 56, 63, 64, 65, 72, 73, 74],
        [3, 4, 5, 12, 13, 14, 21, 22, 23],
        [30, 31, 32, 39, 40, 41, 48, 49, 50],
        [57, 58, 59, 66, 67, 68, 75, 76, 77],
        [6, 7, 8, 15, 16, 17, 24, 25, 26],
        [33, 34, 35, 42, 43, 44, 51, 52, 53],
        [60, 61, 62, 69, 70, 71, 78, 79, 80]
    ];

    constructor() {
        this.data = new Array(81);
        let i: number;
        for(i = 0; i < 81; i++) {
            this.data[i] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
        this.numPropagateInvoked = 0;
    }

    options(index: number): number[] {
        return this.data[index];
    }

    sortedOrder(): number[][] {
        let res: number[][] = new Array();
        let i: number;
        for(i = 0; i < 81; i++) {
            if(!this.is_single(i)) {
                let pair: number[] = new Array(2);
                pair[0] = i;
                pair[1] = this.data[i].length;
                res.push(pair);
            }
        }
        res.sort(function(a, b) {
            return (a[1] - b[1]);
        });
        return res;
    }

    isEmpty(index: number): boolean {
        if(this.data[index].length == 0) {
            return true;
        }
        return false;
    }

    isLegal(index: number, value: number): boolean {
        let peer: number;
        for(peer of this.peers(index)) {
            if(this.is_single(peer) && this.contains(peer, value)) {
                return false;
            }
        }
        return true;
    }

    displayState(): void {
        let i: number;
        let x: number;
        let y: number;
        console.log("Begin display State:");
        
        for(y = 0; y < 9; y++) {
            let line_nu: number = y + 1;
            let s: string = "Line " + line_nu + ": ";
            for(x = 0; x < 9; x++) {
                i = 9*y + x;
                s += "[" + this.data[i].toString() + "], ";
            }
            console.log(s);
        }
        console.log("End display State");
    }

    isConsistent(): boolean {
        let i: number;
        for(i = 0; i < 81; i++) {
            if(this.isEmpty(i)) {
                return false;
            }

            if(this.is_single(i)) {
                let value: number = this.get(i);
                let peers: number[] = this.peers(i);
                console.assert(peers.length == 20, "Number of peers is not 20!");
                let peer: number;
                for(peer of peers) {
                    let options: number[] = this.options(peer);
                    let option: number;
                    for(option of options) {
                        if(option == value) {
                            let x1: number = i % 9;
                            let y1: number = Math.floor(i / 9);
                            let x2: number = peer % 9;
                            let y2: number = Math.floor(peer / 9);
                            if(DEBUG) {
                                console.log("Failed consistency index (" + x1 + ", " + y1 + ") value " + value + " peer (" + x2 + ", " + y2 + ")");
                            }
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    copy(): SudokuState {
        let next = new SudokuState();
        let i: number;
        for(i = 0; i < 81; i++) {
            next.data[i] = this.data[i].slice();
        }
        return next;
    }

    set_and_propagate(index: number, value: number): void {
        this.data[index] = [value];
        this.propagate(index);
    }

    get(index: number): number {
        if(this.is_single(index)) {
            return this.data[index][0];
        }
        else {
            return undefined;
        }
    }

    is_solved(): boolean {
        let i: number;
        for(i = 0; i < 81; i++) {
            if(!this.is_single(i)) {
                return false;
            }
        }
        return true;
    }

    is_single(index: number): boolean {
        return this.data[index].length == 1;
    }

    propagate(index: number): void {
        let x1: number = (index % 9) + 1;
        let y1: number = (Math.floor(index / 9)) + 1;
        let v1: number = this.get(index);
        if(DEBUG) {
            console.log("Propagate invoked with index (" + index + ", " + x1 + ", " + y1 + ") value " + v1);
            this.displayState();
        }
        this.numPropagateInvoked++;
        if(this.numPropagateInvoked > 200) {
            throw new Error("enough propagate!");
        }

        if(!this.is_single(index)) {
            return;
        }

        if(this.is_solved()) {
            return;
        }

        this.propagate_direct(index);
        this.propagate_indirect();
    }

    propagate_direct(index: number): void {
        let value: number = this.data[index][0];
        let peers_to_propagate: number[] = [];
        let shouldStop: boolean = false;

        let peer: number;
        for(peer of this.peers(index)) {
            if(!this.is_single(peer)) {
                if(this.contains(peer, value)) {
                    let prevLength: number = this.data[peer].length;
                    this.remove(peer, value);
                    let currLength: number = this.data[peer].length;

                    if(prevLength > 1 && currLength == 1) {
                        if(DEBUG) {
                            console.log("Add propagation peer (A) " + peer);
                        }
                        peers_to_propagate.push(peer);
                    }
                }
            }
        }

        if(DEBUG) {
            console.log("Propagation peer list ", peers_to_propagate);
        }

        for(peer of peers_to_propagate) {
            if(this.is_single(peer)) {
                this.propagate_direct(peer);
            }
        }
    }

    propagate_indirect(): void {
        let updates = [];
        let group: number[];
        for(group of SudokuState.Groups) {
            let option: number;
            for(option of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
                let counter: number = 0;
                let index: number = -1;
                let peer: number;
                for(peer of group) {
                    if(!this.is_single(peer)) {
                        if(this.contains(peer, option)) {
                            counter++;
                            index = peer;
                        }
                    }
                }
                if(counter == 1) {
                    updates.push([index, option]);
                    if(DEBUG) {
                        console.log("Add propagation peer (B) " + index + ", " + option);
                    }
                }
            }
        }

        if(updates.length > 0) {
            for(let u of updates) {
                let index = u[0];
                let value = u[1];
                this.data[index] = [value];
                this.propagate_direct(index);
            }
            this.propagate_indirect();
        }
    }

    remove(index: number, value: number): void {
        let i: number;
        let a: number[] = [];
        for(i of this.data[index]) {
            if(i != value) {
                a.push(i);
            }
        }
        this.data[index] = a;
    }

    contains(index: number, value: number): boolean {
        let i: number;
        for(i of this.data[index]) {
            if(i == value) {
                return true;
            }
        }
        return false;
    }

    peers(index: number): number[] {
        let x: number = index % 9;
        let y: number = Math.floor(index / 9);
        let peers: number[] = [];
        let i: number;

        // add vertical peers
        for(i = 0; i < 9; i++) {
            let peer: number = i*9 + x;
            if(peer != index) {
                peers.push(peer);
            }
        }

        // add horizontal peers
        for(i = 0; i < 9; i++) {
            let peer: number = y*9 + i;
            if(peer != index) {
                peers.push(peer);
            }
        }

        // add cell peers
        let cellmates: number[] = this.group(index);
        for(i of cellmates) {
            if(i != index) {
                if(!this.is_in(i, peers)) {
                    peers.push(i);
                }
            }
        }
        return peers;
    }

    is_in(i: number, a: number[]): boolean {
        let j: number;
        for(j of a) {
            if(i == j) {
                return true;
            }
        }
        return false;
    }

    group(index: number): number[] {
        let group: number[];
        let i: number;
        for(group of SudokuState.Groups) {
            for(i of group) {
                if(index == i) {
                    return group;
                }
            }
        }
    }
}