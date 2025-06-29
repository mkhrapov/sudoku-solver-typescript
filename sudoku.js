function digit_error() {
    return "This digit is not allowed here.";
}
function display_error(msg, alwaysUseDesktop) {
    var target;
    if (has_keyboard()) {
        target = "error_message_desktop";
    }
    else {
        target = "error_message_mobile";
    }
    if (alwaysUseDesktop) {
        target = "error_message_desktop";
    }
    var p_error = document.getElementById(target);
    p_error.innerHTML = msg;
    setTimeout(function () {
        p_error.innerHTML = "";
    }, 3000);
}
function user_probably_has_a_keyboard() {
    var have_keyboard_check_box = document.getElementById("have_keyboard");
    have_keyboard_check_box.checked = true;
}
function has_keyboard() {
    var have_keyboard_check_box = document.getElementById("have_keyboard");
    return have_keyboard_check_box.checked;
}
function remove_modal() {
    var modal_div = document.getElementById("modal");
    modal_div.style.display = "none";
}
var SudokuState = (function () {
    function SudokuState() {
        this.data = new Array(81);
        var i;
        for (i = 0; i < 81; i++) {
            this.data[i] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
        this.numPropagateInvoked = 0;
    }
    SudokuState.prototype.options = function (index) {
        return this.data[index];
    };
    SudokuState.prototype.sortedOrder = function () {
        var res = new Array();
        var i;
        for (i = 0; i < 81; i++) {
            if (!this.is_single(i)) {
                var pair = new Array(2);
                pair[0] = i;
                pair[1] = this.data[i].length;
                res.push(pair);
            }
        }
        res.sort(function (a, b) {
            return (a[1] - b[1]);
        });
        return res;
    };
    SudokuState.prototype.isEmpty = function (index) {
        if (this.data[index].length == 0) {
            return true;
        }
        return false;
    };
    SudokuState.prototype.isLegal = function (index, value) {
        var peer;
        for (var _i = 0, _a = this.peers(index); _i < _a.length; _i++) {
            peer = _a[_i];
            if (this.is_single(peer) && this.contains(peer, value)) {
                return false;
            }
        }
        return true;
    };
    SudokuState.prototype.displayState = function () {
        var i;
        var x;
        var y;
        console.log("Begin display State:");
        for (y = 0; y < 9; y++) {
            var line_nu = y + 1;
            var s = "Line " + line_nu + ": ";
            for (x = 0; x < 9; x++) {
                i = 9 * y + x;
                s += "[" + this.data[i].toString() + "], ";
            }
            console.log(s);
        }
        console.log("End display State");
    };
    SudokuState.prototype.isConsistent = function () {
        var i;
        for (i = 0; i < 81; i++) {
            if (this.isEmpty(i)) {
                return false;
            }
            if (this.is_single(i)) {
                var value = this.get(i);
                var peers = this.peers(i);
                console.assert(peers.length == 20, "Number of peers is not 20!");
                var peer = void 0;
                for (var _i = 0, peers_1 = peers; _i < peers_1.length; _i++) {
                    peer = peers_1[_i];
                    var options = this.options(peer);
                    var option = void 0;
                    for (var _a = 0, options_1 = options; _a < options_1.length; _a++) {
                        option = options_1[_a];
                        if (option == value) {
                            var x1 = i % 9;
                            var y1 = Math.floor(i / 9);
                            var x2 = peer % 9;
                            var y2 = Math.floor(peer / 9);
                            if (DEBUG) {
                                console.log("Failed consistency index (" + x1 + ", " + y1 + ") value " + value + " peer (" + x2 + ", " + y2 + ")");
                            }
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    };
    SudokuState.prototype.copy = function () {
        var next = new SudokuState();
        var i;
        for (i = 0; i < 81; i++) {
            next.data[i] = this.data[i].slice();
        }
        return next;
    };
    SudokuState.prototype.set_and_propagate = function (index, value) {
        this.data[index] = [value];
        this.propagate(index);
    };
    SudokuState.prototype.get = function (index) {
        if (this.is_single(index)) {
            return this.data[index][0];
        }
        else {
            return undefined;
        }
    };
    SudokuState.prototype.is_solved = function () {
        var i;
        for (i = 0; i < 81; i++) {
            if (!this.is_single(i)) {
                return false;
            }
        }
        return true;
    };
    SudokuState.prototype.is_single = function (index) {
        return this.data[index].length == 1;
    };
    SudokuState.prototype.propagate = function (index) {
        var x1 = (index % 9) + 1;
        var y1 = (Math.floor(index / 9)) + 1;
        var v1 = this.get(index);
        if (DEBUG) {
            console.log("Propagate invoked with index (" + index + ", " + x1 + ", " + y1 + ") value " + v1);
            this.displayState();
        }
        this.numPropagateInvoked++;
        if (this.numPropagateInvoked > 200) {
            throw new Error("enough propagate!");
        }
        if (!this.is_single(index)) {
            return;
        }
        if (this.is_solved()) {
            return;
        }
        this.propagate_direct(index);
        this.propagate_indirect();
    };
    SudokuState.prototype.propagate_direct = function (index) {
        var value = this.data[index][0];
        var peers_to_propagate = [];
        var shouldStop = false;
        var peer;
        for (var _i = 0, _a = this.peers(index); _i < _a.length; _i++) {
            peer = _a[_i];
            if (!this.is_single(peer)) {
                if (this.contains(peer, value)) {
                    var prevLength = this.data[peer].length;
                    this.remove(peer, value);
                    var currLength = this.data[peer].length;
                    if (prevLength > 1 && currLength == 1) {
                        if (DEBUG) {
                            console.log("Add propagation peer (A) " + peer);
                        }
                        peers_to_propagate.push(peer);
                    }
                }
            }
        }
        if (DEBUG) {
            console.log("Propagation peer list ", peers_to_propagate);
        }
        for (var _b = 0, peers_to_propagate_1 = peers_to_propagate; _b < peers_to_propagate_1.length; _b++) {
            peer = peers_to_propagate_1[_b];
            if (this.is_single(peer)) {
                this.propagate_direct(peer);
            }
        }
    };
    SudokuState.prototype.propagate_indirect = function () {
        var updates = [];
        var group;
        for (var _i = 0, _a = SudokuState.Groups; _i < _a.length; _i++) {
            group = _a[_i];
            var option = void 0;
            for (var _b = 0, _c = [1, 2, 3, 4, 5, 6, 7, 8, 9]; _b < _c.length; _b++) {
                option = _c[_b];
                var counter = 0;
                var index = -1;
                var peer = void 0;
                for (var _d = 0, group_1 = group; _d < group_1.length; _d++) {
                    peer = group_1[_d];
                    if (!this.is_single(peer)) {
                        if (this.contains(peer, option)) {
                            counter++;
                            index = peer;
                        }
                    }
                }
                if (counter == 1) {
                    updates.push([index, option]);
                    if (DEBUG) {
                        console.log("Add propagation peer (B) " + index + ", " + option);
                    }
                }
            }
        }
        if (updates.length > 0) {
            for (var _e = 0, updates_1 = updates; _e < updates_1.length; _e++) {
                var u = updates_1[_e];
                var index = u[0];
                var value = u[1];
                this.data[index] = [value];
                this.propagate_direct(index);
            }
            this.propagate_indirect();
        }
    };
    SudokuState.prototype.remove = function (index, value) {
        var i;
        var a = [];
        for (var _i = 0, _a = this.data[index]; _i < _a.length; _i++) {
            i = _a[_i];
            if (i != value) {
                a.push(i);
            }
        }
        this.data[index] = a;
    };
    SudokuState.prototype.contains = function (index, value) {
        var i;
        for (var _i = 0, _a = this.data[index]; _i < _a.length; _i++) {
            i = _a[_i];
            if (i == value) {
                return true;
            }
        }
        return false;
    };
    SudokuState.prototype.peers = function (index) {
        var x = index % 9;
        var y = Math.floor(index / 9);
        var peers = [];
        var i;
        // add vertical peers
        for (i = 0; i < 9; i++) {
            var peer = i * 9 + x;
            if (peer != index) {
                peers.push(peer);
            }
        }
        // add horizontal peers
        for (i = 0; i < 9; i++) {
            var peer = y * 9 + i;
            if (peer != index) {
                peers.push(peer);
            }
        }
        // add cell peers
        var cellmates = this.group(index);
        for (var _i = 0, cellmates_1 = cellmates; _i < cellmates_1.length; _i++) {
            i = cellmates_1[_i];
            if (i != index) {
                if (!this.is_in(i, peers)) {
                    peers.push(i);
                }
            }
        }
        return peers;
    };
    SudokuState.prototype.is_in = function (i, a) {
        var j;
        for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
            j = a_1[_i];
            if (i == j) {
                return true;
            }
        }
        return false;
    };
    SudokuState.prototype.group = function (index) {
        var group;
        var i;
        for (var _i = 0, _a = SudokuState.Groups; _i < _a.length; _i++) {
            group = _a[_i];
            for (var _b = 0, group_2 = group; _b < group_2.length; _b++) {
                i = group_2[_b];
                if (index == i) {
                    return group;
                }
            }
        }
    };
    SudokuState.Groups = [
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
    return SudokuState;
}());
/// <reference path="SudokuState.ts" />
var SudokuSolver = (function () {
    function SudokuSolver(position) {
        this.init_position = new Array(81);
        var i;
        for (i = 0; i < this.init_position.length; i++) {
            this.init_position[i] = position[i];
        }
        this.numSearchInvoke = 0;
    }
    SudokuSolver.prototype.solve = function () {
        var state = new SudokuState();
        var i;
        for (i = 0; i < 81; i++) {
            if (this.init_position[i] != 0) {
                state.set_and_propagate(i, this.init_position[i]);
            }
        }
        if (state.is_solved()) {
            console.log("Solved without search");
        }
        else {
            console.log("Running search");
            state = this.search(state);
        }
        if (DEBUG) {
            state.displayState();
        }
        var solution = new Array(81);
        for (i = 0; i < solution.length; i++) {
            solution[i] = state.get(i);
        }
        if (this.numSearchInvoke > 0) {
            console.log("Search invoked " + this.numSearchInvoke + " times.");
        }
        console.log("Done.");
        return solution;
    };
    SudokuSolver.prototype.search = function (state) {
        if (DEBUG) {
            console.log("Invoked search");
        }
        this.numSearchInvoke += 1;
        if (this.numSearchInvoke > 1000) {
            throw new Error("enough search!");
        }
        if (DEBUG) {
            state.displayState();
        }
        if (!state.isConsistent()) {
            throw new Error("State is not consistent");
        }
        var i;
        var j;
        var sortedIndex = state.sortedOrder();
        if (DEBUG) {
            console.log("Sorted state: ", sortedIndex);
        }
        for (j = 0; j < sortedIndex.length; j++) {
            i = sortedIndex[j][0];
            if (!state.is_single(i)) {
                if (DEBUG) {
                    var line = void 0;
                    var column = void 0;
                    line = Math.floor(i / 9) + 1;
                    column = (i % 9) + 1;
                    console.log("Trying cell: line " + line + ", column " + column);
                }
                var j_1 = void 0;
                for (var _i = 0, _a = state.options(i); _i < _a.length; _i++) {
                    j_1 = _a[_i];
                    if (state.isLegal(i, j_1)) {
                        if (DEBUG) {
                            console.log("Trying option: " + j_1);
                        }
                        var next = state.copy();
                        next.set_and_propagate(i, j_1);
                        if (next.isConsistent()) {
                            if (DEBUG) {
                                console.log("State is consistent");
                            }
                            if (next.is_solved()) {
                                return next;
                            }
                            next = this.search(next);
                            if (next.is_solved()) {
                                return next;
                            }
                        }
                        else {
                            if (DEBUG) {
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
    };
    return SudokuSolver;
}());
/// <reference path="SudokuSolver.ts" /> 
var SudokuGameUI = (function () {
    function SudokuGameUI(context, cell_size_px) {
        this.context = context;
        this.contents = new Array(81);
        SudokuGameUI.BoxSize = cell_size_px;
        this.selected = -1;
        for (var i = 0; i < 81; i++) {
            this.contents[i] = 0;
        }
        this.allowPlaying = true;
    }
    SudokuGameUI.prototype.paint = function () {
        //white out
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, 9 * SudokuGameUI.BoxSize, 9 * SudokuGameUI.BoxSize);
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
    };
    SudokuGameUI.prototype.draw_borders = function () {
        var shift = 2;
        var x1 = 0;
        var x2 = SudokuGameUI.BoxSize * 9;
        var y1 = x1;
        var y2 = x2;
        this.context.lineWidth = 3.0;
        this.context.fillStyle = "black";
        this.context.strokeStyle = "black";
        this.context.beginPath();
        this.context.moveTo(x1, y1 + shift);
        this.context.lineTo(x2 - shift, y1 + shift);
        this.context.lineTo(x2 - shift, y2 - shift);
        this.context.lineTo(x1 + shift, y2 - shift);
        this.context.lineTo(x1 + shift, y1);
        this.context.stroke();
    };
    SudokuGameUI.prototype.draw_heavy_line = function (x1, y1, x2, y2) {
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
    };
    SudokuGameUI.prototype.draw_light_line = function (x1, y1, x2, y2) {
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
    };
    SudokuGameUI.prototype.paint_selected = function () {
        if (this.selected < 0) {
            return;
        }
        var x = this.selected % 9;
        var y = Math.floor(this.selected / 9);
        this.context.fillStyle = "#b5fcb5";
        this.context.fillRect(x * SudokuGameUI.BoxSize, y * SudokuGameUI.BoxSize, SudokuGameUI.BoxSize, SudokuGameUI.BoxSize);
    };
    SudokuGameUI.prototype.clear_all = function () {
        this.selected = -1;
        this.solution = undefined;
        for (var i = 0; i < 81; i++) {
            this.contents[i] = 0;
        }
        this.paint();
        this.allowPlaying = true;
    };
    SudokuGameUI.prototype.set_selected = function (x, y) {
        x = Math.floor(x / SudokuGameUI.BoxSize);
        y = Math.floor(y / SudokuGameUI.BoxSize);
        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }
        if (x > 8) {
            x = 8;
        }
        if (y > 8) {
            y = 8;
        }
        this.selected = y * 9 + x;
        this.paint();
    };
    SudokuGameUI.prototype.input = function (i) {
        if (this.selected < 0) {
            return true;
        }
        if (this.validate(i)) {
            this.contents[this.selected] = i;
            this.selected = -1;
            this.paint();
            return true;
        }
        return false;
    };
    SudokuGameUI.prototype.paint_contents = function () {
        for (var i = 0; i < 81; i++) {
            if (this.contents[i] != 0) {
                this.print_number(this.contents[i], i, "black");
            }
        }
    };
    SudokuGameUI.prototype.paint_solution = function () {
        if (this.solution === undefined) {
            return;
        }
        for (var i = 0; i < 81; i++) {
            if (this.contents[i] == 0) {
                if (this.solution[i]) {
                    this.print_number(this.solution[i], i, "red");
                }
            }
        }
    };
    SudokuGameUI.prototype.print_number = function (num, pos, color) {
        var x = pos % 9;
        var y = Math.floor(pos / 9);
        x *= SudokuGameUI.BoxSize;
        y *= SudokuGameUI.BoxSize;
        x += Math.floor(SudokuGameUI.BoxSize * 0.33);
        y += Math.floor(SudokuGameUI.BoxSize * 0.75);
        this.context.font = "30px sans-serif";
        this.context.fillStyle = color;
        this.context.fillText(String(num), x, y);
    };
    SudokuGameUI.prototype.validate = function (new_value) {
        if (new_value == 0) {
            return true;
        }
        if (new_value == this.contents[this.selected]) {
            return true;
        }
        var i;
        for (var _i = 0, _a = this.vertical_group(); _i < _a.length; _i++) {
            i = _a[_i];
            if (new_value == this.contents[i]) {
                return false;
            }
        }
        for (var _b = 0, _c = this.horizontal_group(); _b < _c.length; _b++) {
            i = _c[_b];
            if (new_value == this.contents[i]) {
                return false;
            }
        }
        for (var _d = 0, _e = this.square_group(); _d < _e.length; _d++) {
            i = _e[_d];
            if (new_value == this.contents[i]) {
                return false;
            }
        }
        return true;
    };
    SudokuGameUI.prototype.vertical_group = function () {
        var result = [];
        var x = this.selected % 9;
        var y;
        for (var _i = 0, _a = [0, 1, 2, 3, 4, 5, 6, 7, 8]; _i < _a.length; _i++) {
            y = _a[_i];
            result.push(y * 9 + x);
        }
        return result;
    };
    SudokuGameUI.prototype.horizontal_group = function () {
        var result = [];
        var y = Math.floor(this.selected / 9);
        var x;
        for (var _i = 0, _a = [0, 1, 2, 3, 4, 5, 6, 7, 8]; _i < _a.length; _i++) {
            x = _a[_i];
            result.push(y * 9 + x);
        }
        return result;
    };
    SudokuGameUI.prototype.square_group = function () {
        var groups = [
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
        var group;
        var i;
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            group = groups_1[_i];
            for (var _a = 0, group_3 = group; _a < group_3.length; _a++) {
                i = group_3[_a];
                if (this.selected == i) {
                    return group;
                }
            }
        }
    };
    SudokuGameUI.prototype.neededNumberOfDigits = function () {
        var counter = 0;
        for (var i = 0; i < 81; i++) {
            if (this.contents[i] > 0) {
                counter++;
            }
        }
        return counter >= 17;
    };
    SudokuGameUI.prototype.solve = function () {
        if (this.allowPlaying) {
            if (!this.neededNumberOfDigits()) {
                return false;
            }
            this.allowPlaying = false;
            var solver = new SudokuSolver(this.contents);
            this.solution = solver.solve();
            this.paint();
        }
        return true;
    };
    SudokuGameUI.prototype.setPosition = function (sudokuStartPosition) {
        this.clear_all();
        var i;
        for (i = 0; i < 81; i++) {
            var c = parseInt(sudokuStartPosition.charAt(i));
            if (isNaN(c)) {
                this.contents[i] = 0;
            }
            else {
                this.contents[i] = c;
            }
        }
        this.paint();
    };
    SudokuGameUI.BoxSize = 35; // px, 9 boxes per side in sudoku
    return SudokuGameUI;
}());
/// <reference path="sudoku_util.ts" />
/// <reference path="SudokuGameUI.ts" />
var DEBUG = false;
window.onload = function () {
    var width = window.innerWidth;
    var cell_size_px = 35;
    if (width >= 450) {
        cell_size_px = 50;
    }
    if (width >= 1000) {
        user_probably_has_a_keyboard();
    }
    var canvas = document.getElementById("board");
    canvas.width = 9 * cell_size_px;
    canvas.height = 9 * cell_size_px;
    var context = canvas.getContext("2d");
    var game = new SudokuGameUI(context, cell_size_px);
    game.paint();
    var clear_button = document.getElementById("clear_button");
    clear_button.addEventListener('click', function (event) {
        game.clear_all();
    }, false);
    var solve_button = document.getElementById("solve_button");
    solve_button.addEventListener('click', function (event) {
        var played = game.solve();
        if (!played) {
            display_error("Please enter at least 17 digits!", true);
        }
    }, false);
    var button_1 = document.getElementById("button_1");
    button_1.addEventListener('click', function (event) {
        if (game.input(1)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);
    var button_2 = document.getElementById("button_2");
    button_2.addEventListener('click', function (event) {
        if (game.input(2)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);
    var button_3 = document.getElementById("button_3");
    button_3.addEventListener('click', function (event) {
        if (game.input(3)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);
    var button_4 = document.getElementById("button_4");
    button_4.addEventListener('click', function (event) {
        if (game.input(4)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);
    var button_5 = document.getElementById("button_5");
    button_5.addEventListener('click', function (event) {
        if (game.input(5)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);
    var button_6 = document.getElementById("button_6");
    button_6.addEventListener('click', function (event) {
        if (game.input(6)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);
    var button_7 = document.getElementById("button_7");
    button_7.addEventListener('click', function (event) {
        if (game.input(7)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);
    var button_8 = document.getElementById("button_8");
    button_8.addEventListener('click', function (event) {
        if (game.input(8)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);
    var button_9 = document.getElementById("button_9");
    button_9.addEventListener('click', function (event) {
        if (game.input(9)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);
    var button_cancel = document.getElementById("button_cancel");
    button_cancel.addEventListener('click', function (event) {
        remove_modal();
    }, false);
    var button_clear = document.getElementById("button_clear");
    button_clear.addEventListener('click', function (event) {
        game.input(0);
        remove_modal();
    }, false);
    canvas.addEventListener('click', function (event) {
        var x = event.pageX - canvas.offsetLeft;
        var y = event.pageY - canvas.offsetTop;
        game.set_selected(x, y);
        if (!has_keyboard()) {
            var modal_div = document.getElementById("modal");
            modal_div.style.display = "block";
        }
    }, false);
    document.addEventListener('keypress', function (event) {
        var e = (event || window.event);
        var code = e.charCode || e.keyCode;
        if (code >= 48 && code <= 57) {
            if (!game.input(code - 48)) {
                display_error(digit_error());
            }
        }
        else if (code == 32) {
            game.input(0); // zero is always OK
        }
    }, false);
    var testButtons = document.getElementsByClassName("test");
    var i;
    for (i = 0; i < testButtons.length; i++) {
        var testButton = testButtons[i];
        testButton.addEventListener('click', function (event) {
            var button = event.target;
            var testData = button.getAttribute("test-data");
            game.setPosition(testData);
        });
    }
};
