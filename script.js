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

    // NLP Calculator: skip basic calc key handling
    if (activeView === 'nlp') return;

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
const photoCalcView = document.getElementById('photo-calc-view');
const planetCalcView = document.getElementById('planet-calc-view');
const tipCalcView = document.getElementById('tip-calc-view');
const statsCalcView = document.getElementById('stats-calc-view');
const sciCalcView = document.getElementById('sci-calc-view');
const unitCalcView = document.getElementById('unit-calc-view');

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
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
            if (statsCalcView) statsCalcView.style.display = 'none';
            if (sciCalcView) sciCalcView.style.display = 'none';
            if (unitCalcView) unitCalcView.style.display = 'none';
        } else if (view === 'currency') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'flex';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
            if (statsCalcView) statsCalcView.style.display = 'none';
            if (sciCalcView) sciCalcView.style.display = 'none';
            if (unitCalcView) unitCalcView.style.display = 'none';
            initCurrencyCalc();
        } else if (view === 'nlp') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'flex';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
            if (statsCalcView) statsCalcView.style.display = 'none';
            if (sciCalcView) sciCalcView.style.display = 'none';
            if (unitCalcView) unitCalcView.style.display = 'none';
        } else if (view === 'photo') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'flex';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
            if (statsCalcView) statsCalcView.style.display = 'none';
            if (sciCalcView) sciCalcView.style.display = 'none';
            if (unitCalcView) unitCalcView.style.display = 'none';
            calculateEV();
            calculateCrop();
        } else if (view === 'planet') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'flex';
            if (tipCalcView) tipCalcView.style.display = 'none';
            if (statsCalcView) statsCalcView.style.display = 'none';
            if (sciCalcView) sciCalcView.style.display = 'none';
            if (unitCalcView) unitCalcView.style.display = 'none';
            calculatePlanetWeight();
            calculateEscapeVelocity();
        } else if (view === 'tip') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'flex';
            if (statsCalcView) statsCalcView.style.display = 'none';
            if (sciCalcView) sciCalcView.style.display = 'none';
            if (unitCalcView) unitCalcView.style.display = 'none';
            calculateTip();
        } else if (view === 'stats') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
            if (statsCalcView) statsCalcView.style.display = 'flex';
            if (sciCalcView) sciCalcView.style.display = 'none';
            if (unitCalcView) unitCalcView.style.display = 'none';
        } else if (view === 'sci') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
            if (statsCalcView) statsCalcView.style.display = 'none';
            if (sciCalcView) sciCalcView.style.display = 'flex';
            if (unitCalcView) unitCalcView.style.display = 'none';
        } else if (view === 'unit') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
            if (statsCalcView) statsCalcView.style.display = 'none';
            if (sciCalcView) sciCalcView.style.display = 'none';
            if (unitCalcView) unitCalcView.style.display = 'flex';
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
                nlpStatus.innerHTML = "마이크 권한이 차단되었습니다. 브라우저 주소창 옆의 자물쇠 아이콘을 눌러 마이크를 '허용'해 주세요.";
            } else if (event.error === 'no-speech') {
                nlpStatus.innerHTML = "음성이 감지되지 않았습니다. 마이크를 누르고 다시 말씀해 주세요.";
            } else if (event.error === 'network') {
                nlpStatus.innerHTML = "네트워크 연결이 불안정하여 음성 인식을 할 수 없습니다.";
            } else {
                nlpStatus.innerHTML = "오류가 발생했습니다: " + event.error;
            }
            console.error('Speech recognition error', event.error);
        };
    } else {
        nlpStatus.innerHTML = "이 브라우저에서는 음성 인식을 지원하지 않습니다.<br>구글 크롬(Chrome) 브라우저를 사용해 주세요.";
        nlpMicBtn.disabled = true;
    }

    nlpMicBtn.addEventListener('click', () => {
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                // Ignore error if already started
                console.log("Recognition already started");
            }
        }
    });

    // Keyboard Input Logic
    nlpCalcBtn.addEventListener('click', () => {
        parseAndCalculateNLP(nlpInput.value);
    });
    nlpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent adding a new line in textarea
            parseAndCalculateNLP(nlpInput.value);
        }
    });
}

// Parsing Logic

/**
 * 한글 숫자 표현을 아라비아 숫자로 변환
 * 예: "오십이" → "52", "삼백" → "300", "이만 오천" → "25000"
 */
