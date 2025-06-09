// Обновление времени и даты
function updateDateTime() {
    const now = new Date();
    
    // Форматирование времени
    const time = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Форматирование даты
    const date = now.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date;
}

// Обновление каждую секунду
setInterval(updateDateTime, 1000);
updateDateTime(); // Первоначальное обновление

// Управление напоминаниями
const reminderForm = document.getElementById('reminderForm');
const remindersList = document.getElementById('remindersList');
const reminderTextInput = document.getElementById('reminderText');
const reminderDateTimeInput = document.getElementById('reminderDateTime');

// Загрузка напоминаний из localStorage
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: 'Работа', color: '#e74c3c' },
    { id: 2, name: 'Личное', color: '#3498db' },
    { id: 3, name: 'Учёба', color: '#2ecc71' }
];

// DOM элементы
const categoryForm = document.getElementById('categoryForm');
const categoryNameInput = document.getElementById('categoryName');
const categoryColorInput = document.getElementById('categoryColor');
const categoriesList = document.getElementById('categoriesList');
const categoryFilter = document.getElementById('categoryFilter');
const reminderCategory = document.getElementById('reminderCategory');
const soundAdd = document.getElementById('sound-add');
const soundDelete = document.getElementById('sound-delete');
const authBtn = document.getElementById('authBtn');
const authDropdown = document.getElementById('authDropdown');

// --- Группы ---
const groupForm = document.getElementById('groupForm');
const groupNameInput = document.getElementById('groupNameInput');
const groupsList = document.getElementById('groupsList');
const myGroupSection = document.getElementById('myGroupSection');
const myGroupName = document.getElementById('myGroupName');
const leaveGroupBtn = document.getElementById('leaveGroupBtn');
const groupReminderForm = document.getElementById('groupReminderForm');
const groupReminderText = document.getElementById('groupReminderText');
const groupReminderDateTime = document.getElementById('groupReminderDateTime');
const groupRemindersList = document.getElementById('groupRemindersList');

// --- Переключатель темы ---
const themeToggle = document.getElementById('themeToggle');
themeToggle.style.position = 'fixed';
themeToggle.style.left = '32px';
themeToggle.style.right = '';
themeToggle.style.bottom = '32px';
themeToggle.style.top = '';
const themeIcon = themeToggle.querySelector('i');
function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        document.body.classList.remove('light');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    localStorage.setItem('theme', theme);
}
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);
themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light');
    setTheme(isLight ? 'dark' : 'light');
});

