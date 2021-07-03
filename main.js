/**
 * @file Manages the functionalities of the Calculator
 * @author Aaron Romanick <idontneednostinkingspamemail@gmail.com>
 */

/**
 * Keypad button click/touch/key-press functionality
 * @class
 */
 class Keypad {
     
    /**
    * Array of possible keyboard key values
    * @returns {Array}
    */
    get KEYPAD_BUTTONS() {
        return [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '+', '-', '*', '/', '=', '.',
            'Escape',
            'Backspace',
            'Delete',
            'Enter',
            'Return',
        ]
    }
    
    /**
    * The string name for the class assigned to the current active keypad button
    * @returns {string}
    */
    get ACTIVE_BUTTON() { return 'btn__active' }

    /**
    * @constructor
    * @param {processInputCallback} processInputCallback - The callback that processes input into the calculator keypad buttons along with inputs stored in calculator memory
    * @param {string} selector - the selector query string for the calculator's keypad within the DOM
    */
    constructor(processInputCallback, selector = '.keypad') {
        this.root = document.querySelector(selector)
        this.processInputCallback = processInputCallback
        this.initEventListeners()
    }

    /**
    * The event handler for any mousedown/touchstart on a keypad button
    * @param {Event} evt - The mousedown/touchstart event
    */
    clickDownHandler(evt) {
        const button = evt.target
        const activeButton = this.getActiveButton()
    
        if(!button.matches('button')) return
        if(activeButton) return
    
        button.classList.add(this.ACTIVE_BUTTON)
        this.root.dataset.activeButton = button.dataset.key
    }

    /**
    * The event handler for any mouseup/touchend on a keypad button
    * @param {Event} evt - The mouseup/touchend event
    */
    clickUpHandler(evt) {
        const button = evt.target
        const activeButton = this.getActiveButton()
    
        if(!button.matches('button')) return
        if(!activeButton) return
    
        button.classList.remove(this.ACTIVE_BUTTON)
        this.root.dataset.activeButton = ''
        if(activeButton === button.dataset.key) this.processInputCallback(button)
    }

    /**
    * Finds the active button on the keypad and returns its key
    * @returns {string} The active keypad button's data "key" value
    */
    getActiveButton() {
        const activeButton = this.root.querySelector(`.${this.ACTIVE_BUTTON}`)
        return activeButton ? activeButton.dataset.key : null
    }

    /**
    * Adds event listeners to all input event types for the keypad
    */
    initEventListeners() {

        // mouse/touch events
        this.root.addEventListener('mousedown', this.clickDownHandler.bind(this))
        this.root.addEventListener('mouseup', this.clickUpHandler.bind(this))
        this.root.addEventListener('touchstart', this.clickDownHandler.bind(this))
        this.root.addEventListener('touchstop', this.clickUpHandler.bind(this))

        // key press events
        document.addEventListener('keydown', this.keyDownHandler.bind(this))
        document.addEventListener('keyup', this.keyUpHandler.bind(this))
    }

    /**
    * The event handler for any key down event on the keypad button
    * @param {Event} evt - The keydown event
    */
    keyDownHandler(evt) {
        const key = evt.key
        const activeButton = this.getActiveButton()
    
        if(!this.KEYPAD_BUTTONS.includes(key)) return
        if(activeButton) return
        
        const button = this.root.querySelector(`button[data-key*="${key}"]`)
        button.classList.add(this.ACTIVE_BUTTON)
        this.root.dataset.activeButton = key
    }

    /**
    * The event handler for any key up event on the keypad button
    * @param {Event} evt - The key up event
    */
    keyUpHandler(evt) {
        const key = evt.key
        const activeButton = this.getActiveButton()
    
        if(!this.KEYPAD_BUTTONS.includes(key)) return
        if(!activeButton) return
    
        const button = this.root.querySelector(`button[data-key*="${key}"]`)
        button.classList.remove(this.ACTIVE_BUTTON)
        this.root.dataset.activeButton = ''
        if(activeButton.includes(key)) this.processInputCallback(button)
    }
}

