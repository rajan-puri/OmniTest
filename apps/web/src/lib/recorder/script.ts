export function generateStableSelectorScript(): string {
  return `
(function() {
  if (window.__omnitest_recorder_injected) return;
  window.__omnitest_recorder_injected = true;

  function getStableSelector(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';

    // 1. data-testid or data-test or data-cy attributes (highest stability)
    for (const attr of ['data-testid', 'data-test', 'data-cy', 'data-qa', 'data-qa-id']) {
      const val = el.getAttribute(attr);
      if (val) return \`[\${attr}="\${val}"]\`;
    }

    // 2. id attribute (if not dynamically generated with numbers/random UUIDs)
    if (el.id && !/\\d{4,}/.test(el.id) && !/^[0-9a-f-]{16,}$/i.test(el.id)) {
      return \`#\${CSS.escape(el.id)}\`;
    }

    // 3. Name attribute for form controls
    const name = el.getAttribute('name');
    if (name && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
      return \`\${el.tagName.toLowerCase()}[name="\${name}"]\`;
    }

    // 4. Aria label or role
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) {
      return \`\${el.tagName.toLowerCase()}[aria-label="\${ariaLabel}"]\`;
    }

    // 5. Placeholder for inputs
    const placeholder = el.getAttribute('placeholder');
    if (placeholder && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      return \`\${el.tagName.toLowerCase()}[placeholder="\${placeholder}"]\`;
    }

    // 6. Button/Link or specific text content if short & meaningful
    const tag = el.tagName.toLowerCase();
    if (tag === 'button' || tag === 'a' || tag === 'summary') {
      const text = (el.innerText || el.textContent || '').trim().replace(/\\s+/g, ' ');
      if (text && text.length <= 40 && !/[\\n\\r]/.test(text)) {
        // Can be queried via has-text in Playwright
        return \`\${tag}:has-text("\${text.replace(/"/g, '\\\\"')}")\`;
      }
    }

    // 7. Input with type
    if (tag === 'input') {
      const type = el.getAttribute('type') || 'text';
      return \`input[type="\${type}"]\`;
    }

    // 8. Meaningful semantic tags
    if (['h1', 'h2', 'h3', 'header', 'nav', 'main', 'footer', 'form'].includes(tag)) {
      return tag;
    }

    // 9. Semantic class or ancestor fallback
    const classes = Array.from(el.classList || []).filter(c => 
      !c.startsWith('css-') && 
      !c.startsWith('style_') && 
      !/^[a-z0-9_-]{10,}$/i.test(c) &&
      !c.includes(':') &&
      !c.includes('/')
    );
    if (classes.length > 0) {
      return \`\${tag}.\${CSS.escape(classes[0])}\`;
    }

    return tag;
  }

  // Intercept clicks
  document.addEventListener('click', function(e) {
    try {
      const target = e.target;
      if (!target) return;
      const selector = getStableSelector(target);
      const text = (target.innerText || target.textContent || '').trim().slice(0, 50);
      window.__omnitest_dispatch_event({
        action: 'click',
        target: selector,
        value: text,
      });
    } catch (err) {
      console.error('OmniTest recorder click capture error:', err);
    }
  }, true);

  // Intercept inputs (change or input)
  document.addEventListener('change', function(e) {
    try {
      const target = e.target;
      if (!target) return;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const selector = getStableSelector(target);
        const value = target.value;
        // Don't record password plain values directly for security
        const isPassword = target.type === 'password';
        window.__omnitest_dispatch_event({
          action: 'fill',
          target: selector,
          value: isPassword ? '••••••••' : value,
        });
      }
    } catch (err) {
      console.error('OmniTest recorder input capture error:', err);
    }
  }, true);

  // Intercept special key presses (Enter, Escape, Tab)
  document.addEventListener('keydown', function(e) {
    try {
      if (['Enter', 'Escape', 'Tab'].includes(e.key)) {
        window.__omnitest_dispatch_event({
          action: 'press',
          target: e.key,
        });
      }
    } catch (err) {
      console.error('OmniTest recorder keydown capture error:', err);
    }
  }, true);

  // Injected notification badge in page to inform developer recording is active
  const banner = document.createElement('div');
  banner.id = '__omnitest_recording_banner';
  banner.style.position = 'fixed';
  banner.style.bottom = '16px';
  banner.style.right = '16px';
  banner.style.zIndex = '2147483647';
  banner.style.backgroundColor = '#090d16';
  banner.style.color = '#38bdf8';
  banner.style.border = '1px solid rgba(56, 189, 248, 0.4)';
  banner.style.borderRadius = '9999px';
  banner.style.padding = '8px 16px';
  banner.style.fontFamily = 'monospace';
  banner.style.fontSize = '12px';
  banner.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';
  banner.style.display = 'flex';
  banner.style.alignItems = 'center';
  banner.style.gap = '8px';
  banner.style.pointerEvents = 'none';
  banner.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background-color: #ef4444; animation: pulse 1.5s infinite;"></span> OmniTest Recording Active';
  document.body.appendChild(banner);
})();
`;
}
