//! Keys are stored as browser `KeyboardEvent.code` strings (e.g. "KeyI", "ArrowUp")
//! so the UI can capture them directly. This maps them to Windows virtual-key codes.

const NAMED: &[(&str, u16)] = &[
    ("Space", 0x20),
    ("Enter", 0x0D),
    ("Escape", 0x1B),
    ("Tab", 0x09),
    ("Backspace", 0x08),
    ("CapsLock", 0x14),
    ("ShiftLeft", 0xA0),
    ("ShiftRight", 0xA1),
    ("ControlLeft", 0xA2),
    ("ControlRight", 0xA3),
    ("AltLeft", 0xA4),
    ("AltRight", 0xA5),
    ("ArrowLeft", 0x25),
    ("ArrowUp", 0x26),
    ("ArrowRight", 0x27),
    ("ArrowDown", 0x28),
    ("Insert", 0x2D),
    ("Delete", 0x2E),
    ("Home", 0x24),
    ("End", 0x23),
    ("PageUp", 0x21),
    ("PageDown", 0x22),
    ("Minus", 0xBD),
    ("Equal", 0xBB),
    ("BracketLeft", 0xDB),
    ("BracketRight", 0xDD),
    ("Backslash", 0xDC),
    ("Semicolon", 0xBA),
    ("Quote", 0xDE),
    ("Backquote", 0xC0),
    ("Comma", 0xBC),
    ("Period", 0xBE),
    ("Slash", 0xBF),
    ("NumpadMultiply", 0x6A),
    ("NumpadAdd", 0x6B),
    ("NumpadSubtract", 0x6D),
    ("NumpadDecimal", 0x6E),
    ("NumpadDivide", 0x6F),
];

pub const VK_ENTER: u16 = 0x0D;
pub const VK_ESCAPE: u16 = 0x1B;
pub const VK_SLASH: u16 = 0xBF;

pub fn code_to_vk(code: &str) -> Option<u16> {
    if let Some(&(_, vk)) = NAMED.iter().find(|(c, _)| *c == code) {
        return Some(vk);
    }
    if let Some(rest) = code.strip_prefix("Key") {
        let b = rest.as_bytes();
        if b.len() == 1 && b[0].is_ascii_uppercase() {
            return Some(b[0] as u16); // VK_A..VK_Z == 'A'..'Z'
        }
    }
    if let Some(rest) = code.strip_prefix("Digit") {
        let b = rest.as_bytes();
        if b.len() == 1 && b[0].is_ascii_digit() {
            return Some(b[0] as u16); // VK_0..VK_9 == '0'..'9'
        }
    }
    if let Some(n) = code.strip_prefix("Numpad").and_then(|r| r.parse::<u16>().ok()) {
        if n <= 9 {
            return Some(0x60 + n);
        }
    }
    if let Some(n) = code.strip_prefix('F').and_then(|r| r.parse::<u16>().ok()) {
        if (1..=24).contains(&n) {
            return Some(0x70 + n - 1);
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_common_codes() {
        assert_eq!(code_to_vk("KeyW"), Some(0x57));
        assert_eq!(code_to_vk("Digit1"), Some(0x31));
        assert_eq!(code_to_vk("F8"), Some(0x77));
        assert_eq!(code_to_vk("Numpad5"), Some(0x65));
        assert_eq!(code_to_vk("Slash"), Some(VK_SLASH));
        assert_eq!(code_to_vk("Keyw"), None);
        assert_eq!(code_to_vk("Nope"), None);
    }
}