/**
 * Regulates the maximum digits allowed on screen based on calculator display element's width
 * @class
 */
 class DisplaySizeMonitor {

    /**
    * @constructor
    * @param {number} charBufferSize - Character buffer size to accomodate for commas in displayed number
    * @param {number} charSizeAdjustRatio - A number (ratio) between 0.0 and 1.0 to adjust the character number calculation by based on the font size
    */
    constructor({ charBufferSize = 0, charSizeAdjustRatio = 1 }) {
        this.display = document.querySelector('.display')
        this.fontSize = this.getFontSizeAsInt()
        this.charBufferSize = charBufferSize
        this.charSizeAdjustRatio = charSizeAdjustRatio
    }

    /**
    * Returns the maximum number of digits allowed on the calculator display at any one time
    * @returns {number} The maximum digits allowed on the calculator display at one time based on the calculator display width and font size
    */
    get maxDigitsAllowed() {
        const displaySize = this.getDisplaySizeAsInt()
        return Math.floor(displaySize / (this.fontSize * this.charSizeAdjustRatio)) - this.charBufferSize
    }

    /**
    * Return the font size as an integer
    * @returns {number} The font size as an integer
    */
    getFontSizeAsInt() {
        const html = document.documentElement
        const computedStyle = getComputedStyle(html)
        return parseInt(computedStyle.fontSize)
    }

    /**
    * Return the calculator display width size as an integer
    * @returns {number} The font size as an integer
    */
    getDisplaySizeAsInt() {
        const computedStyle = getComputedStyle(this.display)
        return parseInt(computedStyle.width)
    }
}

/**
 * Handles main calculator calculation values and state changes based on the calculator's display value and value(s) stored in calculator "memory"
 * @see {@link https://www.freecodecamp.org/news/how-to-build-an-html-calculator-app-from-scratch-using-javascript-4454b8714b98/}
 * @class
 */
class Calculator {
    
    /**
    * The "addition" operator
    * @returns {string}
    */
    get ADD() { return 'add' }
    
    /**
    * The "subtraction" operator
    * @returns {string}
    */
    get SUBTRACT() { return 'subtract' }
    
    /**
    * The "multiplication" operator
    * @returns {string}
    */
    get MULTIPLY() { return 'multiply' }

    /**
    * The "division" operator
    * @returns {string}
    */
    get DIVIDE() { return 'divide' }

    /**
    * The "equality" operator
    * @returns {string}
    */
    get EQUALS() { return 'equals' }
    
    /**
    * The "number" keypad button type
    * @returns {string}
    */
    get NUMBER() { return 'number' }
    
    /**
    * The "operator" keypad button type
    * @returns {string}
    */
    get OPERATOR() { return 'operator' }
    
    /**
    * The "decimal" keypad button type
    * @returns {string}
    */
    get DECIMAL() { return 'decimal' }
    
    /**
    * The "reset" keypad button type
    * @returns {string}
    */
    get RESET() { return 'reset' }
    
    /**
    * The "delete" keypad button type
    * @returns {string}
    */
    get DELETE() { return 'delete' }

    /**
    * The "error" display text
    * @returns {string}
    */
    get ERROR() { return 'Error' }

    /**
    * The maximum digits allowed on the calculator display at one time based on the calculator display width and font size
    * @returns {number} The maximum digits allowed on the calculator display at one time based on the calculator display width and font size
    */
    get maxDigitsAllowed() { return this.displaySizeMonitor.maxDigitsAllowed }
    
    /**
    * The calculator display
    * @returns {object} The display DOM object
    */
    get display() { return this.displaySizeMonitor.display }

    /**
    * @constructor
    */
    constructor() {
        this.state = {}
        this.keypad = new Keypad(this.processInput.bind(this))
        this.displaySizeMonitor = new DisplaySizeMonitor({
            charBufferSize: 3,
            charSizeAdjustRatio: 0.75
        })
    }

    /**
    * Return the calculator display width size as an integer
    * @param {(string|number)} n1 - The first number to operate on
    * @param {string} operator - The operator to operate on n1 and n2 with
    * @param {(string|number)} n2 - The second number to operate on
    * @returns {number} The result of the operation between n1 and n2 with decimals trimmed off if result is too long for calculator display
    */
    calculate(n1, operator, n2) {
        const firstNum = parseFloat(n1)
        const secondNum = parseFloat(n2)
        let result
    
        if(operator === this.ADD) result = firstNum + secondNum
        else if(operator === this.SUBTRACT) result = firstNum - secondNum
        else if(operator === this.MULTIPLY) result = firstNum * secondNum
        else if(operator === this.DIVIDE) result = firstNum / secondNum

        return this.trimDecimals(result)
    }