// Отображение напоминаний
function displayReminders() {
    remindersList.innerHTML = '';
    reminders.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    reminders.forEach((reminder, index) => {
        const reminderElement = document.createElement('div');
        reminderElement.className = 'reminder-item';
        
        const reminderDate = new Date(reminder.datetime);
        const formattedDate = reminderDate.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        reminderElement.innerHTML = `
            <div>
                <strong>${reminder.text}</strong>
                <div>${formattedDate}</div>
            </div>
            <button onclick="deleteReminder(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        remindersList.appendChild(reminderElement);
    });
}

// Функции для работы с категориями
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

function addCategory(name, color) {
    const newCategory = {
        id: Date.now(),
        name,
        color
    };
    categories.push(newCategory);
    saveCategories();
    renderCategories();
    updateCategorySelects();
}

function deleteCategory(id) {
    categories = categories.filter(category => category.id !== id);
    saveCategories();
    renderCategories();
    updateCategorySelects();
}

function renderCategories() {
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.innerHTML = `
            <div class="category-color" style="background-color: ${category.color}"></div>
            <span>${category.name}</span>
            <button class="delete-btn" onclick="deleteCategory(${category.id})">
                <i class="fas fa-times"></i>
            </button>
        `;
        categoriesList.appendChild(categoryElement);
    });
}

function updateCategorySelects() {
    const options = categories.map(category => 
        `<option value="${category.id}">${category.name}</option>`
    ).join('');
    
    categoryFilter.innerHTML = '<option value="all">Все категории</option>' + options;
    reminderCategory.innerHTML = '<option value="">Выберите категорию</option>' + options;
}

// Функция для показа toast-уведомления
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Обновляем обработчик формы напоминаний
reminderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = reminderTextInput.value.trim();
    const dateTime = reminderDateTimeInput.value;
    const categoryId = reminderCategory.value;
    
    if (text && dateTime && categoryId) {
        const reminder = {
            id: Date.now(),
            text,
            dateTime,
            categoryId: parseInt(categoryId),
            completed: false,
            notified: false
        };
        
        reminders.push(reminder);
        saveReminders();
        renderReminders();
        reminderForm.reset();
        
        // Показываем уведомление
        showToast('Напоминание успешно добавлено!');
        if (soundAdd) soundAdd.currentTime = 0, soundAdd.play();
    }
});

// Обновляем обработчик формы категорий
categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = categoryNameInput.value.trim();
    const color = categoryColorInput.value;
    
    if (name) {
        addCategory(name, color);
        categoryNameInput.value = '';
        showToast('Категория успешно добавлена!');
    }
});

// Обновляем функцию отрисовки напоминаний
function renderReminders() {
    const selectedCategory = categoryFilter.value;
    const filteredReminders = selectedCategory === 'all' 
        ? reminders 
        : reminders.filter(reminder => reminder.categoryId === parseInt(selectedCategory));
    
    remindersList.innerHTML = '';
    filteredReminders.forEach(reminder => {
        const category = categories.find(cat => cat.id === reminder.categoryId);
        const reminderElement = document.createElement('div');
        reminderElement.className = `reminder-item ${reminder.completed ? 'completed' : ''}`;
        reminderElement.innerHTML = `
            <div class="reminder-content">
                <div class="category-color" style="background-color: ${category.color}"></div>
                <span class="reminder-text">${reminder.text}</span>
                <span class="reminder-datetime">${formatDateTime(reminder.dateTime)}</span>
            </div>
            <div class="reminder-actions">
                <button class="complete-btn" onclick="toggleComplete(${reminder.id})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="delete-btn" onclick="deleteReminder(${reminder.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        remindersList.appendChild(reminderElement);
    });
}

// Обработчик изменения фильтра категорий
categoryFilter.addEventListener('change', renderReminders);

// Инициализация
renderCategories();
updateCategorySelects();
renderReminders();

// Удаление напоминания
function deleteReminder(id) {
    const reminderElement = Array.from(document.querySelectorAll('.reminder-item')).find(el => {
        return el.querySelector('.reminder-actions button.delete-btn')?.onclick?.toString().includes(id);
    });
    if (reminderElement) {
        reminderElement.classList.add('removing');
        setTimeout(() => {
            reminders = reminders.filter(reminder => reminder.id !== id);
            saveReminders();
            renderReminders();
            if (soundDelete) soundDelete.currentTime = 0, soundDelete.play();
        }, 350);
    } else {
        reminders = reminders.filter(reminder => reminder.id !== id);
        saveReminders();
        renderReminders();
        if (soundDelete) soundDelete.currentTime = 0, soundDelete.play();
    }
}

// Запрос разрешения на уведомления при загрузке
if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
}

// Функция для озвучивания текста
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        window.speechSynthesis.speak(utterance);
    }
}

// Проверка напоминаний каждые 10 секунд
setInterval(() => {
    const now = new Date();
    reminders.forEach(reminder => {
        const reminderTime = new Date(reminder.dateTime);
        if (
            reminderTime - now < 60000 &&
            reminderTime - now > 0 &&
            !reminder.notified
        ) {
            // Push-уведомление
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Напоминание', {
                    body: reminder.text,
                    icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
                });
            }
            // Озвучка
            speakText('Напоминание: ' + reminder.text);

            // Помечаем, что уже уведомили
            reminder.notified = true;
            saveReminders();
        }
    });
}, 10000);

