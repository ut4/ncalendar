# Nullcalendar

Kalenteri-komponentti seuraavaan applikaatioosi! ES6, virtual-DOM, flexbox, ECMAScript Intl. Vaatii modernin selaimen.

## Features

- Inferno, preact, ja React yhteensopiva
- Minimaalinen devausympäristö, ei build toolia, ei JSX:ää, ei nodejs:ää!
- Laajennettavissa, ks. [Extending](#extending)

## Usage

Voidaan käyttää globaalista muuttujasta tai AMD-moduulina. Inferno, preact, tai React tulee ladata ennen nullcalendaria.

### Usage - Inferno

```html
<!-- Inferno 28.9KB -->
<script src="unpkg.com/inferno@3.2.2/dist/inferno.min.js"></script>
<script src="unpkg.com/inferno-component@3.2.2/dist/inferno-component.min.js"></script>
<script src="unpkg.com/inferno-create-element@3.2.2/dist/inferno-create-element.min.js"></script>
<script src="dist/nullcalendar.min.js"></script>
<script>nullcalendar.newCalendar(document.getElementById('foo')/*, settings*/);</script>
```

### Usage - preact

```html
<!-- preact 7,9KB -->
<script src="unpkg.com/preact@8.1.0/dist/preact.min.js"></script>
<script src="dist/nullcalendar.min.js"></script>
<script>nullcalendar.newCalendar(document.getElementById('foo')/*, settings*/);</script>
```

### Usage - React

```html
<!-- React 133KB -->
<script src="unpkg.com/react@0.14.9/dist/react.min.js"></script>
<script src="unpkg.com/react-dom@0.14.9/dist/react-dom.min.js"></script>
<script src="dist/nullcalendar.min.js"></script>
<script>nullcalendar.newCalendar(document.getElementById('foo')/*, settings*/);</script>
```

### Example settings

```javascript
const mySettings = {
    defaultView: 'week',      // {string} week|month|day, default week
    contentLayers: ['event'], // {Array}, default []
    titleFormatters: {        // {Object} default null
        day: dateCursorRange => dateCursorRange.start.getDate()
        // week: {Function}
        // month: {Function}
    }
};
```

##Extending

```javascript
class MyContentLayer {
    /**
     * @param {Object} contentController Vastaa mm. sisällön päivityksestä
     * @param {Object} calendarController Vastaa yhden kalenterin ohjailusta. Sama kuin nullcalendar.newCalendar() paluuarvo.
     */
    constructor(contentController, calendarController) {
        console.log(typeof contentController.refresh);     // function
        console.log(typeof calendarController.changeView); // function
        this.contentController = contentController;
        this.content = 'yayy';
    }
    /**
     * Triggeröityy aina kun sivu ladataan, kalenterin view vaihtuu, tai
     * kalenterin cursorRange päivittyy. Hyvä paikka ladata jotain esim.
     * backendistä...
     *
     * @returns {Promise}
     */
    load() {
        return Promise.resolve().then(() => {
            console.log('Valmis!');
        });
    }
    /**
     * Kutsutaan aina, kun kalenterisisältö renderöi sisältösolut aka. gridin
     * kalenterin latautuessa, tai navigaatiotapahtuman yhteydessä. Hyvä paikka
     * modifioida cellin children, clickHandlers, tai content -arvoja.
     *
     * @param {Object}
     * @returns {void}
     */
    decorateCell(cell) {
        if (cell.date.getDay() === 5) {
            cell.content = `Friday, ${this.content}!`;
            cell.clickHandlers.push(e => {
                this.content = this.content === 'yayy' ? 'nyayy' : 'yayy';
                this.contentController.refresh();
            });
        }
    }
}
nullcalendar.registerContentLayer('foo', MyContentLayer);
nullcalendar.newCalendar(document.getElementById('cal'), {contentLayers: ['foo']});
```

# License

BSD-3-Clause