    /**
    * Clears calculator memory
    * @param {exclusions} [exclusions={}] - Data properties to exclude from the memory clear
    */
    clearMemory(exclusions = {}) {
        const properties = ['firstValue', 'modValue', 'operator', 'previousButtonType']
        properties.forEach(property => {
            if(!(property in exclusions)) this.state[property] = ''
        }, this)
    }

    /**
    * Returns the result string after processing the active button pressed against the current state of the calculator's memory
    * @param {object} button - The currently active button DOM element
    * @param {string} displayedNum - The input that is currently on the calculator display
    * @returns {(string|number)} The string
    */
    createResultString(button, displayedNum) {
        const buttonContent = button.textContent
        const buttonType = this.getButtonType(button)
        const {
            firstValue,
            modValue,
            operator,
            previousButtonType,
        } = this.state
        const displayedNumLength = displayedNum.length
        const {
            asString: resultString,
            asNumber: resultNumber,
        } = this.stringAndNumber(displayedNum + buttonContent)
    
        if(buttonType === this.NUMBER) {
            if(
                (resultString.length <= this.maxDigitsAllowed &&
                resultNumber <= Number.MAX_SAFE_INTEGER &&
                resultNumber >= Number.MIN_SAFE_INTEGER) ||
                (previousButtonType !== this.NUMBER &&
                previousButtonType !== this.DECIMAL)
            ) {
                return displayedNum === '0' ||
                    displayedNum === this.ERROR ||
                    previousButtonType === this.OPERATOR ||
                    previousButtonType === this.EQUALS
                    ? buttonContent
                    : resultString
            }
            return displayedNum
        }

        if(buttonType === this.DECIMAL) {
            if(
                displayedNum === this.ERROR ||
                previousButtonType === this.OPERATOR ||
                previousButtonType === this.EQUALS
            ) return '0.'
            if(
                !displayedNum.includes('.') &&
                resultString.length <= this.maxDigitsAllowed &&
                resultNumber <= Number.MAX_SAFE_INTEGER &&
                resultNumber >= Number.MIN_SAFE_INTEGER
            ) return displayedNum + '.'
            return displayedNum
        }

        if(buttonType === this.OPERATOR) {
            return firstValue &&
                operator &&
                previousButtonType !== this.OPERATOR &&
                previousButtonType !== this.EQUALS
                ? this.calculate(firstValue, operator, displayedNum)
                : displayedNum
        }

        if(buttonType === this.EQUALS) {
            if(firstValue) {
                return previousButtonType === this.EQUALS
                    ? this.calculate(displayedNum, operator, modValue)
                    : this.calculate(firstValue, operator, displayedNum)
            }
            return displayedNum
        }

        if(buttonType === this.RESET) return '0'

        if(buttonType === this.DELETE) {
            return previousButtonType === this.OPERATOR ||
                previousButtonType === this.EQUALS ||
                displayedNum === '0' ||
                displayedNumLength === 1
                ? '0'
                : displayedNum.slice(0, -1)
        }
    }

    /**
    * Get the type of action of the button passed into the method.
    * @param {object} button - The button DOM element
    * @returns {string} Returns the action type
    */
    getButtonType(button) {
        const { action } = button.dataset
    
        if(!action) return this.NUMBER
    
        if(
            action === this.ADD ||
            action === this.SUBTRACT ||
            action === this.MULTIPLY ||
            action === this.DIVIDE
        ) return this.OPERATOR
    
        return action
    }

    /**
     * Returns number with commas to make it easier to read
     * @see {@link https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript?rq=1}
     * @param {(string|number)} num - The number input to add commas to
     * @returns {string} Number with commas added
     */
    numWithCommas(num) {
        const { asString } = this.stringAndNumber(num)
        const parts = asString.split('.')
        const pattern = /\B(?=(\d{3})+(?!\d))/g
        parts[0] = parts[0].replace(pattern, ',')
        return parts.join('.');
    }

