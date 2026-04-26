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

// Global active view tracker
let activeView = 'basic';

// Keyboard Support
document.addEventListener('keydown', e => {
    if (activeView === 'currency') {
        // Currency Calculator Keyboard Support
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            if (e.key === '.' && currentCurrencyValue.includes('.')) return;
            if (currentCurrencyValue === '0' && e.key !== '.') {
                currentCurrencyValue = e.key;
            } else {
                currentCurrencyValue += e.key;
            }
            updateCurrencyDisplay();
        }
        if (e.key === 'Backspace') {
            currentCurrencyValue = currentCurrencyValue.slice(0, -1);
            if (currentCurrencyValue === '') currentCurrencyValue = '0';
            updateCurrencyDisplay();
        }
        if (e.key === 'Escape') {
            currentCurrencyValue = '0';
            updateCurrencyDisplay();
        }
        return; // Skip basic calc logic
    }

    // Basic Calculator Keyboard Support
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
    let newTheme;
    if (currentTheme === 'dark') newTheme = 'light';
    else if (currentTheme === 'light') newTheme = 'cute';
    else newTheme = 'dark';
    
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('calc-theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun'; // Show sun to toggle to light
    } else if (theme === 'light') {
        themeIcon.className = 'fas fa-paw'; // Show paw to toggle to cute
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

// Sidebar Toggling
const menuToggleBtn = document.getElementById('menu-toggle');
const closeSidebarBtn = document.getElementById('close-sidebar');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function toggleSidebar() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
}

menuToggleBtn.addEventListener('click', toggleSidebar);
closeSidebarBtn.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', toggleSidebar);

// Menu Item Click Logic (UI & View Switching)
const basicCalcView = document.getElementById('basic-calc-view');
const currencyCalcView = document.getElementById('currency-calc-view');
const nlpCalcView = document.getElementById('nlp-calc-view');

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Handle view switching
        const view = item.getAttribute('data-view');
        activeView = view;
        if (view === 'basic') {
            basicCalcView.style.display = 'flex';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
        } else if (view === 'currency') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'flex';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            initCurrencyCalc();
        } else if (view === 'nlp') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'flex';
        }
        
        // Close sidebar after selection
        toggleSidebar();
    });
});

// History Close Button
const closeHistoryBtn = document.getElementById('close-history');
if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', () => {
        historyPanel.classList.remove('active');
    });
}

// Currency Calculator Logic
let exchangeRates = null;
let currentCurrencyValue = '0';
let activeCurrencyRow = 'top';

const topCurrencySelect = document.getElementById('currency-top-select');
const bottomCurrencySelect = document.getElementById('currency-bottom-select');
const topAmountDisplay = document.getElementById('currency-top-amount');
const bottomAmountDisplay = document.getElementById('currency-bottom-amount');
const rateInfoDisplay = document.getElementById('exchange-rate-info');
const swapCurrencyBtn = document.getElementById('swap-currency');

async function initCurrencyCalc() {
    if (exchangeRates) return;
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        exchangeRates = data.rates;
        updateCurrencyDisplay();
    } catch (error) {
        console.error("Failed to fetch rates", error);
        rateInfoDisplay.innerText = "환율 정보를 불러올 수 없습니다. (기본값 사용)";
        exchangeRates = {
            "USD": 1, "KRW": 1350, "EUR": 0.92, "JPY": 150, "CNY": 7.2, "VND": 25000, "THB": 36
        };
        updateCurrencyDisplay();
    }
}

function updateCurrencyDisplay() {
    if (!exchangeRates) return;
    
    const topCurrency = topCurrencySelect.value;
    const bottomCurrency = bottomCurrencySelect.value;
    
    let topVal = 0;
    let bottomVal = 0;
    
    if (activeCurrencyRow === 'top') {
        topVal = parseFloat(currentCurrencyValue) || 0;
        const inUSD = topVal / exchangeRates[topCurrency];
        bottomVal = inUSD * exchangeRates[bottomCurrency];
    } else {
        bottomVal = parseFloat(currentCurrencyValue) || 0;
        const inUSD = bottomVal / exchangeRates[bottomCurrency];
        topVal = inUSD * exchangeRates[topCurrency];
    }
    
    if (activeCurrencyRow === 'top') {
        topAmountDisplay.innerText = currentCurrencyValue;
        bottomAmountDisplay.innerText = formatCurrencyAmount(bottomVal);
    } else {
        topAmountDisplay.innerText = formatCurrencyAmount(topVal);
        bottomAmountDisplay.innerText = currentCurrencyValue;
    }
    
    const oneTopInBottom = (1 / exchangeRates[topCurrency]) * exchangeRates[bottomCurrency];
    rateInfoDisplay.innerText = `1 ${topCurrency} = ${oneTopInBottom.toFixed(4)} ${bottomCurrency}`;
}

function formatCurrencyAmount(val) {
    if (isNaN(val)) return '0';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val);
}

document.querySelectorAll('.currency-row').forEach((row, index) => {
    row.addEventListener('click', (e) => {
        if(e.target.tagName === 'SELECT') return; // Don't trigger if clicking select
        document.querySelectorAll('.currency-row').forEach(r => r.classList.remove('active'));
        row.classList.add('active');
        activeCurrencyRow = index === 0 ? 'top' : 'bottom';
        currentCurrencyValue = '0';
        updateCurrencyDisplay();
    });
});

if(topCurrencySelect) topCurrencySelect.addEventListener('change', updateCurrencyDisplay);
if(bottomCurrencySelect) bottomCurrencySelect.addEventListener('change', updateCurrencyDisplay);

if(swapCurrencyBtn) swapCurrencyBtn.addEventListener('click', () => {
    const temp = topCurrencySelect.value;
    topCurrencySelect.value = bottomCurrencySelect.value;
    bottomCurrencySelect.value = temp;
    updateCurrencyDisplay();
});

