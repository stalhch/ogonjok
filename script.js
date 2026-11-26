document.addEventListener('DOMContentLoaded', function () {

    // ---------- 1. Мобильное меню ----------
    var burger = document.getElementById('burger');
    var nav = document.getElementById('main-nav');
    if (burger && nav) {
        burger.addEventListener('click', function () {
            nav.classList.toggle('open');
            burger.setAttribute('aria-expanded', nav.classList.contains('open'));
        });
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ---------- 2. Активный пункт навигации ----------
    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(function (link) {
        if (link.getAttribute('href') === current) link.classList.add('active');
    });

    // ---------- 3. Меню и корзина на contacts.html ----------
    var picker = document.getElementById('menu-picker');
    if (!picker) return;

    var catalog = {
        burgers: [
            { name: 'Классический бургер', price: 290, img: 'burger-classic.jpg' },
            { name: 'Угольный бургер',     price: 340, img: 'burger-ugol.jpg' },
            { name: 'Куриный бургер',      price: 270, img: 'burger-chicken.jpg' },
            { name: 'Чизбургер',           price: 310, img: 'burger-cheese.jpg' }
        ],
        shaurma: [
            { name: 'Шаурма с курицей',    price: 260, img: 'shaurma-chicken.jpg' },
            { name: 'Шаурма с говядиной',  price: 310, img: 'shaurma-beef.jpg' },
            { name: 'Ролл «Цезарь»',       price: 280, img: 'roll-caesar.jpg' },
            { name: 'Ролл с лососем',      price: 350, img: 'roll-salmon.jpg' }
        ],
        snacks: [
            { name: 'Картофель фри',            price: 150, img: 'fries.jpg' },
            { name: 'Картофель по-деревенски',  price: 170, img: 'potato-wedges.jpg' },
            { name: 'Луковые кольца',           price: 160, img: 'onion-rings.jpg' },
            { name: 'Наггетсы, 6 шт',           price: 190, img: 'nuggets.jpg' },
            { name: 'Сырные палочки',           price: 210, img: 'cheese-sticks.jpg' }
        ],
        drinks: [
            { name: 'Лимонад «Цитрус»',  price: 180, img: 'lemonade-citrus.jpg' },
            { name: 'Лимонад «Ягода»',   price: 190, img: 'lemonade-berry.jpg' },
            { name: 'Молочный коктейль', price: 210, img: 'milkshake.jpg' },
            { name: 'Американо',         price: 120, img: 'americano.jpg' },
            { name: 'Капучино',          price: 160, img: 'cappuccino.jpg' },
            { name: 'Латте',             price: 180, img: 'latte.jpg' }
        ],
        desserts: [
            { name: 'Чизкейк',   price: 220, img: 'cheesecake.jpg' },
            { name: 'Брауни',    price: 200, img: 'brownie.jpg' },
            { name: 'Мороженое', price: 120, img: 'ice-cream.jpg' },
            { name: 'Маффин',    price: 150, img: 'muffin.jpg' }
        ]
    };

    var CART_KEY = 'ogonjok_cart';
    var cart = {};
    try {
        cart = JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch (e) {
        cart = {};
    }

    var currentCat = 'burgers';
    var pickerEl       = document.getElementById('menu-picker');
    var cartItemsEl    = document.getElementById('cart-items');
    var cartCountEl    = document.getElementById('cart-count');
    var cartTotalEl    = document.getElementById('cart-total');
    var cartEmptyEl    = document.getElementById('cart-empty');
    var orderSummaryEl = document.getElementById('order-summary');
    var orderResultEl  = document.getElementById('order-result');
    var orderForm      = document.getElementById('order-form');
    var catTabs        = document.querySelectorAll('.cat-tab');

    function renderPicker() {
        var items = catalog[currentCat] || [];
        pickerEl.innerHTML = items.map(function (item) {
            var inCart = cart[item.name] ? cart[item.name].qty : 0;
            return (
                '<div class="pick-row">' +
                    '<img src="images/' + item.img + '" alt="' + item.name + '">' +
                    '<div class="pick-info">' +
                        '<div class="pick-name">' + item.name + '</div>' +
                        '<div class="pick-price">' + item.price + ' ₽</div>' +
                    '</div>' +
                    '<div class="pick-controls">' +
                        '<button type="button" class="qty-minus" data-name="' + item.name + '">−</button>' +
                        '<input type="text" readonly value="' + inCart + '" class="qty-value">' +
                        '<button type="button" class="qty-plus" data-name="' + item.name + '">+</button>' +
                    '</div>' +
                '</div>'
            );
        }).join('');

        pickerEl.querySelectorAll('.qty-plus').forEach(function (btn) {
            btn.addEventListener('click', function () {
                changeQty(btn.getAttribute('data-name'), 1);
            });
        });
        pickerEl.querySelectorAll('.qty-minus').forEach(function (btn) {
            btn.addEventListener('click', function () {
                changeQty(btn.getAttribute('data-name'), -1);
            });
        });
    }

    function findItem(name) {
        for (var cat in catalog) {
            for (var i = 0; i < catalog[cat].length; i++) {
                if (catalog[cat][i].name === name) return catalog[cat][i];
            }
        }
        return null;
    }

    function changeQty(name, delta) {
        var item = findItem(name);
        if (!item) return;

        var entry = cart[name] || { qty: 0, price: item.price };
        entry.qty += delta;

        if (entry.qty <= 0) {
            delete cart[name];
        } else {
            cart[name] = entry;
        }

        saveCart();
        renderPicker();
        renderCart();
    }

    function saveCart() {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    }

    function renderCart() {
        var names = Object.keys(cart);
        var count = 0;
        var total = 0;
        var html = '';

        names.forEach(function (name) {
            var row = cart[name];
            var sum = row.price * row.qty;
            count += row.qty;
            total += sum;
            html +=
                '<div class="cart-row">' +
                    '<div class="cart-name">' + name + '</div>' +
                    '<div class="cart-qty">× ' + row.qty + '</div>' +
                    '<div class="cart-sum">' + sum + ' ₽</div>' +
                '</div>';
        });

        cartItemsEl.innerHTML = html;
        cartCountEl.textContent = count + ' шт.';
        cartTotalEl.textContent = total + ' ₽';
        cartEmptyEl.style.display = names.length === 0 ? 'block' : 'none';

        if (names.length === 0) {
            orderSummaryEl.value = '';
        } else {
            var lines = [];
            names.forEach(function (name) {
                lines.push(name + ' × ' + cart[name].qty + ' = ' + (cart[name].price * cart[name].qty) + ' ₽');
            });
            lines.push('—');
            lines.push('Итого: ' + total + ' ₽');
            orderSummaryEl.value = lines.join('\n');
        }
    }

    catTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            catTabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentCat = tab.getAttribute('data-cat');
            renderPicker();
        });
    });

    var clearBtn = document.getElementById('cart-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            cart = {};
            saveCart();
            renderPicker();
            renderCart();
        });
    }

    renderPicker();
    renderCart();

    // ---------- 4. Отправка формы ----------
    orderForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (Object.keys(cart).length === 0) {
            orderResultEl.style.display = 'block';
            orderResultEl.className = 'notice error';
            orderResultEl.textContent = 'Добавьте хотя бы одну позицию в корзину.';
            return;
        }

        orderResultEl.style.display = 'block';
        orderResultEl.className = 'notice';
        orderResultEl.textContent = 'Отправляем…';

        var submitBtn = orderForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        var data = new FormData(orderForm);

        fetch(orderForm.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        })
        .then(function (response) { return response.json(); })
        .then(function (json) {
            if (json.success) {
                orderResultEl.className = 'notice success';
                orderResultEl.textContent = 'Заказ принят. Мы свяжемся с вами в ближайшее время.';
                orderForm.reset();
                cart = {};
                saveCart();
                renderPicker();
                renderCart();
            } else {
                orderResultEl.className = 'notice error';
                orderResultEl.textContent = 'Не удалось отправить заказ. Попробуйте позже.';
            }
        })
        .catch(function () {
            orderResultEl.className = 'notice error';
            orderResultEl.textContent = 'Не удалось отправить заказ. Проверьте соединение.';
        })
        .finally(function () {
            submitBtn.disabled = false;
        });
    });
});