function koreanNumberToArabic(text) {
    const digits = { '영': 0, '공': 0, '일': 1, '이': 2, '삼': 3, '사': 4, '오': 5, '육': 6, '칠': 7, '팔': 8, '구': 9 };
    const units  = { '십': 10, '백': 100, '천': 1000 };
    const bigUnits = { '만': 10000, '억': 100000000 };

    // 한글 숫자가 포함되어 있는지 확인
    const korNumPattern = /[영공일이삼사오육칠팔구십백천만억]+/;
    if (!korNumPattern.test(text)) return text;

    function parseChunk(chunk) {
        // 청크 내에서 숫자 계산 (만/억 이하 단위)
        let total = 0;
        let current = 0;
        for (let i = 0; i < chunk.length; i++) {
            const ch = chunk[i];
            if (digits[ch] !== undefined) {
                current = digits[ch];
            } else if (units[ch] !== undefined) {
                if (current === 0) current = 1; // 십 → 10, 백 → 100
                total += current * units[ch];
                current = 0;
            }
        }
        total += current;
        return total;
    }

    function convertKorNum(str) {
        // 억 단위 분리
        let result = 0;
        const eok = str.split('억');
        if (eok.length > 1) {
            const eokPart = parseChunk(eok[0]);
            result += eokPart * 100000000;
            str = eok[1];
        }
        // 만 단위 분리
        const man = str.split('만');
        if (man.length > 1) {
            const manPart = parseChunk(man[0]);
            result += manPart * 10000;
            str = man[1];
        }
        result += parseChunk(str);
        return result;
    }

    // 한글 숫자 패턴 → 아라비아 숫자로 치환
    return text.replace(/[영공일이삼사오육칠팔구십백천만억]+/g, (match) => {
        const num = convertKorNum(match);
        return isNaN(num) || num === 0 && !['영', '공'].includes(match) ? match : num.toString();
    });
}

function parseAndCalculateNLP(inputText) {
    if (!inputText.trim()) return;
    
    // Show original input
    nlpExpressionDisplay.innerText = inputText;
    nlpResultDisplay.innerText = "...";

    // 1. 한글 숫자를 아라비아 숫자로 먼저 변환
    let expression = koreanNumberToArabic(inputText);

    // 2. 연산자 키워드를 수학 기호로 변환 (긴 단어부터 먼저 처리)
    expression = expression
        .replace(/더하기/g, '+')
        .replace(/플러스/g, '+')
        .replace(/빼기/g, '-')
        .replace(/마이너스/g, '-')
        .replace(/곱하기/g, '*')   // '곱하기' 먼저
        .replace(/나누기/g, '/')   // '나누기' 먼저
        .replace(/나눔/g, '/')
        .replace(/곱/g, '*')       // '곱' 나중에
        .replace(/배/g, '*');

    // 3. 불필요한 어미/조사/종결어 제거 (단어 경계 기준)
    expression = expression
        .replace(/얼마야|얼마요|얼마입니까|얼마예요|얼마에요/g, '')
        .replace(/계산해줘|계산해|계산/g, '')
        .replace(/알려줘|해줘|줘/g, '')
        .replace(/이에요|예요|입니다|이야|이니|이까/g, '')
        .replace(/는요|은요/g, '')
        .replace(/[은는이가을를의]/g, '')
        .replace(/[?？]/g, '');

    // 4. 남은 한글 및 불필요한 문자 제거, 수식 문자만 남기기
    const sanitized = expression.replace(/[^0-9+\-*/.]/g, '').trim();

    if (!sanitized) {
        nlpResultDisplay.innerText = "수식을 인식하지 못했습니다.";
        return;
    }

    // 5. 수식이 올바른지 확인 (연산자로 끝나는 경우 등)
    if (/[+\-*\/.]$/.test(sanitized)) {
        nlpResultDisplay.innerText = "수식이 완전하지 않습니다.";
        return;
    }

    try {
        // 6. 안전하게 수식 계산
        let result = new Function("return " + sanitized)();
        
        if (!isFinite(result) || isNaN(result)) {
            throw new Error("Invalid calculation");
        }

        // 부동소수점 오차 제거
        result = Math.round(result * 10000000000) / 10000000000;
        
        // 결과 표시
        nlpResultDisplay.innerText = calculator.getDisplayNumber(result);
        
        // 히스토리에 추가
        calculator.addHistory(inputText + " =", result.toString());
        
        // 키보드 모드의 경우 입력창 초기화
        if (nlpInput && nlpInput.value) {
            nlpInput.value = '';
        }
    } catch (e) {
        console.error('NLP 계산 오류:', e, '수식:', sanitized);
        nlpResultDisplay.innerText = "계산 오류: " + sanitized + " 를 계산할 수 없습니다.";
    }
}

// ==========================================
// Photo Calculator Logic
// ==========================================
const photoTabEv = document.getElementById('photo-tab-ev');
const photoTabCrop = document.getElementById('photo-tab-crop');
const photoEvMode = document.getElementById('photo-ev-mode');
const photoCropMode = document.getElementById('photo-crop-mode');

