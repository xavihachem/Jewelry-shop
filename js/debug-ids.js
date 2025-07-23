// debug-ids.js
(function () {
  let debugMode = false;
  // Create the floating debug button
  const btn = document.createElement('button');
  btn.id = 'debug-ids-btn';
  btn.innerHTML = 'Show All IDs';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    padding: '12px 18px',
    background: '#8C907E',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  });
  document.body.appendChild(btn);

  // Helper: Copy to clipboard
  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const temp = document.createElement('input');
      document.body.appendChild(temp);
      temp.value = text;
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
  }

  // Insert styles for debug wrappers and labels
  function injectDebugWrapperStyle() {
    if (document.getElementById('debug-ids-style')) return;
    const style = document.createElement('style');
    style.id = 'debug-ids-style';
    style.textContent = `
      .debug-id-wrapper {
        position: relative !important;
        box-sizing: border-box !important;
        border: 2px solid red !important;
        z-index: 2147483646 !important;
        display: inherit !important;
      }
      .debug-id-label {
        position: absolute !important;
        left: 0;
        top: 0;
        background: red;
        color: #fff;
        font-size: 11px;
        font-weight: bold;
        padding: 2px 7px 2px 5px;
        border-radius: 0 0 6px 0;
        z-index: 2147483647 !important;
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0.9;
      }
      .debug-id-label.copied {
        background: #28a745 !important;
      }
      .debug-id-label .debug-id-copy-icon {
        font-size: 10px;
        margin-left: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  let debugWrappersVisible = false;
  // wrappers is only declared here, not again below
  let wrappers = [];

  // Compute nesting level for vertical offset
  function getNestingLevel(el) {
    let level = 0;
    let parent = el.parentElement;
    while (parent && parent !== document.body) {
      if (parent.hasAttribute('id')) level++;
      parent = parent.parentElement;
    }
    return level;
  }

  function showDebugWrappers() {
    injectDebugWrapperStyle();
    wrappers = [];
    const elements = Array.from(document.querySelectorAll('[id]'))
      .filter(el => {
        // Skip debug button, body, and html elements
        if (!el.id || el.id === 'debug-ids-btn' || el === document.body || el === document.documentElement) {
          return false;
        }
        return true;
      });

    elements.forEach(el => {
      // Skip if already wrapped or if element is not in the DOM
      if (!document.body.contains(el) || 
          (el.parentElement && el.parentElement.classList.contains('debug-id-wrapper'))) {
        return;
      }

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'debug-id-wrapper';
      
      // Preserve original display
      const originalDisplay = getComputedStyle(el).display;
      wrapper.style.display = originalDisplay === 'inline' ? 'inline-block' : originalDisplay;
      
      // Store original styles to restore later
      const originalPosition = el.style.position;
      const originalZIndex = el.style.zIndex;
      
      // Make sure the element can contain absolutely positioned labels
      el.style.position = 'relative';
      el.style.zIndex = '1';

      // Insert wrapper before the element and move element into wrapper
      if (el.parentNode) {
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);

        // Create label
        const label = document.createElement('div');
        label.className = 'debug-id-label';
        label.innerHTML = `<span>${el.id}</span><span class="debug-id-copy-icon">&#128203;</span>`;
        
        // Set vertical offset based on nesting
        const nestingLevel = getNestingLevel(el);
        label.style.top = `${nestingLevel * 18}px`;

        label.onclick = function (e) {
          e.stopPropagation();
          copyToClipboard(el.id);
          label.classList.add('copied');
          label.firstChild.textContent = 'Copied!';
          setTimeout(() => {
            label.classList.remove('copied');
            label.firstChild.textContent = el.id;
          }, 900);
        };

        wrapper.appendChild(label);
        
        // Store original styles and wrapper reference
        wrappers.push({ 
          wrapper, 
          el, 
          originalParent: el.parentNode,
          originalNextSibling: el.nextSibling,
          originalDisplay: originalDisplay,
          originalPosition: originalPosition,
          originalZIndex: originalZIndex
        });
      }
    });
    btn.innerHTML = 'Hide All IDs';
    debugWrappersVisible = true;
  }

  function hideDebugWrappers() {
    wrappers.forEach(({ wrapper, el, originalParent, originalNextSibling, originalDisplay, originalPosition, originalZIndex }) => {
      if (wrapper && wrapper.parentNode) {
        // Restore original styles
        if (el) {
          el.style.position = originalPosition;
          el.style.zIndex = originalZIndex;
          el.style.display = originalDisplay;
        }
        
        // Move element back to its original position
        if (originalParent) {
          if (originalNextSibling) {
            originalParent.insertBefore(el, originalNextSibling);
          } else {
            originalParent.appendChild(el);
          }
        }
        
        // Remove the wrapper
        wrapper.remove();
      }
    });
    
    wrappers = [];
    btn.innerHTML = 'Show All IDs';
    debugWrappersVisible = false;
  }

  btn.onclick = function () {
    if (!debugWrappersVisible) {
      showDebugWrappers();
    } else {
      hideDebugWrappers();
    }
  };

})();
