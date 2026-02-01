// DOM helper utilities

export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}

export function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                el.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key === 'html') {
            el.innerHTML = value;
        } else {
            el.setAttribute(key, value);
        }
    });

    if (typeof children === 'string') {
        el.textContent = children;
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                el.appendChild(child);
            }
        });
    }

    return el;
}

export function html(strings, ...values) {
    const template = document.createElement('template');
    template.innerHTML = strings.reduce((acc, str, i) => {
        const value = values[i] !== undefined ? values[i] : '';
        return acc + str + value;
    }, '').trim();
    return template.content.firstChild;
}

export function render(container, content) {
    if (typeof content === 'string') {
        container.innerHTML = content;
    } else if (content instanceof Node) {
        container.innerHTML = '';
        container.appendChild(content);
    }
}

export function show(element) {
    element.classList.remove('hidden');
}

export function hide(element) {
    element.classList.add('hidden');
}

export function toggle(element, show) {
    if (show === undefined) {
        element.classList.toggle('hidden');
    } else {
        element.classList.toggle('hidden', !show);
    }
}

export function addClass(element, ...classes) {
    element.classList.add(...classes);
}

export function removeClass(element, ...classes) {
    element.classList.remove(...classes);
}

export function on(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
}

export function delegate(parent, selector, event, handler) {
    return on(parent, event, (e) => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) {
            handler(e, target);
        }
    });
}

export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
