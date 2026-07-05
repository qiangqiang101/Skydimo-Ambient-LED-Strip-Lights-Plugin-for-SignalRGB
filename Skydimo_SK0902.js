import { SMALL_LETTERS, LETTERS, DIGITS, SMALL_DIGITS } from './WLED_Text.js';
import { ZH_FONT } from './WLED_Text_ZH.min.js';
export function Name() { return "Skydimo SK0902"; }
export function VendorId() { return 0x1A86; }
export function ProductId() { return 0xE316; }
export function Publisher() { return "I'm Not MentaL & 嘤嘤猫"; }
export function Documentation() { return "troubleshooting/skydimo"; }
export function Size() { return [8, 8]; }
export function DefaultPosition() { return [40, 120]; }
export function DefaultScale() { return 1.0; }
export function DeviceType() { return "headset"; }
export function LedNames() { return vKeyNames; }
export function LedPositions() { return vKeyPositions; }
export function Render() { sendColors(grabColors()); }
export function Validate(endpoint) { return endpoint.interface === 0 && endpoint.usage === 0x0001 && endpoint.usage_page === 0xFF00; }
export function ImageUrl() { return "https://dev-dl.skydimo.com/assets/device/SK0902.png"; }
/* global
shutdownColor:readonly
LightingMode:readonly
forcedColor:readonly
displayMode:readonly
dtFormat:readonly
invertColor:readonly
invertTextColor:readonly
customText:readonly
fontSize:readonly
scrollDirection:readonly
scrollSpeed:readonly
paddingX:readonly
paddingY:readonly
*/
export function ControllableParameters() {
    return [
        { "property": "shutdownColor", "group": "lighting", "label": "Shutdown Color", description: "This color is applied to the device when the System, or SignalRGB is shutting down", "min": "0", "max": "360", "type": "color", "default": "#000000" },
        { "property": "LightingMode", "group": "lighting", "label": "Lighting Mode", description: "Determines where the device's RGB comes from. Canvas will pull from the active Effect, while Forced will override it to a specific color", "type": "combobox", "values": ["Canvas", "Forced"], "default": "Canvas" },
        { "property": "forcedColor", "group": "lighting", "label": "Forced Color", description: "The color used when 'Forced' Lighting Mode is enabled", "min": "0", "max": "360", "type": "color", "default": "#009bde" },
        { "property": "displayMode", "label": "Display Mode", "type": "combobox", description: "Can used for displaying Date and Time or Custom Text.", "values": ["General", "Time", "Custom Text"], "default": "General" },
        { "property": "dtFormat", "label": "Date Time Format", "type": "textfield", description: "This used when 'Display Mode' is set to 'Time', enter the time format you wish to display. For example: 'hh:mm tt' or 'HH:mm:ss' for 24 hour clock.", "default": "hh:mm tt" },
        { "property": "invertColor", "label": "Invert Text", "type": "boolean", description: "This will Invert color of 'Time', 'Custom Text', 'Pixel Art' and 'Libre Hardware Monitor'.", "default": "false" },
        { "property": "invertTextColor", "label": "Text Color when inverted", "type": "color", "description": "The color used for text when 'Invert Text' is enabled.", "default": "#000" },
        { "property": "customText", "label": "Display Mode: Custom Text", "type": "textfield", description: "The text to display when 'Display Mode' is set to 'Custom Text'.", "default": "Skydimo" },
        { "property": "fontSize", "label": "Font Size", "type": "combobox", description: "Font size for 'Time' and 'Custom Text'.", "values": ["Small", "Medium", "Chinese"], "default": "Medium" },
        { "property": "scrollDirection", "label": "Scroll Direction", "type": "combobox", description: "This used on all 'Display Mode' except for 'General'.", "values": ["Off", "Left", "Right", "Ping-Pong"], "default": "Off" },
        { "property": "scrollSpeed", "label": "Scroll Speed", description: "This used when 'Scroll Direction' is Enabled.", "step": "1", "type": "number", "min": "1", "max": "100", "default": "50" },
        { "property": "paddingX", "label": "Padding X", "type": "textfield", description: "Extra X spaces added to align data output.", "default": 0, "filter": /^\d+$/ },
        { "property": "paddingY", "label": "Padding Y", "type": "textfield", description: "Extra Y spaces added to align data output.", "default": 1, "filter": /^\d+$/ },
    ];
}