if (photoTabEv && photoTabCrop) {
    photoTabEv.addEventListener('click', () => {
        photoTabEv.classList.add('active');
        photoTabCrop.classList.remove('active');
        photoEvMode.style.display = 'flex';
        photoCropMode.style.display = 'none';
    });

    photoTabCrop.addEventListener('click', () => {
        photoTabCrop.classList.add('active');
        photoTabEv.classList.remove('active');
        photoCropMode.style.display = 'flex';
        photoEvMode.style.display = 'none';
    });
}

// EV Calculation
const photoAperture = document.getElementById('photo-aperture');
const photoShutter = document.getElementById('photo-shutter');
const photoIso = document.getElementById('photo-iso');
const photoEvResult = document.getElementById('photo-ev-result');

function calculateEV() {
    if (!photoAperture || !photoShutter || !photoIso || !photoEvResult) return;
    
    const f = parseFloat(photoAperture.value);
    const t = parseFloat(photoShutter.value);
    const iso = parseFloat(photoIso.value);
    
    // EV100 = log2(N^2 / t)
    const ev100 = Math.log2((f * f) / t);
    
    // Equivalent Scene EV = EV100 - log2(ISO/100)
    const sceneEv = ev100 - Math.log2(iso / 100);
    
    photoEvResult.innerText = sceneEv.toFixed(1);
}

if (photoAperture) photoAperture.addEventListener('change', calculateEV);
if (photoShutter) photoShutter.addEventListener('change', calculateEV);
if (photoIso) photoIso.addEventListener('change', calculateEV);

// Crop Calculation
const photoCropFactor = document.getElementById('photo-crop-factor');
const photoFocalLength = document.getElementById('photo-focal-length');
const photoCropResult = document.getElementById('photo-crop-result');

function calculateCrop() {
    if (!photoCropFactor || !photoFocalLength || !photoCropResult) return;
    
    const factor = parseFloat(photoCropFactor.value);
    const focal = parseFloat(photoFocalLength.value) || 0;
    
    const equivalent = Math.round(focal * factor);
    photoCropResult.innerText = equivalent + " mm";
}

if (photoCropFactor) photoCropFactor.addEventListener('change', calculateCrop);
if (photoFocalLength) photoFocalLength.addEventListener('input', calculateCrop);

// ==========================================
// Planet Calculator Logic
// ==========================================
const planetTabWeight = document.getElementById('planet-tab-weight');
const planetTabEscape = document.getElementById('planet-tab-escape');
const planetWeightMode = document.getElementById('planet-weight-mode');
const planetEscapeMode = document.getElementById('planet-escape-mode');

if (planetTabWeight && planetTabEscape) {
    planetTabWeight.addEventListener('click', () => {
        planetTabWeight.classList.add('active');
        planetTabEscape.classList.remove('active');
        planetWeightMode.style.display = 'flex';
        planetEscapeMode.style.display = 'none';
    });

    planetTabEscape.addEventListener('click', () => {
        planetTabEscape.classList.add('active');
        planetTabWeight.classList.remove('active');
        planetEscapeMode.style.display = 'flex';
        planetWeightMode.style.display = 'none';
    });
}

// Planet Weight Calculation
const planetEarthWeight = document.getElementById('planet-earth-weight');
const planetTarget = document.getElementById('planet-target');
const planetWeightLabel = document.getElementById('planet-weight-label');
const planetWeightResult = document.getElementById('planet-weight-result');

function calculatePlanetWeight() {
    if (!planetEarthWeight || !planetTarget || !planetWeightResult) return;
    
    const weight = parseFloat(planetEarthWeight.value) || 0;
    const gravityRatio = parseFloat(planetTarget.value);
    const planetName = planetTarget.options[planetTarget.selectedIndex].text.split(' ')[0]; // Extract Korean name
    
    const targetWeight = weight * gravityRatio;
    
    if (planetWeightLabel) {
        planetWeightLabel.innerText = `${planetName}에서의 몸무게`;
    }
    planetWeightResult.innerText = targetWeight.toFixed(2) + " kg";
}

if (planetEarthWeight) planetEarthWeight.addEventListener('input', calculatePlanetWeight);
if (planetTarget) planetTarget.addEventListener('change', calculatePlanetWeight);

// Planet Escape Velocity Calculation
const planetEscapePreset = document.getElementById('planet-escape-preset');
const planetEscapeCustom = document.getElementById('planet-escape-custom');
const planetCustomMass = document.getElementById('planet-custom-mass');
const planetCustomRadius = document.getElementById('planet-custom-radius');
const planetEscapeResult = document.getElementById('planet-escape-result');

const G = 6.67430e-11; // Gravitational constant

