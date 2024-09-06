import * as readline from 'readline';
import {alertOnLowTemp} from "./index";

export function processKeyPressEvents() {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY)
        process.stdin.setRawMode(true);

    process.stdin.on('keypress', (chunk, key) => {
        if (key && key.name == 'return')
            alertOnLowTemp();
    })
}