const ZH_FONT_DIGITS = Object.assign({}, ZH_FONT, DIGITS);
const ZH_FONT_LETTERS = Object.assign({}, ZH_FONT, LETTERS);
const display = new Array(7 * 7).fill(0);
const displaySize = { width: 7, height: 7 };
let scrollOffset = 0;
let pingPongDirection = -1;

export function Initialize() {
    device.setFrameRateTarget(60);
}

export function Shutdown(SystemSuspending) {
    const color = SystemSuspending ? "#000000" : shutdownColor;
    grabColors(color);
}

const PACKET_SIZE = 64;
const PACKET_RGB_BYTES = 60;
const END_PACKET = [
    0x01, 0xFF, 0xFF, 0x31,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x1E, // index 60
    0x00, 0x00, 0x00
];

const vKeyNames = [
    "Led 0", "Led 1", "Led 2", "Led 3", "Led 4", "Led 5", "Led 6",
    "Led 7", "Led 8", "Led 9", "Led 10", "Led 11", "Led 12", "Led 13",
    "Led 14", "Led 15", "Led 16", "Led 17", "Led 18", "Led 19", "Led 20",
    "Led 21", "Led 22", "Led 23", "Led 24", "Led 25", "Led 26", "Led 27",
    "Led 28", "Led 29", "Led 30", "Led 31", "Led 32", "Led 33", "Led 34",
    "Led 35", "Led 36", "Led 37", "Led 38", "Led 39", "Led 40", "Led 41",
    "Led 42", "Led 43", "Led 44", "Led 45", "Led 46", "Led 47", "Led 48"
];

const vKeyPositions = [
    [0, 6], [0, 5], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
    [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
    [2, 6], [2, 5], [2, 4], [2, 3], [2, 2], [2, 1], [2, 0],
    [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
    [4, 6], [4, 5], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0],
    [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6],
    [6, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0]
];

const MAPPING = [
    6, 7, 20, 21, 34, 35, 48,
    5, 8, 19, 22, 33, 36, 47,
    4, 9, 18, 23, 32, 37, 46,
    3, 10, 17, 24, 31, 38, 45,
    2, 11, 16, 25, 30, 39, 44,
    1, 12, 15, 26, 29, 40, 43,
    0, 13, 14, 27, 28, 41, 42
]

function rearrangeDisplayForSnakeLayout(display) {
    const snakeDisplay = new Array(display.length);

    for (let i = 0; i < display.length; i++) {
        snakeDisplay[MAPPING[i]] = display[i];
    }

    return snakeDisplay;
}

function replaceEx(str, obj) {
    for (const x in obj) { str = str.replace(new RegExp(x, 'g'), obj[x]); }
    return str
}

function formatDateTime(format) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();

    const hour12 = now.getHours() % 12 || 12;
    const hour24 = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    const ampm = now.getHours() >= 12 ? 'pm' : 'am';

    let _format = replaceEx(format, {
        'dd': String(day).padStart(2, '0'), 'd': day,
        'hh': String(hour12).padStart(2, '0'), 'h': hour12,
        'HH': String(hour24).padStart(2, '0'), 'H': hour24,
        'mm': String(minute).padStart(2, '0'), 'm': minute,
        'MM': String(month).padStart(2, '0'), 'M': month,
        'ss': String(second).padStart(2, '0'), 's': second,
        'tt': ampm, 't': ampm == 'am' ? 'a' : 'p',
        'yyyy': year, 'yyy': year, 'yy': year.toString().substring(2), 'y': year.toString().substring(2),
    });
    return _format;
}