// Первоначальное отображение напоминаний
displayReminders();

function saveReminders() {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

authBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    authDropdown.style.display = authDropdown.style.display === 'flex' ? 'none' : 'flex';
});
document.addEventListener('click', (e) => {
    if (authDropdown.style.display === 'flex') {
        authDropdown.style.display = 'none';
    }
});

function toggleComplete(id) {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        reminder.completed = !reminder.completed;
        saveReminders();
        renderReminders();
    }
}

function getGroups() {
    return JSON.parse(localStorage.getItem('groups') || '[]');
}
function setGroups(groups) {
    localStorage.setItem('groups', JSON.stringify(groups));
}
function getGroupReminders() {
    return JSON.parse(localStorage.getItem('groupReminders') || '[]');
}
function setGroupReminders(reminders) {
    localStorage.setItem('groupReminders', JSON.stringify(reminders));
}
function getMyGroup() {
    const user = getUser();
    if (!user) return null;
    const groups = getGroups();
    return groups.find(g => g.users.includes(user.nickname));
}
function renderGroups() {
    const user = getUser();
    const groups = getGroups();
    groupsList.innerHTML = '';
    groups.forEach(group => {
        const inGroup = user && group.users.includes(user.nickname);
        const canJoin = !inGroup && group.users.length < 3 && !getMyGroup();
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-item';
        groupDiv.innerHTML = `
            <span><b>${group.name}</b></span>
            <span class="group-users">${group.users.length}/3</span>
            ${canJoin ? '<button class="join-btn">Войти в группу</button>' : ''}
            ${inGroup ? '<span style="color:#4ecca3;">Вы участник</span>' : ''}
        `;
        if (canJoin) {
            groupDiv.querySelector('.join-btn').onclick = () => joinGroup(group.name);
        }
        groupsList.appendChild(groupDiv);
    });
    renderMyGroup();
}
function renderMyGroup() {
    const user = getUser();
    const group = getMyGroup();
    if (user && group) {
        myGroupSection.style.display = '';
        myGroupName.textContent = group.name;
        renderGroupReminders(group.name);
    } else {
        myGroupSection.style.display = 'none';
    }
}
groupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = groupNameInput.value.trim();
    if (!name) return false;
    let groups = getGroups();
    if (groups.find(g => g.name === name)) {
        showToast('Группа с таким названием уже существует!');
        return false;
    }
    const user = getUser();
    if (!user) {
        showToast('Сначала войдите в аккаунт!');
        return false;
    }
    if (getMyGroup()) {
        showToast('Вы уже в группе!');
        return false;
    }
    groups.push({name, users: [user.nickname]});
    setGroups(groups);
    renderGroups();
    groupNameInput.value = '';
    return false;
});
function joinGroup(name) {
    const user = getUser();
    if (!user) return;
    let groups = getGroups();
    if (getMyGroup()) return;
    const group = groups.find(g => g.name === name);
    if (group && group.users.length < 3 && !group.users.includes(user.nickname)) {
        group.users.push(user.nickname);
        setGroups(groups);
        renderGroups();
    }
}
leaveGroupBtn.addEventListener('click', () => {
    const user = getUser();
    if (!user) return;
    let groups = getGroups();
    groups.forEach(g => {
        g.users = g.users.filter(u => u !== user.nickname);
    });
    setGroups(groups.filter(g => g.users.length > 0));
    renderGroups();
});
function renderGroupReminders(groupName) {
    const groupReminders = getGroupReminders().filter(r => r.group === groupName);
    groupRemindersList.innerHTML = '';
    groupReminders.forEach(reminder => {
        const el = document.createElement('div');
        el.className = 'reminder-item';
        el.innerHTML = `
            <div class="reminder-content">
                <span class="reminder-text">${reminder.text}</span>
                <span class="reminder-datetime">${formatDateTime(reminder.dateTime)}</span>
                <span style="color:#4ecca3;font-size:0.95em;">от ${reminder.author}</span>
            </div>
        `;
        groupRemindersList.appendChild(el);
    });
}
groupReminderForm.addEventListener('submit', e => {
    e.preventDefault();
    const user = getUser();
    const group = getMyGroup();
    if (!user || !group) return;
    const text = groupReminderText.value.trim();
    const dateTime = groupReminderDateTime.value;
    if (!text || !dateTime) return;
    let groupReminders = getGroupReminders();
    groupReminders.push({
        id: Date.now(),
        group: group.name,
        text,
        dateTime,
        author: user.nickname,
        notified: [] // список никнеймов, кто уже получил уведомление
    });
    setGroupReminders(groupReminders);
    renderGroupReminders(group.name);
    groupReminderForm.reset();
});
setInterval(() => {
    const user = getUser();
    const group = getMyGroup();
    if (!user || !group) return;
    let groupReminders = getGroupReminders();
    let changed = false;
    groupReminders.forEach(reminder => {
        if (reminder.group !== group.name) return;
        const reminderTime = new Date(reminder.dateTime);
        const now = new Date();
        if (
            reminderTime - now < 60000 &&
            reminderTime - now > 0 &&
            !reminder.notified.includes(user.nickname)
        ) {
            // Push-уведомление
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Групповое напоминание', {
                    body: reminder.text,
                    icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
                });
            }
            // Озвучка
            speakText('Групповое напоминание: ' + reminder.text);
            // Telegram
            if (user.telegram) {
                sendTelegramReminder(user.telegram, reminder.text);
            }
            reminder.notified.push(user.nickname);
            changed = true;
        }
    });
    if (changed) setGroupReminders(groupReminders);
}, 10000);
renderGroups();