function calculateEscapeVelocity() {
    if (!planetEscapePreset || !planetEscapeResult) return;
    
    const val = planetEscapePreset.value;
    
    if (val === 'custom') {
        if (planetEscapeCustom) planetEscapeCustom.style.display = 'block';
        
        const mass = parseFloat(planetCustomMass.value) || 0; // * 10^24 kg
        const radius = parseFloat(planetCustomRadius.value) || 0; // km
        
        if (mass > 0 && radius > 0) {
            const mKg = mass * 1e24;
            const rM = radius * 1000;
            // v = sqrt(2GM/r) in m/s
            const v = Math.sqrt((2 * G * mKg) / rM);
            const vKm = v / 1000;
            planetEscapeResult.innerText = vKm.toFixed(2) + " km/s";
        } else {
            planetEscapeResult.innerText = "0.00 km/s";
        }
    } else {
        if (planetEscapeCustom) planetEscapeCustom.style.display = 'none';
        const vKm = parseFloat(val);
        planetEscapeResult.innerText = vKm.toFixed(2) + " km/s";
    }
}

if (planetEscapePreset) planetEscapePreset.addEventListener('change', calculateEscapeVelocity);
if (planetCustomMass) planetCustomMass.addEventListener('input', calculateEscapeVelocity);
if (planetCustomRadius) planetCustomRadius.addEventListener('input', calculateEscapeVelocity);

// ==========================================
// Tip Calculator Logic
// ==========================================
const tipTotalBill = document.getElementById('tip-total-bill');
const tipBtns = document.querySelectorAll('.tip-btn');
const tipCustomPercent = document.getElementById('tip-custom-percent');
const tipPeopleCount = document.getElementById('tip-people-count');
const tipTotalAmount = document.getElementById('tip-total-amount');
const tipTotalWithTip = document.getElementById('tip-total-with-tip');
const tipPerPersonResult = document.getElementById('tip-per-person-result');

let currentTipPercent = 15;

tipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tipBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const tipVal = btn.getAttribute('data-tip');
        if (tipVal === 'custom') {
            tipCustomPercent.style.display = 'block';
            currentTipPercent = parseFloat(tipCustomPercent.value) || 0;
            tipCustomPercent.focus();
        } else {
            tipCustomPercent.style.display = 'none';
            currentTipPercent = parseFloat(tipVal);
        }
        calculateTip();
    });
});

if (tipCustomPercent) {
    tipCustomPercent.addEventListener('input', () => {
        currentTipPercent = parseFloat(tipCustomPercent.value) || 0;
        calculateTip();
    });
}

function calculateTip() {
    if (!tipTotalBill || !tipPeopleCount || !tipPerPersonResult) return;
    
    const bill = parseFloat(tipTotalBill.value) || 0;
    let people = parseInt(tipPeopleCount.value) || 1;
    if (people < 1) people = 1; // 방어 코드: 인원수는 1 이상
    
    const tipAmount = bill * (currentTipPercent / 100);
    const totalAmount = bill + tipAmount;
    const perPerson = totalAmount / people;
    
    // Formatting currency (add commas)
    const formatCurrency = (val) => {
        return Math.round(val).toLocaleString(); 
    };
    
    if (tipTotalAmount) tipTotalAmount.innerText = formatCurrency(tipAmount);
    if (tipTotalWithTip) tipTotalWithTip.innerText = formatCurrency(totalAmount);
    tipPerPersonResult.innerText = formatCurrency(perPerson);
}

if (tipTotalBill) tipTotalBill.addEventListener('input', calculateTip);
if (tipPeopleCount) tipPeopleCount.addEventListener('input', calculateTip);

const tipClearBtn = document.getElementById('tip-clear-btn');
if (tipClearBtn) {
    tipClearBtn.addEventListener('click', () => {
        if (tipTotalBill) tipTotalBill.value = '';
        if (tipPeopleCount) tipPeopleCount.value = '1';
        if (tipCustomPercent) {
            tipCustomPercent.value = '';
            tipCustomPercent.style.display = 'none';
        }
        
        currentTipPercent = 15;
        tipBtns.forEach(b => {
            b.classList.remove('active');
            if (b.getAttribute('data-tip') === '15') {
                b.classList.add('active');
            }
        });
        
        calculateTip();
    });
}

// ==========================================
// Stats Calculator Logic (Levity Stats)
// ==========================================
const statsTabUni = document.getElementById('stats-tab-uni');
const statsTabBi = document.getElementById('stats-tab-bi');
const statsUniMode = document.getElementById('stats-uni-mode');
const statsBiMode = document.getElementById('stats-bi-mode');

