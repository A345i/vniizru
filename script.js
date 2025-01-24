let allProducts = []; // Глобальная переменная для хранения всех товаров

// Загрузка данных из JSON-файла
async function loadProducts() {
    try {
        const response = await fetch('data/products_with_categories.json');
        allProducts = await response.json();
        displayCategories(allProducts);
        populateSidebar(allProducts);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Отображение категорий и товаров
function displayCategories(products, selectedCategory = null) {
    const container = document.getElementById('categories-container');
    if (!container) {
        console.error('Контейнер для категорий не найден.');
        return;
    }
    container.innerHTML = ''; // Очистка контейнера

    // Фильтрация по поисковому запросу
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.TovName.toLowerCase().includes(searchQuery)
    );

    // Группировка товаров по категориям
    const categories = {};
    filteredProducts.forEach(product => {
        product.Categories.forEach(category => {
            if (!categories[category.CatName]) {
                categories[category.CatName] = [];
            }
            categories[category.CatName].push(product);
        });
    });

    // Создание карточек для каждой категории
    for (const [categoryName, productsInCategory] of Object.entries(categories)) {
        if (selectedCategory && selectedCategory !== categoryName) {
            continue; // Пропускаем категории, которые не выбраны
        }

        const categoryId = categoryName
            .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
            .replace(/[^a-zA-Z0-9-]/g, ''); // Удаляем все символы, кроме букв, цифр и дефисов

        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';

        categoryCard.innerHTML = `
            <h3 class="category-title">${categoryName}</h3>
            <div class="product-list" id="category-${categoryId}">
                <!-- Товары будут загружены сюда -->
            </div>
        `;

        container.appendChild(categoryCard);

        // Отображение товаров в категории
        const productList = categoryCard.querySelector(`#category-${categoryId}`);
        if (!productList) {
            console.error(`Список товаров для категории "${categoryName}" не найден.`);
            continue;
        }

        productsInCategory.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';

            productItem.innerHTML = `
                <img src="tovarImg/${product.TovPhotoLink || 'default.jpg'}" alt="${product.TovName}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${product.TovName}</div>
                    <div class="product-price">${product.TovPsevdoPrice || 'Цена не указана'}</div>
                </div>
            `;

            productItem.addEventListener('click', () => openProductModal(product));
            productList.appendChild(productItem);
        });
    }
}

// Заполнение боковой панели категориями
function populateSidebar(products) {
    const sidebar = document.getElementById('categories-sidebar');
    if (!sidebar) {
        console.error('Боковая панель не найдена.');
        return;
    }

    // Получаем уникальные категории
    const categories = new Set();
    products.forEach(product => {
        product.Categories.forEach(category => {
            categories.add(category.CatName);
        });
    });

    // Добавляем категории в боковую панель
    categories.forEach(category => {
        const categoryItem = document.createElement('li');
        categoryItem.className = 'list-group-item';
        categoryItem.textContent = category;

        categoryItem.addEventListener('click', () => {
            // Убираем активный класс у всех элементов
            document.querySelectorAll('#categories-sidebar .list-group-item').forEach(item => {
                item.classList.remove('active');
            });
            // Добавляем активный класс к выбранной категории
            categoryItem.classList.add('active');
            // Фильтруем товары по выбранной категории
            displayCategories(allProducts, category);
        });

        sidebar.appendChild(categoryItem);
    });

    // Добавляем пункт "Все категории"
    const allCategoriesItem = document.createElement('li');
    allCategoriesItem.className = 'list-group-item active';
    allCategoriesItem.textContent = 'Все категории';

    allCategoriesItem.addEventListener('click', () => {
        // Убираем активный класс у всех элементов
        document.querySelectorAll('#categories-sidebar .list-group-item').forEach(item => {
            item.classList.remove('active');
        });
        // Добавляем активный класс к "Все категории"
        allCategoriesItem.classList.add('active');
        // Отображаем все товары
        displayCategories(allProducts);
    });

    sidebar.prepend(allCategoriesItem);
}

// Открытие модального окна с детальной информацией о товаре
function openProductModal(product) {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalImage = document.getElementById('modal-product-image');
    modalImage.src = `tovarImg/${product.TovPhotoLink || 'default.jpg'}`;
    modalImage.style.maxWidth = '100%'; // Ограничение ширины изображения
    modalImage.style.maxHeight = '300px'; // Ограничение высоты изображения
    document.getElementById('modal-product-name').textContent = product.TovName;
    document.getElementById('modal-product-description').innerHTML = product.TovDescription || 'Описание отсутствует';
    document.getElementById('modal-product-price').textContent = product.TovPsevdoPrice || 'Цена не указана';
    document.getElementById('modal-product-categories').textContent = product.Categories.map(cat => cat.CatName).join(', ');
    modal.show();
}

// Управление боковой панелью на мобильных устройствах
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarToggle = document.getElementById('sidebar-toggle');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
    document.body.classList.toggle('sidebar-open'); // Блокировка прокрутки
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.classList.remove('sidebar-open'); // Разблокировка прокрутки
});

// Обработчик поиска
document.getElementById('searchInput').addEventListener('input', () => {
    // Сбрасываем активную категорию
    document.querySelectorAll('#categories-sidebar .list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('#categories-sidebar li:first-child').classList.add('active');

    // Обновляем отображение товаров
    displayCategories(allProducts);
});

// Запуск загрузки данных при загрузке страницы
document.addEventListener('DOMContentLoaded', loadProducts);