// --- Регистрация ---
const registerForm = document.getElementById('registerForm');
const registerNickname = document.getElementById('registerNickname');
const registerPassword = document.getElementById('registerPassword');
const registerTelegram = document.getElementById('registerTelegram');
const siteRegister = document.getElementById('siteRegister');
const siteLogin = document.getElementById('siteLogin');
const registerModal = document.getElementById('registerModal');
const loginModal = document.getElementById('loginModal');

siteRegister.addEventListener('click', function(e) {
    e.preventDefault();
    registerModal.classList.add('show');
});
siteLogin.addEventListener('click', function(e) {
    e.preventDefault();
    loginModal.classList.add('show');
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nickname = registerNickname.value.trim();
    const password = registerPassword.value;
    const telegram = registerTelegram.value.trim();
    if (!nickname || !password) {
        showToast('Введите никнейм и пароль!');
        return;
    }
    let regUsers = JSON.parse(localStorage.getItem('regUsers') || '[]');
    if (regUsers.find(u => u.nickname.toLowerCase() === nickname.toLowerCase())) {
        showToast('Пользователь с таким никнеймом уже существует!');
        return;
    }
    regUsers.push({nickname, password, telegram});
    localStorage.setItem('regUsers', JSON.stringify(regUsers));
    showToast('Регистрация успешна!');
    registerForm.reset();
    // showUserUI({nickname, telegram}); // если нужно сразу авторизовать
});
// --- Вход ---
loginForm.onsubmit = function(e) {
    e.preventDefault();
    const nickname = loginNickname.value.trim();
    const password = loginPassword.value;
    let regUsers = JSON.parse(localStorage.getItem('regUsers') || '[]');
    const found = regUsers.find(u => u.nickname === nickname && u.password === password);
    if (found) {
        setUser({nickname, telegram: found.telegram});
        showUserUI({nickname, telegram: found.telegram});
        loginModal.classList.remove('show');
        loginForm.reset();
        renderGroups();
    } else {
        showToast('Неверный никнейм или пароль!');
    }
};

function getUser() {
    return JSON.parse(localStorage.getItem('user'));
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}