    /**
     * Returns number without commas so it can be mathematically operated on
     * @param {(string|number)} num - Number to remove commas from
     * @returns {string} Number without commas
     */
    numWithoutCommas(num) {
        const pattern = /\,/g
        const { asString } = this.stringAndNumber(num)
        return asString.replace(pattern, '')
    }

    /**
     * Processes input put into the calculator against calculator memory, validates result, updates display (if needed), and then adjusts the calculator's state accordiginly
     * @param {object} button - The currently active button DOM element
     */
    processInput(button) {
    
        const displayedNum = this.numWithoutCommas(this.display.textContent)
        const resultString = this.createResultString(button, displayedNum)
        const validatedResultString = this.validateResultString(resultString)
    
        this.display.textContent = this.numWithCommas(validatedResultString)
        this.updateCalculatorState(button, validatedResultString, displayedNum)
    }

    /**
     * Rounds a number to the specified decimal place
     * @see {@link https://gist.github.com/djD-REK/068cba3d430cf7abfddfd32a5d7903c3}
     * @param {number} num - Number to round the decimals on
     * @param {number} fractional - The exponent used to round the fractional part of the number
     * @returns {number} The result after rounding to the appropriate decimal place
     */
    roundToPlace(num, fractional) {
        const isNeg = num < 0
        const numAbs = Math.abs(num)
        const numRounded = Number(Math.round(numAbs + 'e' + fractional) + 'e-' + fractional)
        return isNeg ? -numRounded : numRounded
    }

    /**
     * When an input is ambiguously a string or a number, return both options
     * @param {(sting|number)} input - A number as either a string or number type
     * @returns {object} Both the input as a number and as a string
     */
    stringAndNumber(input) {
        return {
            asNumber: +input,
            asString: input.toString(),
        }
    }
    
    /**
     * Check to see if a number has a decimal and, if it does, remove decimals that are outside the maximum allowed digits for the calculator's display. Otherwise, simply return the number as is.
     * @param {(sting|number)} num - The number to possibly trim
     * @returns {string} The number after possible trimming
     */
    trimDecimals(num) {
        const { asString } = this.stringAndNumber(num)
        const pattern = /^(-?\d+)(\.\d+)?$/
        const matches = asString.match(pattern)
        
        if(!matches) return asString
    
        const [
            , // full match
            integer,
            fractional,
        ] = matches
        if(!fractional) return asString
    
        const integerLength = integer.length
        const maxDigitsAllowed = this.maxDigitsAllowed
        if(integerLength + 1 >= maxDigitsAllowed) return Math.round(asString)
    
        return this.roundToPlace(asString, maxDigitsAllowed - integerLength - 1) // the extra "1" accounts for the decimal point itself
    }

    /**
     * Update the calculator's state based on the output from the most recent action on the calculator
     * @param {object} button - The currently active button DOM element
     * @param {object} calculator - The calculator DOM element
     * @param {*} calculatedValue - The result from the current button's action
     * @param {*} displayedNum - The number currently on the calculator's display
     */
    updateCalculatorState(button, calculatedValue, displayedNum) {
        const buttonType = this.getButtonType(button)
        const {
            firstValue,
            modValue,
            operator,
            previousButtonType,
        } = this.state
    
        this.state.previousButtonType = buttonType
    
        if(
            buttonType === this.RESET ||
            calculatedValue === this.ERROR
        ) this.clearMemory()
    
        if(
            (buttonType === this.NUMBER ||
            buttonType === this.DECIMAL) &&
            previousButtonType === this.EQUALS
        ) this.clearMemory({ previousButtonType })
        
        if(buttonType === this.OPERATOR) {
            this.state.operator = button.dataset.action
            this.state.firstValue = firstValue &&
                operator &&
                previousButtonType !== this.OPERATOR &&
                previousButtonType !== this.EQUALS
                ? calculatedValue
                : displayedNum
        }
    
        if(buttonType === this.EQUALS) {
            this.state.modValue = firstValue && previousButtonType === this.EQUALS
                ? modValue
                : displayedNum
        }
    
        if(buttonType === this.DELETE) {
            if(
                previousButtonType === this.OPERATOR ||
                previousButtonType === this.EQUALS ||
                displayedNum === '0'
            ) this.clearMemory()
        }
    }

