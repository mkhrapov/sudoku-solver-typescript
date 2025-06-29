function digit_error() : string {
    return "This digit is not allowed here.";
}

function display_error(msg: string, alwaysUseDesktop?: boolean) {
    let target : string;
    if(has_keyboard()) {
        target = "error_message_desktop";
    }
    else {
        target = "error_message_mobile";
    }

    if(alwaysUseDesktop) {
        target = "error_message_desktop";
    }

    let p_error = document.getElementById(target);
    p_error.innerHTML = msg;
    setTimeout(function() {
        p_error.innerHTML = "";
    }, 3000);
}

function user_probably_has_a_keyboard() : void {
    var have_keyboard_check_box = <HTMLInputElement> document.getElementById("have_keyboard");
    have_keyboard_check_box.checked = true;
}

function has_keyboard() : boolean {
    var have_keyboard_check_box = <HTMLInputElement> document.getElementById("have_keyboard");
    return have_keyboard_check_box.checked;
}

function remove_modal() : void {
    var modal_div = <HTMLElement> document.getElementById("modal");
    modal_div.style.display = "none";
}