if (statsTabUni && statsTabBi) {
    statsTabUni.addEventListener('click', () => {
        statsTabUni.classList.add('active');
        statsTabBi.classList.remove('active');
        statsUniMode.style.display = 'block';
        statsBiMode.style.display = 'none';
    });
    statsTabBi.addEventListener('click', () => {
        statsTabBi.classList.add('active');
        statsTabUni.classList.remove('active');
        statsBiMode.style.display = 'block';
        statsUniMode.style.display = 'none';
    });
}

// Function to parse input data (string to array of numbers)
function parseData(inputStr) {
    if (!inputStr) return [];
    return inputStr.replace(/,/g, ' ').split(/\s+/).map(Number).filter(n => !isNaN(n));
}

// Chart instances to destroy before redrawing
let uniChartInstance = null;
let biChartInstance = null;

const getWittyMessage = (p_value, r_value) => {
    if (p_value !== undefined && p_value !== null) {
        if (p_value < 0.05) return "오, 통계적으로 유의미하네요! 우연이 아니라는 뜻입니다. (아마도요)";
        else return "이 데이터들은 서로 별로 관심이 없는 것 같군요. (p > 0.05)";
    }
    if (r_value !== undefined && r_value !== null) {
        if (Math.abs(r_value) > 0.8) return "둘의 관계가 거의 껌딱지 수준입니다! 엄청난 양의 상관관계네요.";
    }
    return "숫자들은 거짓말을 하지 않죠. 그저 복잡하게 말할 뿐입니다.";
};

const statsUniCalcBtn = document.getElementById('stats-uni-calc-btn');
if (statsUniCalcBtn) {
    statsUniCalcBtn.addEventListener('click', async () => {
        const inputDataStr = document.getElementById('stats-uni-input').value;
        const fileInput = document.getElementById('stats-uni-file').files[0];
        
        let data = [];
        if (fileInput) {
            const text = await fileInput.text();
            data = parseData(text);
        } else if (inputDataStr) {
            data = parseData(inputDataStr);
        } else {
            alert('데이터를 입력하거나 CSV 파일을 업로드해 주세요.');
            return;
        }
            
        if (data.length < 2) {
            alert('분석을 위해 최소 2개 이상의 숫자가 필요합니다.');
            return;
        }

        // Calculate stats using jStat
        const mean = jStat.mean(data);
        const median = jStat.median(data);
        const std = jStat.stdev(data, true); // sample standard deviation
        const variance = jStat.variance(data, true);
        const sem = std / Math.sqrt(data.length);

        document.getElementById('stats-uni-result').style.display = 'block';
        document.getElementById('stats-uni-mean').innerText = mean.toFixed(4);
        document.getElementById('stats-uni-median').innerText = median.toFixed(4);
        document.getElementById('stats-uni-std').innerText = std.toFixed(4);
        document.getElementById('stats-uni-var').innerText = variance.toFixed(4);
        document.getElementById('stats-uni-sem').innerText = sem.toFixed(4);
        document.getElementById('stats-uni-msg').innerText = getWittyMessage();
        
        // Draw Histogram with Chart.js
        const ctx = document.getElementById('stats-uni-plot').getContext('2d');
        if (uniChartInstance) uniChartInstance.destroy();
        
        // Create bins for histogram manually
        const min = jStat.min(data);
        const max = jStat.max(data);
        const binCount = Math.max(5, Math.floor(Math.sqrt(data.length)));
        const binWidth = (max - min) / binCount || 1;
        
        let bins = Array(binCount).fill(0);
        let labels = Array(binCount).fill('');
        for (let i = 0; i < binCount; i++) {
            labels[i] = (min + (i * binWidth)).toFixed(1) + ' ~ ' + (min + ((i+1) * binWidth)).toFixed(1);
        }
        
        data.forEach(val => {
            let idx = Math.floor((val - min) / binWidth);
            if (idx >= binCount) idx = binCount - 1;
            bins[idx]++;
        });

        uniChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frequency',
                    data: bins,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: '#e2e8f0' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: { ticks: { color: '#e2e8f0', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.1)' } }
                },
                plugins: {
                    legend: { labels: { color: '#e2e8f0' } }
                }
            }
        });
    });
}