document.querySelectorAll('[data-curr-val]').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-curr-val');
        if (val === '.' && currentCurrencyValue.includes('.')) return;
        if (currentCurrencyValue === '0' && val !== '.') {
            currentCurrencyValue = val;
        } else {
            currentCurrencyValue += val;
        }
        updateCurrencyDisplay();
    });
});

document.querySelectorAll('[data-curr-action]').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-curr-action');
        if (action === 'clear') {
            currentCurrencyValue = '0';
        } else if (action === 'delete') {
            currentCurrencyValue = currentCurrencyValue.slice(0, -1);
            if (currentCurrencyValue === '') currentCurrencyValue = '0';
        }
        updateCurrencyDisplay();
    });
});

// ==========================================
// NLP Calculator Logic
// ==========================================
const nlpTabMic = document.getElementById('nlp-tab-mic');
const nlpTabKbd = document.getElementById('nlp-tab-kbd');
const nlpMicMode = document.getElementById('nlp-mic-mode');
const nlpKbdMode = document.getElementById('nlp-kbd-mode');
const nlpMicBtn = document.getElementById('nlp-mic-btn');
const nlpStatus = document.getElementById('nlp-status');
const nlpInput = document.getElementById('nlp-input');
const nlpCalcBtn = document.getElementById('nlp-calc-btn');
const nlpExpressionDisplay = document.getElementById('nlp-expression');
const nlpResultDisplay = document.getElementById('nlp-result');

if (nlpTabMic && nlpTabKbd) {
    // Tab Switching
    nlpTabMic.addEventListener('click', () => {
        nlpTabMic.classList.add('active');
        nlpTabKbd.classList.remove('active');
        nlpMicMode.style.display = 'flex';
        nlpKbdMode.style.display = 'none';
    });

    nlpTabKbd.addEventListener('click', () => {
        nlpTabKbd.classList.add('active');
        nlpTabMic.classList.remove('active');
        nlpKbdMode.style.display = 'flex';
        nlpMicMode.style.display = 'none';
        nlpInput.focus();
    });

    // Speech Recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'ko-KR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            nlpMicBtn.classList.add('listening');
            nlpStatus.innerHTML = "듣고 있습니다... 말씀해 주세요.";
        };

        recognition.onspeechend = () => {
            recognition.stop();
            nlpMicBtn.classList.remove('listening');
            nlpStatus.innerHTML = "마이크 아이콘을 누르고 수식을 말해보세요.<br>(예: \"15 더하기 5는\")";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            parseAndCalculateNLP(transcript);
        };

        recognition.onerror = (event) => {
            nlpMicBtn.classList.remove('listening');
            if (event.error === 'not-allowed') {
                nlpStatus.innerHTML = "마이크 사용 권한이 거부되었거나, 로컬 파일(file://) 환경에서는 마이크를 사용할 수 없습니다.";
            } else {
                nlpStatus.innerHTML = "오류가 발생했습니다: " + event.error;
            }
            console.error('Speech recognition error', event.error);
        };
    } else {
        nlpStatus.innerHTML = "이 브라우저에서는 음성 인식을 지원하지 않습니다.<br>키보드 모드를 사용해 주세요.";
        nlpMicBtn.disabled = true;
    }

    nlpMicBtn.addEventListener('click', () => {
        if (recognition) {
            recognition.start();
        }
    });

    // Keyboard Input Logic
    nlpCalcBtn.addEventListener('click', () => {
        parseAndCalculateNLP(nlpInput.value);
    });
    nlpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            parseAndCalculateNLP(nlpInput.value);
        }
    });
}

// Parsing Logic
function parseAndCalculateNLP(inputText) {
    if (!inputText.trim()) return;
    
    // Show original input
    nlpExpressionDisplay.innerText = inputText;
    nlpResultDisplay.innerText = "...";

    // 1. Map Korean keywords to math symbols
    let expression = inputText
        .replace(/더하기/g, '+')
        .replace(/플러스/g, '+')
        .replace(/빼기/g, '-')
        .replace(/마이너스/g, '-')
        .replace(/곱하기/g, '*')
        .replace(/곱/g, '*')
        .replace(/나누기/g, '/')
        .replace(/나눔/g, '/')
        .replace(/은/g, '')
        .replace(/는/g, '')
        .replace(/계산/g, '')
        .replace(/해/g, '')
        .replace(/줘/g, '')
        .replace(/얼마/g, '')
        .replace(/야/g, '')
        .replace(/요/g, '')
        .replace(/입/g, '')
        .replace(/니/g, '')
        .replace(/까/g, '')
        .replace(/[?]/g, '');

    // 2. Remove any remaining Korean characters, letters, spaces that aren't math
    // Keep numbers, decimal points, and operators (+, -, *, /)
    const sanitized = expression.replace(/[^0-9+\-*/.]/g, '');

    if (!sanitized) {
        nlpResultDisplay.innerText = "수식을 인식하지 못했습니다.";
        return;
    }

    try {
        // 3. Evaluate securely (eval is fine here since we heavily sanitized)
        let result = new Function("return " + sanitized)();
        
        if (!isFinite(result) || isNaN(result)) {
            throw new Error("Invalid calculation");
        }

        // Clean up float issues
        result = Math.round(result * 10000000000) / 10000000000;
        
        // Display result
        nlpResultDisplay.innerText = calculator.getDisplayNumber(result);
        
        // Add to history
        calculator.addHistory(inputText + " =", result.toString());
        
        // Clear input for keyboard mode
        if (nlpInput.value) {
            nlpInput.value = '';
        }
    } catch (e) {
        nlpResultDisplay.innerText = "계산 오류";
    }
}