function displayClock() {
    // Fill background based on invertColor
    display.fill(invertColor ? 1 : 0);
    const now = new Date();

    let text;
    switch (displayMode) {
        case 'Custom Text':
            text = customText;
            break;
        default:
            if (now.getSeconds() % 2 !== 0) {
                text = replaceEx(formatDateTime(dtFormat), { ':': ';' });
            } else {
                text = formatDateTime(dtFormat);
            }
    }

    let baseRow = parseInt(paddingY);
    // Don't add a trailing gap if we are ping-ponging!
    let textWithGap = scrollDirection === "Ping-Pong" ? " " + text + " " : text + " ".repeat(Math.floor(displaySize.width / 2));
    let { buffer, bufferWidth } = renderTextBuffer(textWithGap, fontSize, baseRow, displayMode == 'Time');

    // --- Scroll offset update ---
    if (scrollDirection === "Left") {
        scrollOffset -= (scrollSpeed / 100);   // move text leftward
    } else if (scrollDirection === "Right") {
        scrollOffset += (scrollSpeed / 100);   // move text rightward
    } else if (scrollDirection === "Ping-Pong") {
        scrollOffset += (scrollSpeed / 100) * pingPongDirection;
    }

    // --- Wrap or Bounce offset ---
    if (scrollDirection === "Ping-Pong") {
        // Calculate the furthest left the text can go before the right edge is exposed
        let minOffset = displaySize.width - bufferWidth;
        if (minOffset > 0) minOffset = 0; // Don't bounce if text is shorter than the matrix

        if (scrollOffset <= minOffset) {
            scrollOffset = minOffset;
            pingPongDirection = 1; // Hit left bound, bounce right
        } else if (scrollOffset >= 0) {
            scrollOffset = 0;
            pingPongDirection = -1; // Hit right bound, bounce left
        }
    } else {
        // Standard seamless wrap
        const totalSpan = bufferWidth + displaySize.width;
        if (scrollOffset <= -bufferWidth) scrollOffset += bufferWidth;
        if (scrollOffset >= bufferWidth) scrollOffset -= bufferWidth;
    }

    // --- Copy visible slice (tile buffer) ---
    for (let row = 0; row < displaySize.height; row++) {
        for (let col = 0; col < displaySize.width; col++) {
            // repeat buffer by using modulo
            let srcX = Math.floor((col - scrollOffset) % bufferWidth);
            if (srcX < 0) srcX += bufferWidth; // ensure positive index
            display[row * displaySize.width + col] = buffer[row * bufferWidth + srcX];
        }
    }
}

function getSpacing(digit, fontSize, time) {
    if (time) {
        if (fontSize === 'Chinese') {
            if (isChineseChar(digit)) {
                return 9;
            } else {
                switch (digit) {
                    case '|': return 2;
                    case 'i': case 'l': case '`': case "(": case ')': case ';': case ':': case "'": case ',': case '.': case ' ': return 3;
                    case 'I': case '!': case '[': case ']': case '1': case '°': return 4;
                    case 'f': case 'h': case 'j': case 'k': case 'n': case 't': case 'u': case 'x':
                    case 'y': case 'Z': case 'z': case '~': case '$': case '{': case '}': case '<': case '>': return 5;
                    default: return 6;
                }
            }
        } else if (fontSize === 'Medium') {
            switch (digit) {
                case ':': case ';': case '.': return 2;
                case ' ': return 1;
                default: return 5;
            }
        } else {
            switch (digit) {
                case ':': case ';': case '.': return 2;
                case ' ': return 1;
                default: return 4;
            }
        }
    } else {
        if (fontSize === 'Chinese') {
            if (isChineseChar(digit)) {
                return 9;
            } else {
                switch (digit) {
                    case '|': return 2;
                    case 'i': case 'l': case '`': case "(": case ')': case ';': case ':': case "'": case ',': case '.': case ' ': return 3;
                    case 'I': case '!': case '[': case ']': case '1': case '°': return 4;
                    case 'f': case 'h': case 'j': case 'k': case 'n': case 't': case 'u': case 'x':
                    case 'y': case 'Z': case 'z': case '~': case '$': case '{': case '}': case '<': case '>': return 5;
                    default: return 6;
                }
            }
        } else if (fontSize === 'Medium') {
            switch (digit) {
                case ' ': return 1;
                case '!': case '|': case ':': case "'": case '.': return 2;
                case '`': case '(': case ')': case '[': case ']': case ';': case ',': case '1': return 3;
                case 'a': case 'c': case 'I': case 'i': case 'j': case 'L': case 'l': case 'r':
                case 'Y': case '$': case '^': case '*': case '-': case '=': case '+': case '{':
                case '}': case '\\': case '"': case '<': case '>': case '/': case '?': case '°': return 4;
                case 'T': case 'W': case '@': case '#': case '%': case '&': return 6;
                default: return 5;
            }
        } else {
            switch (digit) {
                case ' ': return 1;
                case 'i': case 'l': case '!': case '|': case ':': case '.': return 2;
                case 'j': case 'r': case '1': case '`': case '(': case ')': case '[': case ']':
                case ';': case "'": case ',': return 3;
                case '~': return 5;
                default: return 4;
            }
        }
    }
}

