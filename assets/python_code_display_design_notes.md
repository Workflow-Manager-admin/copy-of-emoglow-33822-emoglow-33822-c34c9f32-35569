# Python Code Display UI Design Notes

## Layout Structure

- **Primary Area:** Single-column, top-aligned code editor/viewer area.
- **No visible navigation, sidebar, or footer in this reference image.
- **Flow:** Code is rendered top-down with consistent left alignment.

## Color Palette

- `--bg-canvas: #FFFFFF;` (background)
- `--syntax-keyword: #FF8000;` (keywords like `def`, `if`, `elif`, `else`, `return`)
- `--syntax-string: #80C37B;` (string literals)
- `--syntax-number: #F21111;` (numeric literals)
- `--syntax-function: #3444FF;` (user-defined function names)
- `--syntax-builtin: #AA00AA;` (built-in functions like `input`, `print`, `float`)
- `--syntax-text: #000000;` (default/variable names)

## Typography

- **Font family:** `Consolas, Monaco, 'Courier New', monospace`
- **Font size:** 14px (can be increased to 16px for accessibility)
- **Font weight:** Normal (400)
- **Line height:** 1.5
- **Indentation:** 4 spaces per indent

## Spacing

- **Padding:** 16–24px around code block/container
- **No visible margin** outside code area within the screenshot
- **Line spacing:** 1.5 (to maintain readability in dense code)

## Container

- **Background:** Solid white
- **Border:** None
- **Shadow:** None
- **Width:** Full width of parent or max-width if desired for readability
- **Horizontal overflow:** Scrollable on smaller screens (mobile)

## Interactive/UX Elements

- **None present in their reference**
- (If future updates: Consider "Copy code" or download button for user benefit)

## Responsive Notes

- Make code container horizontally scrollable if it exceeds screen width on mobile devices.

## Example CSS Variables

```css
:root {
  --bg-canvas: #FFFFFF;
  --syntax-keyword: #FF8000;
  --syntax-string: #80C37B;
  --syntax-number: #F21111;
  --syntax-function: #3444FF;
  --syntax-builtin: #AA00AA;
  --syntax-text: #000000;
}
```

## Notes

- **No brand elements, logos, or site-wide navigation are reflected in this screenshot.**
- This specification is for a code display/code viewer interface with classic syntax highlighting.