    /**
     * Validate the result number string and, if it is not valid, return an error instead
     * @param {(string|number)} resultString - The processed number to be validated
     * @returns {string} The result number or an error message
     */
    validateResultString(resultString) {
        const {
            asString,
            asNumber,
        } = this.stringAndNumber(resultString)
        return asString.length > this.maxDigitsAllowed ||
            asNumber === Number.POSITIVE_INFINITY ||
            asNumber === Number.NEGATIVE_INFINITY ||
            asNumber > Number.MAX_SAFE_INTEGER ||
            asNumber < Number.MIN_SAFE_INTEGER
            ? this.ERROR
            : asString
    }
}

/**
 * Handles switching the calculator's theme
 * @class
 */
class ThemeSwitcher {

    /**
    * "Light" theme string
    * @returns {string}
    */
    get LIGHT() { return 'light' }

    /**
    * "Dark" theme string
    * @returns {string}
    */
    get DARK() { return 'dark' }

    /**
    * "No preference" theme string
    * @returns {string}
    */
    get NO_PREF() { return 'no-preference' }

    /**
    * The key for localStorage by which the current calculator theme is saved under
    * @returns {string}
    */
    get STORAGE_KEY() { return 'calculatorTheme' }

    /**
    * @constructor
    */
    constructor() {
        this.html = document.documentElement
        this.initEventListeners()
    }

    /**
     * Changes checked radio button to match that of the theme value passed into the parameter
     * @param {string} mode - The theme value
     */
    checkRadioButton(mode) {
        const old = document.querySelector('.theme-toggle-input:checked')
        if(!old || old.value !== mode) document.querySelector(`.theme-toggle-input[value="${mode}"]`).checked = true
    }

    /**
     * Returns the theme based on the browser's preferred color scheme settings
     * @returns {string} The preferred color scheme theme
     */
    getPrefColorScheme() {    
        if(this.prefColorSchemeCondition(this.DARK)) return this.DARK
        if(this.prefColorSchemeCondition(this.LIGHT)) return this.LIGHT
        return this.NO_PREF
    }
    
    /**
     * Returns the current theme saved in localStorage
     * @returns {string} The saved theme value
     */
    getSavedTheme() {
        return localStorage.getItem(this.STORAGE_KEY)
    }

    /**
     * Initiates event listeners for theme toggling radio buttons
     */
    initEventListeners() {
        document.querySelectorAll('.theme-toggle-input')
            .forEach(input => {
                input.addEventListener('click', this.toggleTheme.bind(this))
            })
    }

    /**
     * Initiates event listeners for theme toggling radio buttons
     * @param {string} mode - The theme value to check against
     * @returns {boolean} Whether or not preferred color scheme is supported by browser and matches the parameter passed in
     */
    prefColorSchemeCondition(mode) {
        return window.matchMedia && window.matchMedia(`(prefers-color-scheme: ${mode})`).matches
    }

    /**
     * Sets the current theme of calculator
     * @param {string} [mode=this.getSavedTheme()] - The theme value to set
     */
    setTheme(mode = this.getSavedTheme()) {
        mode = mode || this.getPrefColorScheme()
        this.html.dataset.theme = mode
        localStorage.setItem(this.STORAGE_KEY, mode)
        this.checkRadioButton(mode)
    }

    /**
     * Toggles the new theme to the clicked radio button's value
     * @param {Event} evt - The radio button click event
     */
    toggleTheme(evt) {
        const radioButton = evt.target
        if(radioButton.id === 'theme-toggle-2') this.setTheme(this.LIGHT)
        else if(radioButton.id === 'theme-toggle-3') this.setTheme(this.DARK)
        else this.setTheme(this.NO_PREF)
    }
}

/**
 * Create new Calculator instance
 */
const calculator = new Calculator()

/**
 * Create new ThemeSwitcher instance
 */
const themeSwitcher = new ThemeSwitcher()

/**
 * Set initial theme
 */
themeSwitcher.setTheme()