const statsBiCalcBtn = document.getElementById('stats-bi-calc-btn');
if (statsBiCalcBtn) {
    statsBiCalcBtn.addEventListener('click', () => {
        const inputA = document.getElementById('stats-bi-input-a').value;
        const inputB = document.getElementById('stats-bi-input-b').value;
        
        let dataA = parseData(inputA);
        let dataB = parseData(inputB);
        
        if (dataA.length < 2 || dataB.length < 2) {
            alert('Group A와 Group B의 데이터를 2개 이상 입력해 주세요.');
            return;
        }
        
        const minLen = Math.min(dataA.length, dataB.length);
        dataA = dataA.slice(0, minLen);
        dataB = dataB.slice(0, minLen);

        // Correlation
        const r_val = jStat.corrcoeff(dataA, dataB);
        // t-value for correlation
        const t_val_r = r_val * Math.sqrt((minLen - 2) / (1 - r_val * r_val));
        const p_val_r = jStat.studentt.cdf(-Math.abs(t_val_r), minLen - 2) * 2;

        // Independent t-test (assuming equal variance for simplicity)
        const meanA = jStat.mean(dataA);
        const meanB = jStat.mean(dataB);
        const varA = jStat.variance(dataA, true);
        const varB = jStat.variance(dataB, true);
        const pooledVar = ((minLen - 1) * varA + (minLen - 1) * varB) / (2 * minLen - 2);
        const se = Math.sqrt(pooledVar * (2 / minLen));
        const t_val = (meanA - meanB) / se;
        const df = 2 * minLen - 2;
        const p_val_t = jStat.studentt.cdf(-Math.abs(t_val), df) * 2;

        document.getElementById('stats-bi-result').style.display = 'block';
        document.getElementById('stats-bi-r').innerText = r_val.toFixed(4);
        document.getElementById('stats-bi-rp').innerText = p_val_r.toFixed(4);
        document.getElementById('stats-bi-t').innerText = t_val.toFixed(4);
        document.getElementById('stats-bi-tp').innerText = p_val_t.toFixed(4);
        
        let msg = getWittyMessage(p_val_t, null);
        if (p_val_t > 0.05 && Math.abs(r_val) > 0.8) msg = getWittyMessage(null, r_val);
        document.getElementById('stats-bi-msg').innerText = msg;

        // Draw Scatter Plot with Chart.js
        const ctx = document.getElementById('stats-bi-plot').getContext('2d');
        if (biChartInstance) biChartInstance.destroy();
        
        const scatterData = [];
        for (let i = 0; i < minLen; i++) {
            scatterData.push({ x: dataA[i], y: dataB[i] });
        }

        biChartInstance = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Group A vs B',
                    data: scatterData,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Group A', color: '#e2e8f0' }, ticks: { color: '#e2e8f0' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: { title: { display: true, text: 'Group B', color: '#e2e8f0' }, ticks: { color: '#e2e8f0' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                },
                plugins: {
                    legend: { labels: { color: '#e2e8f0' } }
                }
            }
        });
    });
}

// ==========================================
// Scientific Calculator Logic (Math.js)
// ==========================================
(function initSciCalc() {
    const sciExpr = document.getElementById('sci-expression');
    const sciPreview = document.getElementById('sci-preview');
    const sciClear = document.getElementById('sci-clear');
    const sciEqual = document.getElementById('sci-equal');
    const sciToast = document.getElementById('sci-toast');
    if (!sciExpr || !sciPreview) return;

    let sciExpression = '';
    let flyActive = false;

    // Live preview: evaluate as user types
    function updatePreview() {
        sciExpression = sciExpr.innerText.trim();
        if (!sciExpression) {
            sciPreview.textContent = '= ?';
            sciPreview.classList.remove('error');
            return;
        }

        // Fly easter egg detection
        if (sciExpression.toLowerCase().includes('fly') && !flyActive) {
            triggerFly();
            return;
        }

        try {
            const result = math.evaluate(sciExpression);
            if (typeof result === 'function' || result === undefined) {
                sciPreview.textContent = '= ?';
                sciPreview.classList.remove('error');
            } else {
                const formatted = typeof result === 'number'
                    ? (Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(10)).toString())
                    : result.toString();
                sciPreview.textContent = '= ' + formatted;
                sciPreview.classList.remove('error');
            }
        } catch (e) {
            sciPreview.textContent = '= ?';
            sciPreview.classList.remove('error');
        }
    }

    // Insert text at cursor inside contenteditable
    function insertAtCursor(text) {
        sciExpr.focus();
        document.execCommand('insertText', false, text);
        updatePreview();
    }

    // Button clicks
    document.querySelectorAll('.sci-btn[data-val]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (flyActive) return;
            insertAtCursor(btn.getAttribute('data-val'));
        });
    });

    // AC button
    if (sciClear) {
        sciClear.addEventListener('click', () => {
            sciExpr.innerText = '';
            sciExpression = '';
            sciPreview.textContent = '= ?';
            sciPreview.classList.remove('error');
            if (flyActive) resetFly();
        });
    }

    // Equal button: finalize result
    if (sciEqual) {
        sciEqual.addEventListener('click', () => {
            if (flyActive) return;
            sciExpression = sciExpr.innerText.trim();
            if (!sciExpression) return;
            try {
                const result = math.evaluate(sciExpression);
                if (typeof result === 'function' || result === undefined) return;
                const formatted = typeof result === 'number'
                    ? (Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(10)).toString())
                    : result.toString();
                sciPreview.textContent = '= ' + formatted;
                sciPreview.classList.remove('error');
                sciExpr.innerText = formatted;
                // Move cursor to end
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(sciExpr);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            } catch (e) {
                sciPreview.textContent = '❌ ' + e.message;
                sciPreview.classList.add('error');
            }
        });
    }

    // Listen to typing in the expression box
    sciExpr.addEventListener('input', updatePreview);

    // Handle Enter key as equals
    sciExpr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (sciEqual) sciEqual.click();
        }
    });

    // ---- Fly Easter Egg ----
    function triggerFly() {
        flyActive = true;
        const allBtns = document.querySelectorAll('.sci-btn');
        allBtns.forEach(btn => {
            const yDist = -(200 + Math.random() * 400);
            const xDist = (Math.random() - 0.5) * 300;
            const rot = (Math.random() - 0.5) * 720;
            btn.style.setProperty('--fly-y', yDist + 'px');
            btn.style.setProperty('--fly-x', xDist + 'px');
            btn.style.setProperty('--fly-rot', rot + 'deg');
            btn.style.animationDelay = (Math.random() * 0.6) + 's';
            btn.classList.add('flying');
        });

        sciPreview.textContent = '🚀 import antigravity';
        sciPreview.classList.remove('error');

        if (sciToast) {
            sciToast.classList.add('show');
            setTimeout(() => sciToast.classList.remove('show'), 3000);
        }
    }

    function resetFly() {
        flyActive = false;
        const allBtns = document.querySelectorAll('.sci-btn');
        allBtns.forEach(btn => {
            btn.classList.remove('flying');
            btn.style.animationDelay = '';
        });
    }
})();

