/// <reference path="SudokuSolver.ts" /> 

class SudokuGameUI {
    private static BoxSize: number = 35; // px, 9 boxes per side in sudoku
    private selected: number;
    private contents: number[] = new Array(81);
    private solution: number[];
    private allowPlaying: boolean;

    constructor(private context, cell_size_px : number) {
        SudokuGameUI.BoxSize = cell_size_px;
        this.selected = -1;
        for(let i: number = 0; i < 81; i++) {
            this.contents[i] = 0;
        }
        this.allowPlaying = true;
    }

    paint() {
        //white out
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, 9*SudokuGameUI.BoxSize, 9*SudokuGameUI.BoxSize);

        this.paint_selected();

        this.draw_light_line(1, 0, 1, 9);
        this.draw_light_line(2, 0, 2, 9);
        this.draw_light_line(4, 0, 4, 9);
        this.draw_light_line(5, 0, 5, 9);
        this.draw_light_line(7, 0, 7, 9);
        this.draw_light_line(8, 0, 8, 9);

        this.draw_light_line(0, 1, 9, 1);
        this.draw_light_line(0, 2, 9, 2);
        this.draw_light_line(0, 4, 9, 4);
        this.draw_light_line(0, 5, 9, 5);
        this.draw_light_line(0, 7, 9, 7);
        this.draw_light_line(0, 8, 9, 8);

        this.draw_borders();
        this.draw_heavy_line(0, 3, 9, 3);
        this.draw_heavy_line(0, 6, 9, 6);
        this.draw_heavy_line(3, 0, 3, 9);
        this.draw_heavy_line(6, 0, 6, 9);

        this.paint_contents();
        this.paint_solution();
    }

    draw_borders() {
        var shift: number = 2;

        var x1: number = 0;
        var x2: number = SudokuGameUI.BoxSize*9;
        var y1: number = x1;
        var y2: number = x2;

        this.context.lineWidth = 3.0;
        this.context.fillStyle = "black";
        this.context.strokeStyle = "black";

        this.context.beginPath();
        this.context.moveTo(x1, y1+shift);
        this.context.lineTo(x2-shift, y1+shift);
        this.context.lineTo(x2-shift, y2-shift);
        this.context.lineTo(x1+shift, y2-shift);
        this.context.lineTo(x1+shift, y1);
        this.context.stroke();
    }

    draw_heavy_line(x1: number, y1: number, x2: number, y2: number) {
        x1 *= SudokuGameUI.BoxSize;
        y1 *= SudokuGameUI.BoxSize;
        x2 *= SudokuGameUI.BoxSize;
        y2 *= SudokuGameUI.BoxSize;

        this.context.lineWidth = 3.0;
        this.context.fillStyle = "black";
        this.context.strokeStyle = "black";

        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    draw_light_line(x1: number, y1: number, x2: number, y2: number) {
        x1 *= SudokuGameUI.BoxSize;
        y1 *= SudokuGameUI.BoxSize;
        x2 *= SudokuGameUI.BoxSize;
        y2 *= SudokuGameUI.BoxSize;

        this.context.lineWidth = 1.0;
        this.context.fillStyle = "#dcdcdc";
        this.context.strokeStyle = "#dcdcdc";

        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    paint_selected() {
        if(this.selected < 0) {
            return;
        }

        let x: number = this.selected % 9;
        let y: number = Math.floor(this.selected / 9);

        this.context.fillStyle = "#b5fcb5";
        this.context.fillRect(
            x*SudokuGameUI.BoxSize,
            y*SudokuGameUI.BoxSize,
            SudokuGameUI.BoxSize,
            SudokuGameUI.BoxSize
        );
    }

    clear_all() {
        this.selected = -1;
        this.solution = undefined;
        for(let i: number = 0; i < 81; i++) {
            this.contents[i] = 0;
        }
        this.paint();
        this.allowPlaying = true;
    }

    set_selected(x: number, y: number) {
        x = Math.floor(x/SudokuGameUI.BoxSize);
        y = Math.floor(y/SudokuGameUI.BoxSize);
        if(x < 0) { x = 0; }
        if(y < 0) { y = 0; }
        if(x > 8) { x = 8; }
        if(y > 8) { y = 8; }

        this.selected = y*9 + x;
        this.paint();
    }

    input(i: number): boolean {
        if(this.selected < 0) {
            return true;
        }

        if(this.validate(i)) {
            this.contents[this.selected] = i;
            this.selected = -1;
            this.paint();
            return true;
        }
        return false;
    }

    paint_contents() {
        for(let i: number = 0; i < 81; i++) {
            if(this.contents[i] != 0) {
                this.print_number(this.contents[i], i, "black");
            }
        }
    }

    paint_solution() {
        if(this.solution === undefined) {
            return;
        }

        for(let i: number = 0; i < 81; i++) {
            if(this.contents[i] == 0) {
                if(this.solution[i]) {
                    this.print_number(this.solution[i], i, "red");
                }
            }
        }
    }

    print_number(num: number, pos: number, color: string) {
        let x: number = pos % 9;
        let y: number = Math.floor(pos / 9);

        x *= SudokuGameUI.BoxSize;
        y *= SudokuGameUI.BoxSize;

        x += Math.floor(SudokuGameUI.BoxSize*0.33);
        y += Math.floor(SudokuGameUI.BoxSize*0.75);

        this.context.font = "30px sans-serif";
        this.context.fillStyle = color;
        this.context.fillText(String(num), x, y);
    }

    validate(new_value: number): boolean {
        if(new_value == 0) {
            return true;
        }

        if(new_value == this.contents[this.selected]) {
            return true;
        }

        let i: number;

        for(i of this.vertical_group()) {
            if(new_value == this.contents[i]) {
                return false;
            }
        }

        for(i of this.horizontal_group()) {
            if(new_value == this.contents[i]) {
                return false;
            }
        }

        for(i of this.square_group()) {
            if(new_value == this.contents[i]) {
                return false;
            }
        }

        return true;
    }

    vertical_group(): number[] {
        let result: number[] = [];
        let x: number = this.selected % 9;
        let y: number;
        for(y of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
            result.push(y*9 + x);
        }
        return result;
    }

    horizontal_group(): number[] {
        let result: number[] = [];
        let y: number = Math.floor(this.selected / 9);
        let x: number;
        for(x of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
            result.push(y*9 + x);
        }
        return result;
    }

    square_group(): number[] {
        let groups: number[][] = [
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
        let group: number[];
        let i: number;
        for(group of groups) {
            for(i of group) {
                if(this.selected == i) {
                    return group;
                }
            }
        }
    }

    neededNumberOfDigits(): boolean {
        let counter: number = 0;
        for(let i: number = 0; i < 81; i++) {
            if(this.contents[i] > 0) {
                counter++;
            }
        }
        return counter >= 17;
    }

    solve(): boolean {
        if(this.allowPlaying) {
            if(!this.neededNumberOfDigits()) {
                return false;
            }

            this.allowPlaying = false;
            let solver = new SudokuSolver(this.contents);
            this.solution = solver.solve();
            this.paint();
        }
        return true;
    }

    setPosition(sudokuStartPosition: string): void {
        this.clear_all();
        let i: number;
        for(i = 0; i < 81; i++) {
            let c = parseInt(sudokuStartPosition.charAt(i));
            if(isNaN(c)) {
                this.contents[i] = 0;
            }
            else {
                this.contents[i] = c;
            }
        }
        
        this.paint();
    }
}