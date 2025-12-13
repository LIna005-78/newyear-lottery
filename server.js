const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

function loadTickets() {
  const data = fs.readFileSync(path.join(__dirname, 'tickets.json'), 'utf8');
  return JSON.parse(data);
}

function saveTickets(tickets) {
  fs.writeFileSync(
    path.join(__dirname, 'tickets.json'),
    JSON.stringify(tickets, null, 2),
    'utf8'
  );
}

app.get('/api/get-ticket', (req, res) => {
  try {
    const tickets = loadTickets();
    const availableTickets = tickets.filter(ticket => !ticket.used);
    
    if (availableTickets.length === 0) {
      return res.json({
        success: false,
        message: '🎅 Все билеты разыграны! Лотерея завершена.'
      });
    }
    
    const randomIndex = Math.floor(Math.random() * availableTickets.length);
    const chosenTicket = availableTickets[randomIndex];
    
    chosenTicket.used = true;
    saveTickets(tickets);
    
    res.json({
      success: true,
      ticket: chosenTicket.number,
      title: chosenTicket.title,
      type: chosenTicket.type,
      isSuper: chosenTicket.isSuper,
      prediction: chosenTicket.prediction,
      message: '🎉 Поздравляем! Вы получили билет!'
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
    res.json({
      success: false,
      message: '❌ Что-то пошло не так. Попробуйте позже.'
    });
  }
});

app.get('/api/stats', (req, res) => {
  const tickets = loadTickets();
  const total = tickets.length;
  const used = tickets.filter(t => t.used).length;
  const available = total - used;
  
  res.json({ total, used, available });
});

app.listen(PORT, () => {
  console.log(`🎄 Сервер новогодней лотереи запущен!`);
  console.log(`👉 Открой в браузере: http://localhost:${PORT}`);
  console.log(`📊 Всего билетов: 16 (15 обычных + 1 супер)`);
});