// ==========================================
// Unit Converter Logic
// ==========================================
(function initUnitConverter() {
    const unitData = {
        length: {
            name: '길이',
            units: {
                'mm': { label: '밀리미터(mm)', factor: 0.001 },
                'cm': { label: '센티미터(cm)', factor: 0.01 },
                'm':  { label: '미터(m)', factor: 1 },
                'km': { label: '킬로미터(km)', factor: 1000 },
                'in': { label: '인치(in)', factor: 0.0254 },
                'ft': { label: '피트(ft)', factor: 0.3048 },
                'yd': { label: '야드(yd)', factor: 0.9144 },
                'mi': { label: '마일(mi)', factor: 1609.344 }
            }
        },
        area: {
            name: '면적',
            units: {
                'mm²': { label: '제곱밀리미터(mm²)', factor: 1e-6 },
                'cm²': { label: '제곱센티미터(cm²)', factor: 1e-4 },
                'm²':  { label: '제곱미터(m²)', factor: 1 },
                'km²': { label: '제곱킬로미터(km²)', factor: 1e6 },
                'ha':  { label: '헥타르(ha)', factor: 10000 },
                'ac':  { label: '에이커(ac)', factor: 4046.856 },
                '평':  { label: '평(坪)', factor: 3.305785 },
                'ft²': { label: '제곱피트(ft²)', factor: 0.092903 }
            }
        },
        weight: {
            name: '무게',
            units: {
                'mg': { label: '밀리그램(mg)', factor: 1e-6 },
                'g':  { label: '그램(g)', factor: 0.001 },
                'kg': { label: '킬로그램(kg)', factor: 1 },
                't':  { label: '톤(t)', factor: 1000 },
                'oz': { label: '온스(oz)', factor: 0.028349523 },
                'lb': { label: '파운드(lb)', factor: 0.45359237 },
                '근': { label: '근(斤)', factor: 0.6 }
            }
        },
        volume: {
            name: '부피',
            units: {
                'mL': { label: '밀리리터(mL)', factor: 0.001 },
                'L':  { label: '리터(L)', factor: 1 },
                'cm³': { label: '세제곱센티미터(㎤)', factor: 0.001 },
                'm³': { label: '세제곱미터(m³)', factor: 1000 },
                'gal': { label: '갤런(gal)', factor: 3.78541 },
                'qt': { label: '쿼트(qt)', factor: 0.946353 },
                'pt': { label: '파인트(pt)', factor: 0.473176 },
                'cup': { label: '컵(cup)', factor: 0.236588 },
                'fl oz': { label: '액량온스(fl oz)', factor: 0.0295735 }
            }
        },
        temp: {
            name: '온도',
            units: {
                '°C': { label: '섭씨(°C)' },
                '°F': { label: '화씨(°F)' },
                'K':  { label: '켈빈(K)' }
            },
            custom: true
        },
        speed: {
            name: '속도',
            units: {
                'm/s':  { label: '미터매초(m/s)', factor: 1 },
                'km/h': { label: '킬로미터매시(km/h)', factor: 1/3.6 },
                'mph':  { label: '마일매시(mph)', factor: 0.44704 },
                'kn':   { label: '노트(kn)', factor: 0.514444 },
                'ft/s': { label: '피트매초(ft/s)', factor: 0.3048 },
                'mach': { label: '마하(Mach)', factor: 343 }
            }
        },
        time: {
            name: '시간',
            units: {
                'ms':  { label: '밀리초(ms)', factor: 0.001 },
                's':   { label: '초(s)', factor: 1 },
                'min': { label: '분(min)', factor: 60 },
                'hr':  { label: '시간(hr)', factor: 3600 },
                'day': { label: '일(day)', factor: 86400 },
                'wk':  { label: '주(wk)', factor: 604800 },
                'mo':  { label: '월(mo)', factor: 2592000 },
                'yr':  { label: '년(yr)', factor: 31536000 }
            }
        },
        data: {
            name: '데이터',
            units: {
                'B':  { label: '바이트(B)', factor: 1 },
                'KB': { label: '킬로바이트(KB)', factor: 1024 },
                'MB': { label: '메가바이트(MB)', factor: 1048576 },
                'GB': { label: '기가바이트(GB)', factor: 1073741824 },
                'TB': { label: '테라바이트(TB)', factor: 1099511627776 },
                'bit': { label: '비트(bit)', factor: 0.125 },
                'Kbit': { label: '킬로비트(Kbit)', factor: 128 },
                'Mbit': { label: '메가비트(Mbit)', factor: 131072 }
            }
        }
    };

    // Temperature conversion (special case)
    function convertTemp(val, from, to) {
        if (from === to) return val;
        let celsius;
        if (from === '°C') celsius = val;
        else if (from === '°F') celsius = (val - 32) * 5/9;
        else celsius = val - 273.15; // K

        if (to === '°C') return celsius;
        if (to === '°F') return celsius * 9/5 + 32;
        return celsius + 273.15; // K
    }

    const fromSelect = document.getElementById('unit-from-select');
    const toSelect = document.getElementById('unit-to-select');
    const fromValue = document.getElementById('unit-from-value');
    const toValue = document.getElementById('unit-to-value');
    const swapBtn = document.getElementById('unit-swap-btn');
    if (!fromSelect || !toSelect) return;

    let currentCategory = 'length';
    let inputStr = '0';

    function populateSelects(cat) {
        const units = unitData[cat].units;
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        const keys = Object.keys(units);
        keys.forEach((key, i) => {
            const o1 = document.createElement('option');
            o1.value = key; o1.textContent = units[key].label;
            fromSelect.appendChild(o1);
            const o2 = document.createElement('option');
            o2.value = key; o2.textContent = units[key].label;
            toSelect.appendChild(o2);
        });
        if (keys.length > 1) toSelect.selectedIndex = 1;
    }

    function convert() {
        const val = parseFloat(inputStr) || 0;
        const from = fromSelect.value;
        const to = toSelect.value;
        const cat = unitData[currentCategory];
        let result;
        if (cat.custom) {
            result = convertTemp(val, from, to);
        } else {
            const fromFactor = cat.units[from].factor;
            const toFactor = cat.units[to].factor;
            result = val * fromFactor / toFactor;
        }
        fromValue.textContent = inputStr;
        const formatted = Number.isInteger(result) ? result.toString() : parseFloat(result.toPrecision(10)).toString();
        toValue.textContent = formatted;
    }

    // Category tab click
    document.querySelectorAll('.unit-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.unit-cat').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-cat');
            inputStr = '0';
            populateSelects(currentCategory);
            convert();
        });
    });

    // Select change
    fromSelect.addEventListener('change', convert);
    toSelect.addEventListener('change', convert);

    // Swap button
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const tmp = fromSelect.selectedIndex;
            fromSelect.selectedIndex = toSelect.selectedIndex;
            toSelect.selectedIndex = tmp;
            convert();
        });
    }

    // Numpad
    document.querySelectorAll('.unit-key').forEach(key => {
        key.addEventListener('click', () => {
            const k = key.getAttribute('data-key');
            if (k === 'clear') {
                inputStr = '0';
            } else if (k === 'backspace') {
                inputStr = inputStr.slice(0, -1);
                if (!inputStr || inputStr === '-') inputStr = '0';
            } else if (k === 'negate') {
                if (inputStr.startsWith('-')) inputStr = inputStr.slice(1);
                else if (inputStr !== '0') inputStr = '-' + inputStr;
            } else if (k === '.') {
                if (!inputStr.includes('.')) inputStr += '.';
            } else {
                // digits: 0-9, 00, 000
                if (inputStr === '0') inputStr = k;
                else inputStr += k;
            }
            convert();
        });
    });

    // Initialize
    populateSelects(currentCategory);
    convert();
})();
