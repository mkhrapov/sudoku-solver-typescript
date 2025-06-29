/// <reference path="sudoku_util.ts" />
/// <reference path="SudokuGameUI.ts" />

var DEBUG = false;

window.onload = function() {
    var width = window.innerWidth;
    var cell_size_px : number = 35;
    if(width >= 450) {
        cell_size_px = 50;
    }
    if(width >= 1000) {
        user_probably_has_a_keyboard();
    }

    var canvas = <HTMLCanvasElement> document.getElementById("board");
    canvas.width = 9*cell_size_px;
    canvas.height = 9*cell_size_px;
    var context = canvas.getContext("2d");

    var game = new SudokuGameUI(context, cell_size_px);
    game.paint();

    var clear_button = document.getElementById("clear_button");
    clear_button.addEventListener('click', function(event) {
        game.clear_all();
    }, false);

    var solve_button = document.getElementById("solve_button");
    solve_button.addEventListener('click', function(event) {
        var played = game.solve();
        if(!played) {
            display_error("Please enter at least 17 digits!", true);
        }
    }, false);

    var button_1 = document.getElementById("button_1");
    button_1.addEventListener('click', function(event) {
        if(game.input(1)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);

    var button_2 = document.getElementById("button_2");
    button_2.addEventListener('click', function(event) {
        if(game.input(2)) {
             remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);

    var button_3 = document.getElementById("button_3");
    button_3.addEventListener('click', function(event) {
        if(game.input(3)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);

    var button_4 = document.getElementById("button_4");
    button_4.addEventListener('click', function(event) {
        if(game.input(4)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);

    var button_5 = document.getElementById("button_5");
    button_5.addEventListener('click', function(event) {
        if(game.input(5)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);

    var button_6 = document.getElementById("button_6");
    button_6.addEventListener('click', function(event) {
        if(game.input(6)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);

    var button_7 = document.getElementById("button_7");
    button_7.addEventListener('click', function(event) {
        if(game.input(7)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);

    var button_8 = document.getElementById("button_8");
    button_8.addEventListener('click', function(event) {
        if(game.input(8)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);

    var button_9 = document.getElementById("button_9");
    button_9.addEventListener('click', function(event) {
        if(game.input(9)) {
            remove_modal();
        }
        else {
            display_error(digit_error());
        }
    }, false);

    var button_cancel = document.getElementById("button_cancel");
    button_cancel.addEventListener('click', function(event) {
        remove_modal();
    }, false);

    var button_clear = document.getElementById("button_clear");
    button_clear.addEventListener('click', function(event) {
        game.input(0);
        remove_modal();
    }, false);

    canvas.addEventListener('click', function(event) {
        let x: number = event.pageX - canvas.offsetLeft;
        let y: number = event.pageY - canvas.offsetTop;
        game.set_selected(x, y);
        if(!has_keyboard()) {
            var modal_div = <HTMLElement> document.getElementById("modal");
            modal_div.style.display = "block";
        }
    }, false);

    document.addEventListener('keypress', function(event) {
        let e = <KeyboardEvent> (event || window.event);
        let code = e.charCode || e.keyCode;
        if(code >= 48 && code <= 57) {
            if(!game.input(code - 48)) {
                display_error(digit_error());
            }
        }
        else if(code == 32) {
            game.input(0); // zero is always OK
        }
    }, false);

    let testButtons = document.getElementsByClassName("test");
    let i: number;
    for(i = 0; i < testButtons.length; i++) {
        let testButton = testButtons[i];
        testButton.addEventListener('click', function(event) {
            let button = <HTMLElement> event.target;
            let testData: string = button.getAttribute("test-data");
            game.setPosition(testData);
        });
    }
};
