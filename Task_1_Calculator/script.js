/**
 * SafeCalculator
 * A standard + scientific calculator.
 * Expression is kept as a token list (`expressionTokens` + `currentInput`)
 * and evaluated with a small shunting-yard -> RPN pipeline instead of
 * `eval()`, so arbitrary input can never run as code.
 */
class SafeCalculator {
  constructor() {
    this.expressionTokens = [];
    this.currentInput = '0';
    this.isScientific = false;
    this.angleUnit = 'DEG';
    this.isEvaluated = false;
    this.hasError = false; // tracks error state directly, instead of reading it back off the DOM

    // History is kept in memory only — a page refresh clears it on purpose.
    this.history = [];
    this.maxHistoryEntries = 30;

    this.expressionDisplay = document.getElementById('expression-display');
    this.previewDisplay = document.getElementById('preview-display');
    this.mainDisplay = document.getElementById('main-display');
    this.modeToggleBtn = document.getElementById('mode-toggle');
    this.scientificPanel = document.getElementById('scientific-panel');
    this.calculatorContainer = document.querySelector('.calculator-container');
    this.angleToggleBtn = document.getElementById('angle-toggle');
    this.historyToggleBtn = document.getElementById('history-toggle');
    this.historyPanel = document.getElementById('history-panel');
    this.historyList = document.getElementById('history-list');
    this.historyClearBtn = document.getElementById('history-clear');

    this.initEvents();
  }