function renderTextBuffer(text, fontSize, baseRow, time) {
    let glyphs = [];
    let totalWidth = 0;

    for (const ch of text) {
        let glyph;
        switch (fontSize) {
            case 'Chinese':
                glyph = time ? ZH_FONT_DIGITS[ch] : ZH_FONT_LETTERS[ch];
                break;
            case 'Small':
                glyph = time ? SMALL_DIGITS[ch] : SMALL_LETTERS[ch];
                break;
            default:
                glyph = time ? DIGITS[ch] : LETTERS[ch];
                break;
        }

        let spacing = getSpacing(ch, fontSize, time);

        if (glyph) glyphs.push({ glyph, offset: totalWidth });
        totalWidth += spacing; // always advance, even for spaces
    }

    let bufferWidth = totalWidth;
    let bufferHeight = displaySize.height;
    let buffer = new Array(bufferWidth * bufferHeight).fill(invertColor ? 1 : 0);
    // <-- fill background according to invertColor

    for (const { glyph, offset } of glyphs) {
        for (let row = 0; row < glyph.length; row++) {
            for (let col = 0; col < glyph[row].length; col++) {
                let x = offset + col;
                let y = baseRow + row;
                if (y >= 0 && y < bufferHeight && x >= 0 && x < bufferWidth) {
                    buffer[y * bufferWidth + x] = invertColor ? (glyph[row][col] ? 0 : 1) : (glyph[row][col] ? 1 : 0);
                }
            }
        }
    }

    return { buffer, bufferWidth };
}

function isChineseChar(char) {
    return /[\u4E00-\u9FFF]/.test(char);
}

function crc8(data) {
    let crc = 0x00;

    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            if (crc & 0x80) {
                crc = ((crc << 1) ^ 0x07) & 0xFF;
            } else {
                crc = (crc << 1) & 0xFF;
            }
        }
    }
    return crc & 0xFF;
}

function build64BytePacket(packet63) {
    if (packet63.length !== 63) {
        throw new Error("Input must be exactly 63 bytes");
    }
    const packet = packet63.slice(); // copy
    // CRC over first 63 bytes
    const crc = crc8(packet);
    // append CRC as 64th byte
    packet.push(crc);
    return packet;
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let colors = [];
    colors[0] = parseInt(result[1], 16);
    colors[1] = parseInt(result[2], 16);
    colors[2] = parseInt(result[3], 16);

    return colors;
}

function grabColors(overrideColor) {
    let GRBData = [];

    if (displayMode !== "General") {
        displayClock();
        const mappedDisplay = rearrangeDisplayForSnakeLayout(display);

        for (let li = 0; li < mappedDisplay.length; li++) {
            const [x, y] = vKeyPositions[li];
            let pixelColor;

            switch (mappedDisplay[li]) {
                case 0:
                    if (invertColor) {
                        pixelColor = hexToRgb(invertTextColor || "#FFFFFF");
                    } else {
                        pixelColor = [0, 0, 0];
                    }
                    break;
                default:
                    pixelColor = overrideColor ? hexToRgb(shutdownColor) : (LightingMode === "Forced" ? hexToRgb(forcedColor) : device.color(x, y));
            }

            // Push in GRB order
            GRBData.push(pixelColor[1], pixelColor[0], pixelColor[2]);
        }
        return GRBData;
    }

    // --- General mode ---
    for (let i = 0; i < vKeyPositions.length; i++) {
        const [x, y] = vKeyPositions[i];
        let color = overrideColor ? hexToRgb(shutdownColor)
            : (LightingMode === "Forced" ? hexToRgb(forcedColor) : device.color(x, y));

        GRBData.push(color[1], color[0], color[2]);
    }

    return GRBData;
}

function sendColors(frameData) {
    let packetsCount = Math.ceil(frameData.length / PACKET_RGB_BYTES);
    for (let packetID = 0; packetID < packetsCount; packetID++) {
        let start = packetID * PACKET_RGB_BYTES;
        let end = start + PACKET_RGB_BYTES;
        let chunk = frameData.slice(start, end);
        let packet63 = [0x01, packetID * 20, 0x00, ...chunk];
        sendPacket(packet63);
    }
    device.write(END_PACKET, PACKET_SIZE);
}

function sendPacket(packet63) {
    packet63 = packet63.concat(new Array(63 - packet63.length).fill(0));
    let packet = build64BytePacket(packet63);
    device.write(packet, PACKET_SIZE);
}