// (c) Dave Hulbert 2023

const iframe = document.getElementById('canvasIframe');

function debounce(func, delay) {
    let timer;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args), delay);
    };
}

const progress = (start, end, fraction) => {
        return start + (end - start) * fraction;
}

// unblur, alpha, perspective and rotation for 3D effect
const transformOnScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = document.documentElement.scrollTop;
    const scrollAmount = scrollTop / scrollHeight;

    const blurAmount = progress(10, 0, scrollAmount);
    const zoomFactor = progress(1.2, 1.5, scrollAmount);    
    const rotateXFactor = progress(20, 0, scrollAmount);  

    iframe.style.transformOrigin = 'bottom';
    iframe.style.filter = `blur(${blurAmount}px)`;
    iframe.style.transform = `perspective(500px) rotateX(${rotateXFactor}deg) scale(${zoomFactor})`;

    // Use hysteresis, like how a thermostat works
    iframe.style.zIndex = (scrollAmount > 0.9 || (iframe.style.zIndex == 0 && scrollAmount > 0.1)) ? 0 : -1;

    iframe.contentWindow.alpha = progress(0.17, 0.6, scrollAmount);
};

window.addEventListener('scroll', debounce(transformOnScroll, 10));
transformOnScroll();

