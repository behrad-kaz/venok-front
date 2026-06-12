(function() {
  // ایجاد المان مخصوص ویجت
  const container = document.createElement('div');
  container.id = 'poshtibanyar-widget-container';
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });

  // تزریق استایل‌های Tailwind به صورت ایزوله
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
    
    :host { font-family: 'Tahoma', sans-serif; }
    .animate-slideUp {
      animation: slideUp 0.3s ease-out forwards;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    .pulse-animation {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `;
  shadow.appendChild(style);

  // وضعیت باز یا بسته بودن
  let isOpen = false;
  const mainColor = "#59d8c3"; // این مقدار را بعداً از API می‌گیرید

  const render = () => {
    shadow.innerHTML = '';
    shadow.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.setAttribute('dir', 'rtl');

    // --- بخش دکمه شناور ---
    const button = `
      <button id="toggle-btn" class="fixed left-6 bottom-6 shadow-2xl transition-all duration-200 hover:scale-105 z-50 group" 
              style="background-color: ${mainColor}; width: 64px; height: 64px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
        <div class="flex items-center justify-center w-full h-full text-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </div>
        <div class="absolute inset-0 rounded-full pulse-animation pointer-events-none" style="background-color: ${mainColor};"></div>
      </button>
    `;

    // --- بخش فرم (Modal) ---
    const modal = isOpen ? `
      <div class="fixed left-6 bottom-24 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-slideUp">
        <div class="p-5 text-white relative" style="background-color: ${mainColor};">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3 flex-1">
              <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-base truncate">آژانس مسافرتی سفر آسان</h3>
              </div>
            </div>
            <button id="close-btn" class="p-1.5 hover:bg-white/10 rounded-lg transition-colors border-none bg-transparent text-white cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <h2 class="font-bold text-base mb-1">چطور می‌تونیم کمکتون کنیم؟</h2>
          <p class="text-sm opacity-90">موضوع گفتگو را انتخاب کنید.</p>
        </div>
        <form class="p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">موضوع گفتگو *</label>
            <select class="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none">
              <option>انتخاب کنید</option>
              <option>مشکل پرداخت</option>
              <option>سوال قبل از خرید</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">شماره همراه *</label>
            <input type="tel" placeholder="۰۹۱۲۰۰۰۰۰۰۰" dir="ltr" class="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none">
          </div>
          <button type="submit" class="w-full py-3 rounded-xl text-white font-bold transition-all border-none cursor-pointer" style="background-color: ${mainColor};">
            شروع گفتگو
          </button>
          <p class="text-[10px] text-gray-400 text-center">لینک گفتگو از طریق پیامک ارسال می‌شود.</p>
        </form>
      </div>
    ` : '';

    wrapper.innerHTML = button + modal;
    shadow.appendChild(wrapper);

    // افزودن رویدادها
    shadow.querySelector('#toggle-btn').addEventListener('click', () => {
      isOpen = !isOpen;
      render();
    });
    if (isOpen) {
      shadow.querySelector('#close-btn').addEventListener('click', () => {
        isOpen = false;
        render();
      });
    }
  };

  render();
})();
