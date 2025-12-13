document.addEventListener('DOMContentLoaded', function() {
    // Элементы страницы
    const getTicketBtn = document.getElementById('get-ticket-btn');
    const ticketDisplay = document.getElementById('ticket-display');
    const messageDiv = document.getElementById('message');
    const predictionContainer = document.getElementById('prediction');
    const predictionText = document.getElementById('prediction-text');
    const totalTicketsSpan = document.getElementById('total-tickets');
    const availableTicketsSpan = document.getElementById('available-tickets');
    
    // Иконки для категорий
    const categoryIcons = {
        beauty: '💄',
        values: '🖋️',
        sweet: '🍬',
        super: '👑'
    };
    
    // Цвета для категорий (для конфетти)
    const categoryColors = {
        beauty: ['#ff6b6b', '#ff8e53', '#ff4757'],
        values: ['#4ecdc4', '#44a08d', '#1dd1a1'],
        sweet: ['#ffd166', '#ff9a76', '#ffaf40'],
        super: ['#ffd700', '#ff9800', '#ff0000', '#ffff00']
    };
    
    // Загружаем статистику при загрузке страницы
    loadStats();
    
    // Обработчик кнопки "Получить билет"
    getTicketBtn.addEventListener('click', async function() {
        // Блокируем кнопку на время запроса
        getTicketBtn.disabled = true;
        getTicketBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Получаем билет...';
        
        // Показываем сообщение о загрузке
        showMessage('<i class="fas fa-search"></i> Ищем для вас идеальный билет...', 'info');
        
        // Скрываем предыдущее предсказание
        predictionContainer.style.display = 'none';
        
        try {
            // Отправляем запрос на сервер
            const response = await fetch('/api/get-ticket');
            const data = await response.json();
            
            if (data.success) {
                // Показываем полученный билет с анимацией
                showTicket(data);
                
                // Показываем предсказание
                showPrediction(data.prediction);
                
                // Показываем сообщение об успехе
                showMessage(data.message, 'success');
                
                // Запускаем конфетти в зависимости от категории
                createConfetti(data.type, data.isSuper);
                
                // Обновляем статистику
                loadStats();
                
                // Если это супер-билет - особые эффекты
                if (data.isSuper) {
                    specialEffectsForSuperTicket();
                }
            } else {
                // Показываем ошибку
                showMessage(data.message, 'error');
                
                if (data.message.includes('завершена')) {
                    getTicketBtn.disabled = true;
                    getTicketBtn.innerHTML = '<i class="fas fa-star"></i> Лотерея завершена';
                }
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage('<i class="fas fa-exclamation-triangle"></i> Ошибка соединения с сервером', 'error');
        } finally {
            // Разблокируем кнопку через 3 секунды
            setTimeout(() => {
                getTicketBtn.disabled = false;
                getTicketBtn.innerHTML = '<i class="fas fa-gift"></i> Получить билет';
            }, 3000);
        }
    });
    
    // Функция показа билета
    function showTicket(data) {
        const icon = categoryIcons[data.type] || '🎫';
        const ticketClass = data.isSuper ? 'super' : data.type;
        
        ticketDisplay.innerHTML = `
            <div class="ticket-reveal ticket ${ticketClass}">
                <div class="ticket-title">${icon} ${data.title}</div>
                <div class="ticket-number">${data.ticket}</div>
                ${data.isSuper ? '<div class="super-badge">✨ ВЕЗУНЧИК ГОДА ✨</div>' : ''}
                <div class="ticket-hint"><i class="fas fa-camera"></i> Сохраните этот номер!</div>
            </div>
        `;
        
        // Анимация для супер-билета
        if (data.isSuper) {
            const ticketElement = ticketDisplay.querySelector('.ticket');
            ticketElement.style.animation = 'superGlow 2s infinite alternate, ticketSlideIn 0.8s ease-out';
        }
    }
    
    // Функция показа предсказания
    function showPrediction(text) {
        predictionText.textContent = '';
        predictionContainer.style.display = 'block';
        
        // Эффект печатания текста
        let i = 0;
        const speed = 30; // скорость печати (мс на символ)
        
        function typeWriter() {
            if (i < text.length) {
                predictionText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }
        
        typeWriter();
    }
    
    // Функция показа сообщений
    function showMessage(text, type = 'info') {
        messageDiv.innerHTML = text;
        messageDiv.className = `message ${type}`;
        
        // Автоскрытие информационных сообщений
        if (type === 'info') {
            setTimeout(() => {
                if (messageDiv.className.includes('info')) {
                    messageDiv.style.opacity = '0';
                    setTimeout(() => {
                        messageDiv.innerHTML = '';
                        messageDiv.className = 'message';
                        messageDiv.style.opacity = '1';
                    }, 500);
                }
            }, 2000);
        }
    }
    
    // Функция загрузки статистики
    async function loadStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            totalTicketsSpan.textContent = data.total;
            availableTicketsSpan.textContent = data.available;
            
            // Если билетов нет, блокируем кнопку
            if (data.available === 0) {
                getTicketBtn.disabled = true;
                getTicketBtn.innerHTML = '<i class="fas fa-star"></i> Билеты закончились!';
                showMessage('<i class="fas fa-info-circle"></i> Все билеты разыграны. Спасибо за участие!', 'info');
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }
    
    // Функция создания конфетти
    function createConfetti(category, isSuper = false) {
        const colors = isSuper ? 
            categoryColors.super : 
            categoryColors[category] || categoryColors.beauty;
        
        const confettiCount = isSuper ? 300 : 150;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Случайные свойства
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 15 + 8;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 3 + 2;
            const delay = Math.random() * 0.5;
            
            // Форма конфетти
            const shapes = ['circle', 'rect', 'triangle'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            
            // Применяем стили
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.backgroundColor = color;
            confetti.style.left = `${left}%`;
            confetti.style.animation = `confetti-fall ${animationDuration}s ease-out ${delay}s forwards`;
            
            // Разные формы
            if (shape === 'circle') {
                confetti.style.borderRadius = '50%';
            } else if (shape === 'triangle') {
                confetti.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                confetti.style.backgroundColor = 'transparent';
                confetti.style.borderLeft = `${size/2}px solid transparent`;
                confetti.style.borderRight = `${size/2}px solid transparent`;
                confetti.style.borderBottom = `${size}px solid ${color}`;
                confetti.style.width = '0';
                confetti.style.height = '0';
            }
            
            // Добавляем на страницу
            document.body.appendChild(confetti);
            
            // Удаляем через 5 секунд
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, 5000);
        }
    }
    
    // Особые эффекты для супер-билета
    function specialEffectsForSuperTicket() {
        // Мигание всей карточки
        const lotteryCard = document.querySelector('.lottery-card');
        lotteryCard.style.borderColor = '#ffd700';
        
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            lotteryCard.style.borderColor = flashCount % 2 === 0 ? '#ff0000' : '#ffd700';
            flashCount++;
            
            if (flashCount > 10) {
                clearInterval(flashInterval);
                lotteryCard.style.borderColor = 'transparent';
            }
        }, 200);
        
        // Показываем особое сообщение
        setTimeout(() => {
            showMessage('<i class="fas fa-crown"></i> УРА! ВЫ ВЫИГРАЛИ СУПЕР-БИЛЕТ! УДАЧА НА ВАШЕЙ СТОРОНЕ!', 'success');
        }, 1000);
    }
    
    // Подсказка при наведении
    getTicketBtn.title = "Нажмите, чтобы получить уникальный лотерейный билет с предсказанием!";
    
    // Анимация снежинок в шапке
    const snowflakes = document.querySelector('.snowflakes-container');
    setInterval(() => {
        snowflakes.style.transform = `translateY(${Math.sin(Date.now() / 1000) * 10}px)`;
    }, 100);
});
