class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
        this.history = JSON.parse(localStorage.getItem('calc-history')) || [];
        this.renderHistory();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && operation !== '-') return;
        
        // Handle negative numbers at start
        if (this.currentOperand === '0' && operation === '-') {
            this.currentOperand = '-';
            return;
        }

        if (operation === '%') {
            this.computePercentage();
            return;
        }

        if (this.previousOperand !== '') {
            this.compute();
        }
        
        // Replace visual multiply/divide with standard symbols for logic, but keep visual for display
        let op = operation;
        if (operation === '×') op = '*';
        if (operation === '÷') op = '/';

        this.operation = op;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    computePercentage() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    alert("0으로 나눌 수 없습니다.");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle float precision issues
        computation = Math.round(computation * 10000000000) / 10000000000;
        
        const expression = `${this.getDisplayNumber(this.previousOperand)} ${this.getOperationSymbol(this.operation)} ${this.getDisplayNumber(this.currentOperand)}`;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';

        this.addHistory(expression, this.currentOperand);
        
        // Add animation class
        this.currentOperandTextElement.classList.remove('calc-pop');
        void this.currentOperandTextElement.offsetWidth; // Trigger reflow
        this.currentOperandTextElement.classList.add('calc-pop');
    }

    getOperationSymbol(op) {
        if (op === '*') return '×';
        if (op === '/') return '÷';
        return op;
    }

    getDisplayNumber(number) {
        if (number === '-') return '-';
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.getOperationSymbol(this.operation)}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }

    // History Functions
    addHistory(expression, result) {
        this.history.unshift({ expression, result });
        if (this.history.length > 20) this.history.pop(); // Keep only last 20
        localStorage.setItem('calc-history', JSON.stringify(this.history));
        this.renderHistory();
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calc-history');
        this.renderHistory();
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="empty-history">기록이 없습니다.</div>';
            return;
        }

        this.history.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('history-item');
            div.innerHTML = `
                <div class="history-expr">${item.expression} =</div>
                <div class="history-result">${this.getDisplayNumber(item.result)}</div>
            `;
            div.addEventListener('click', () => {
                this.currentOperand = item.result.toString();
                this.operation = undefined;
                this.previousOperand = '';
                this.updateDisplay();
                document.getElementById('history-panel').classList.remove('active');
            });
            historyList.appendChild(div);
        });
    }
}

const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Event Listeners for buttons
document.querySelectorAll('.btn-number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.value);
        calculator.updateDisplay();
    });
});

document.querySelectorAll('.btn-operator').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.value);
        calculator.updateDisplay();
    });
});

document.querySelector('.btn-equals').addEventListener('click', button => {
    calculator.compute();
    calculator.updateDisplay();
});

document.querySelector('[data-action="clear"]').addEventListener('click', button => {
    calculator.clear();
    calculator.updateDisplay();
});

document.querySelector('[data-action="delete"]').addEventListener('click', button => {
    calculator.delete();
    calculator.updateDisplay();
});

// Keyboard Support
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault(); // Prevent submit if in form
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%') {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay();
    }
});

// Theme Toggling
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;
const themeIcon = themeToggleBtn.querySelector('i');

// Check saved theme
const savedTheme = localStorage.getItem('calc-theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('calc-theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun'; // Show sun to toggle to light
    } else {
        themeIcon.className = 'fas fa-moon'; // Show moon to toggle to dark
    }
}

// History Panel Toggling
const historyToggleBtn = document.getElementById('history-toggle');
const historyPanel = document.getElementById('history-panel');

historyToggleBtn.addEventListener('click', () => {
    historyPanel.classList.toggle('active');
});

// Close history when clicking outside (on the wrapper)
document.querySelector('.calculator-wrapper').addEventListener('click', (e) => {
    if (e.target === e.currentTarget && historyPanel.classList.contains('active')) {
        historyPanel.classList.remove('active');
    }
});

document.getElementById('clear-history').addEventListener('click', () => {
    if(confirm("기록을 모두 지우시겠습니까?")) {
        calculator.clearHistory();
    }
});
