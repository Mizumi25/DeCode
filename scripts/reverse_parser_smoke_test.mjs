import reverseCodeParserService from '../resources/js/Services/ReverseCodeParserService.js';

const assert = (cond, msg) => {
  if (!cond) {
    throw new Error(msg || 'Assertion failed');
  }
};

const run = () => {
  // 1) Types + text nodes preserved
  const html = `<div style="color:red"><button class="btn">Click</button></div>`;
  const tree = reverseCodeParserService.parseCodeToComponents(html, 'html');

  assert(Array.isArray(tree) && tree.length === 1, 'Expected 1 root');
  assert(tree[0].type === 'div', 'Root should be div');
  assert(tree[0].style?.color === 'red', 'Inline styles should be parsed');

  const btn = tree[0].children?.[0];
  assert(btn?.type === 'button', 'Button type should be button');
  assert(btn?.props?.className === 'btn', 'class should map to className');

  const text = btn.children?.[0];
  assert(text?.type === 'text-node', 'Button should contain a text-node child');
  assert(text?.props?.content?.trim() === 'Click', 'Text node should preserve inner text');

  // 2) Link alias mapping
  const linkTree = reverseCodeParserService.parseCodeToComponents(`<a href=\"#\">Hi</a>`, 'html');
  assert(linkTree[0].type === 'link', 'a should map to link alias');

  // 3) CSS rehydration by className (html-css / react-css flow)
  const htmlWithClass = `<div class=\"card\">Hello</div>`;
  const css = `.card { background-color: black; color: white; padding: 12px; }`;
  const styled = reverseCodeParserService.parseCodeToComponents(htmlWithClass, 'html', 'html-css', css);
  assert(styled[0].style?.backgroundColor === 'black', 'CSS class should apply backgroundColor');
  assert(styled[0].style?.color === 'white', 'CSS class should apply color');
  assert(styled[0].style?.padding === '12px', 'CSS class should apply padding');

  console.log('reverse_parser_smoke_test: OK');
};

run();
