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
        } else if (view === 'currency') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'flex';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
            initCurrencyCalc();
        } else if (view === 'nlp') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'flex';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
        } else if (view === 'photo') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'flex';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'none';
            calculateEV();
            calculateCrop();
        } else if (view === 'planet') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'flex';
            if (tipCalcView) tipCalcView.style.display = 'none';
            calculatePlanetWeight();
            calculateEscapeVelocity();
        } else if (view === 'tip') {
            basicCalcView.style.display = 'none';
            currencyCalcView.style.display = 'none';
            if (nlpCalcView) nlpCalcView.style.display = 'none';
            if (photoCalcView) photoCalcView.style.display = 'none';
            if (planetCalcView) planetCalcView.style.display = 'none';
            if (tipCalcView) tipCalcView.style.display = 'flex';
            calculateTip();
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