  // ---------------------------------------------------------
  // Event wiring
  // ---------------------------------------------------------
  initEvents() {
    document.querySelector('.keypad-area').addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      const action = btn.dataset.action;
      const value = btn.dataset.value;
      this.handleInput(action, value);
    });

    this.modeToggleBtn.addEventListener('click', () => this.toggleScientificMode());
    document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));

    if (this.historyToggleBtn) {
      this.historyToggleBtn.addEventListener('click', () => this.toggleHistoryPanel());
    }

    if (this.historyClearBtn) {
      this.historyClearBtn.addEventListener('click', () => this.clearHistory());
    }

    if (this.historyList) {
      this.historyList.addEventListener('click', (e) => {
        const item = e.target.closest('.history-item');
        if (item) this.useHistoryEntry(item.dataset.result);
      });
    }
  }

  toggleHistoryPanel() {
    this.historyPanel.classList.toggle('hidden');
    const isOpen = !this.historyPanel.classList.contains('hidden');
    this.historyToggleBtn.setAttribute('aria-expanded', isOpen);
  }

  toggleScientificMode() {
    this.isScientific = !this.isScientific;
    this.modeToggleBtn.setAttribute('aria-checked', this.isScientific);

    if (this.isScientific) {
      this.scientificPanel.classList.remove('hidden');
      this.calculatorContainer.classList.add('scientific-active');
    } else {
      this.scientificPanel.classList.add('hidden');
      this.calculatorContainer.classList.remove('scientific-active');
    }
  }

  toggleAngleUnit() {
    this.angleUnit = this.angleUnit === 'DEG' ? 'RAD' : 'DEG';
    if (this.angleToggleBtn) {
      this.angleToggleBtn.textContent = this.angleUnit;
    }
    this.updatePreview();
  }

  // ---------------------------------------------------------
  // Input dispatch
  // ---------------------------------------------------------
  handleInput(action, value) {
    if (this.hasError) {
      this.clearAll();
    }

    switch (action) {
      case 'digit':
        this.appendDigit(value);
        break;
      case 'decimal':
        this.appendDecimal();
        break;
      case 'operator':
        this.appendOperator(value);
        break;
      case 'func':
        this.appendFunction(value);
        break;
      case 'constant':
        this.appendConstant(value);
        break;
      case 'paren':
        this.appendParenthesis(value);
        break;
      case 'action':
        if (value === 'fact') this.appendFactorial();
        break;
      case 'negate':
        this.toggleSign();
        break;
      case 'clear':
        this.clearAll();
        break;
      case 'delete':
        this.deleteCharacter();
        break;
      case 'equals':
        this.calculateResult();
        break;
      case 'angle-toggle':
        this.toggleAngleUnit();
        break;
    }

    this.updateDisplay();
  }

  // ---------------------------------------------------------
  // Building the expression
  // ---------------------------------------------------------
  appendDigit(digit) {
    if (this.isEvaluated) {
      this.currentInput = digit;
      this.expressionTokens = [];
      this.isEvaluated = false;
      return;
    }

    this.currentInput = this.currentInput === '0' ? digit : this.currentInput + digit;
  }

  appendDecimal() {
    if (this.isEvaluated) {
      this.currentInput = '0.';
      this.expressionTokens = [];
      this.isEvaluated = false;
      return;
    }

    if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
    }
  }

  appendOperator(op) {
    if (this.isEvaluated) {
      this.expressionTokens = [this.currentInput];
      this.isEvaluated = false;
    } else if (this.currentInput !== '') {
      this.expressionTokens.push(this.currentInput);
    }

    const lastToken = this.expressionTokens[this.expressionTokens.length - 1];

    if (this.isOperator(lastToken) && this.currentInput === '') {
      // Swap a trailing operator instead of stacking two in a row.
      this.expressionTokens[this.expressionTokens.length - 1] = op;
    } else if (this.expressionTokens.length > 0) {
      this.expressionTokens.push(op);
      this.currentInput = '';
    }
  }

  appendFunction(funcName) {
    if (this.isEvaluated) {
      this.expressionTokens = [];
      this.isEvaluated = false;
    }

    if (this.currentInput !== '' && this.currentInput !== '0') {
      // "5sin(" reads as 5 × sin(...)
      this.expressionTokens.push(this.currentInput);
      this.expressionTokens.push('×');
    }

    this.expressionTokens.push(funcName);
    this.expressionTokens.push('(');
    this.currentInput = '';
  }

  appendConstant(constant) {
    if (this.isEvaluated) {
      this.expressionTokens = [];
      this.isEvaluated = false;
    }
    this.currentInput = constant;
  }

  appendParenthesis(paren) {
    if (this.isEvaluated) {
      this.expressionTokens = [];
      this.isEvaluated = false;
    }

    if (paren === '(') {
      if (this.currentInput !== '' && this.currentInput !== '0') {
        this.expressionTokens.push(this.currentInput);
        this.expressionTokens.push('×');
      }
      this.expressionTokens.push('(');
      this.currentInput = '';
    } else {
      if (this.currentInput !== '') {
        this.expressionTokens.push(this.currentInput);
        this.currentInput = '';
      }
      this.expressionTokens.push(')');
    }
  }

  appendFactorial() {
    if (this.currentInput !== '') {
      this.expressionTokens.push(this.currentInput);
      this.expressionTokens.push('!');
      this.currentInput = '';
    }
  }

  toggleSign() {
    if (this.currentInput !== '' && this.currentInput !== '0') {
      this.currentInput = this.currentInput.startsWith('-')
        ? this.currentInput.slice(1)
        : '-' + this.currentInput;
    }
  }

  clearAll() {
    this.expressionTokens = [];
    this.currentInput = '0';
    this.isEvaluated = false;
    this.hasError = false;
    this.previewDisplay.textContent = '';
  }

  deleteCharacter() {
    if (this.isEvaluated) {
      this.clearAll();
      return;
    }

    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
    } else if (this.currentInput.length === 1) {
      this.currentInput = '0';
    } else if (this.expressionTokens.length > 0) {
      const removed = this.expressionTokens.pop();
      if (!this.isOperator(removed) && !this.isFunction(removed) && removed !== '(' && removed !== ')') {
        this.currentInput = removed;
      }
    }
  }

  // ---------------------------------------------------------
  // Evaluation
  // ---------------------------------------------------------
  calculateResult() {
    const fullTokens = [...this.expressionTokens];
    if (this.currentInput !== '') {
      fullTokens.push(this.currentInput);
    }
    if (fullTokens.length === 0) return;

    try {
      const result = this.evaluateTokens(fullTokens);
      if (!isFinite(result) || isNaN(result)) {
        this.showError();
        return;
      }

      const expressionText = this.formatExpression(fullTokens);
      const resultText = this.formatNumber(result);

      this.expressionDisplay.textContent = expressionText + ' =';
      this.currentInput = resultText;
      this.expressionTokens = [];
      this.previewDisplay.textContent = '';
      this.isEvaluated = true;

      this.addToHistory(expressionText, resultText);
    } catch (e) {
      this.showError();
    }
  }

  updatePreview() {
    if (this.isEvaluated) return;

    const fullTokens = [...this.expressionTokens];
    if (this.currentInput !== '') {
      fullTokens.push(this.currentInput);
    }

    if (fullTokens.length < 3) {
      this.previewDisplay.textContent = '';
      return;
    }

    try {
      const result = this.evaluateTokens(fullTokens);
      this.previewDisplay.textContent =
        isFinite(result) && !isNaN(result) ? '= ' + this.formatNumber(result) : '';
    } catch (e) {
      this.previewDisplay.textContent = '';
    }
  }

  evaluateTokens(tokens) {
    const sanitized = this.normalizeTokens(tokens);
    const rpn = this.shuntingYard(sanitized);
    return this.evaluateRPN(rpn);
  }

  normalizeTokens(tokens) {
    return tokens.map((token) => {
      if (token === 'π') return Math.PI.toString();
      if (token === 'e') return Math.E.toString();
      return token;
    });
  }

  getPrecedence(op) {
    if (op === '+' || op === '−') return 1;
    if (op === '×' || op === '÷' || op === '%') return 2;
    if (op === '^') return 3;
    if (this.isFunction(op) || op === '!') return 4;
    return 0;
  }

  isOperator(token) {
    return ['+', '−', '×', '÷', '%', '^'].includes(token);
  }

  isFunction(token) {
    return ['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'sqr'].includes(token);
  }

  // Standard shunting-yard: turns the infix token list into
  // Reverse Polish Notation so it can be evaluated left to right.
  shuntingYard(tokens) {
    const outputQueue = [];
    const operatorStack = [];

    for (const token of tokens) {
      if (!isNaN(parseFloat(token))) {
        outputQueue.push(token);
      } else if (this.isFunction(token)) {
        operatorStack.push(token);
      } else if (this.isOperator(token)) {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== '(' &&
          this.getPrecedence(operatorStack[operatorStack.length - 1]) >= this.getPrecedence(token)
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      } else if (token === '!') {
        outputQueue.push(token);
      } else if (token === '(') {
        operatorStack.push(token);
      } else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.pop(); // discard the matching '('
        if (operatorStack.length > 0 && this.isFunction(operatorStack[operatorStack.length - 1])) {
          outputQueue.push(operatorStack.pop());
        }
      }
    }

    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop());
    }

    return outputQueue;
  }

  evaluateRPN(rpn) {
    const stack = [];

    for (const token of rpn) {
      if (!isNaN(parseFloat(token))) {
        stack.push(parseFloat(token));
      } else if (this.isOperator(token)) {
        const b = stack.pop();
        const a = stack.pop();
        switch (token) {
          case '+': stack.push(a + b); break;
          case '−': stack.push(a - b); break;
          case '×': stack.push(a * b); break;
          case '÷':
            if (b === 0) throw new Error('Division by zero');
            stack.push(a / b);
            break;
          case '%': stack.push(a % b); break;
          case '^': stack.push(Math.pow(a, b)); break;
        }
      } else if (this.isFunction(token)) {
        const a = stack.pop();
        const rad = this.angleUnit === 'DEG' ? (a * Math.PI) / 180 : a;
        switch (token) {
          case 'sin': stack.push(Math.sin(rad)); break;
          case 'cos': stack.push(Math.cos(rad)); break;
          case 'tan': stack.push(Math.tan(rad)); break;
          case 'ln':
            if (a <= 0) throw new Error('Invalid input');
            stack.push(Math.log(a));
            break;
          case 'log':
            if (a <= 0) throw new Error('Invalid input');
            stack.push(Math.log10(a));
            break;
          case 'sqrt':
            if (a < 0) throw new Error('Invalid input');
            stack.push(Math.sqrt(a));
            break;
          case 'sqr': stack.push(a * a); break;
        }
      } else if (token === '!') {
        const a = stack.pop();
        stack.push(this.factorial(a));
      }
    }

    if (stack.length !== 1) throw new Error('Invalid Expression');
    return stack[0];
  }

  factorial(n) {
    if (n < 0 || !Number.isInteger(n)) throw new Error('Invalid Factorial');
    if (n === 0 || n === 1) return 1;

    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  // ---------------------------------------------------------
  // Display
  // ---------------------------------------------------------
  showError() {
    this.mainDisplay.textContent = 'Error';
    this.expressionDisplay.textContent = '';
    this.previewDisplay.textContent = '';
    this.expressionTokens = [];
    this.currentInput = '';
    this.isEvaluated = true;
    this.hasError = true;
  }

  formatNumber(num) {
    if (Math.abs(num) < 1e-7 && num !== 0) return num.toExponential(4);
    if (Math.abs(num) > 1e10) return num.toExponential(4);
    return parseFloat(num.toFixed(8)).toString();
  }

  formatExpression(tokens) {
    return tokens.join(' ');
  }

  updateDisplay() {
    if (this.hasError) return;

    this.mainDisplay.textContent = this.currentInput || '0';
    this.expressionDisplay.textContent = this.formatExpression(this.expressionTokens);

    this.adjustFontSize();
    this.updatePreview();
  }

  adjustFontSize() {
    const len = this.mainDisplay.textContent.length;
    if (len > 12) {
      this.mainDisplay.style.fontSize = '1.2rem';
    } else if (len > 8) {
      this.mainDisplay.style.fontSize = '1.5rem';
    } else {
      this.mainDisplay.style.fontSize = '1.9rem';
    }
  }

  // ---------------------------------------------------------
  // History (in-memory only — cleared on refresh, by design)
  // ---------------------------------------------------------
  addToHistory(expressionText, resultText) {
    this.history.unshift({ expression: expressionText, result: resultText });
    if (this.history.length > this.maxHistoryEntries) {
      this.history.length = this.maxHistoryEntries;
    }
    this.renderHistory();
  }

  clearHistory() {
    this.history = [];
    this.renderHistory();
  }

  useHistoryEntry(resultText) {
    this.currentInput = resultText;
    this.expressionTokens = [];
    this.isEvaluated = true;
    this.hasError = false;
    this.updateDisplay();
  }

  renderHistory() {
    if (!this.historyList) return;

    if (this.history.length === 0) {
      this.historyList.innerHTML = '<li class="history-empty">No calculations yet</li>';
      return;
    }

    this.historyList.innerHTML = '';
    for (const entry of this.history) {
      const item = document.createElement('li');
      item.className = 'history-item';
      item.dataset.result = entry.result;

      const expressionEl = document.createElement('span');
      expressionEl.className = 'history-expression';
      expressionEl.textContent = entry.expression + ' =';

      const resultEl = document.createElement('span');
      resultEl.className = 'history-result';
      resultEl.textContent = entry.result;

      item.append(expressionEl, resultEl);
      this.historyList.appendChild(item);
    }
  }

  // ---------------------------------------------------------
  // Keyboard support
  // ---------------------------------------------------------
  handleKeyboardInput(e) {
    if (e.key >= '0' && e.key <= '9') {
      this.triggerButtonVisual('digit', e.key);
      this.handleInput('digit', e.key);
    } else if (e.key === '.') {
      this.triggerButtonVisual('decimal', '.');
      this.handleInput('decimal', '.');
    } else if (e.key === '+') {
      this.triggerButtonVisual('operator', '+');
      this.handleInput('operator', '+');
    } else if (e.key === '-') {
      this.triggerButtonVisual('operator', '−');
      this.handleInput('operator', '−');
    } else if (e.key === '*') {
      this.triggerButtonVisual('operator', '×');
      this.handleInput('operator', '×');
    } else if (e.key === '/') {
      e.preventDefault();
      this.triggerButtonVisual('operator', '÷');
      this.handleInput('operator', '÷');
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      this.triggerButtonVisual('equals', '=');
      this.handleInput('equals', '=');
    } else if (e.key === 'Backspace') {
      this.triggerButtonVisual('delete', 'DEL');
      this.handleInput('delete', null);
    } else if (e.key === 'Escape') {
      this.triggerButtonVisual('clear', 'AC');
      this.handleInput('clear', null);
    } else if (e.key === '(' || e.key === ')') {
      if (this.isScientific) {
        this.triggerButtonVisual('paren', e.key);
        this.handleInput('paren', e.key);
      }
    }
  }

  triggerButtonVisual(action, value) {
    let selector = `.btn[data-action="${action}"]`;
    if (value) {
      selector += `[data-value="${value}"]`;
    }
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('active-key');
      setTimeout(() => btn.classList.remove('active-key'), 120);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SafeCalculator();
});