# Nullcalendar

Kalenteri-komponentti seuraavaan applikaatioosi! ES6, virtual-DOM, flexbox, ECMAScript Intl. Konseptointivaiheessa. Dev-ympäristö vaatii selaimen, joka tukee ES6-moduuleja natiivisti; ks. [lista](https://jakearchibald.com/2017/es-modules-in-browsers/).

## Features

- Inferno, preact, ja React yhteensopiva
- Minimaalinen devausympäristö, ei build toolia, ei JSX:ää, ei nodejs:ää!
- Laajennettavissa, ks. [extending](#extending)
- Lokalisaatiotuki

## Usage

Voidaan käyttää globaalista muuttujasta, AMD-moduulina, tai suoraan react-komponenttina. Inferno, preact, tai React tulee ladata ennen nullcalendaria.

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

### Usage - JSX

```jsx
class SomeComponent extends React.Component {
    render() {
        return <div>
            <h1>Hurrdurr</h1>
            <nullcalendar.Calendar /*defaultView="week" someOtherSetting={ asd }*//>
        </div>;
    }
}
```

### Example settings

```javascript
const mySettings = {
    /**
     * Näkymän nimi, johon kalenteri aluksi renderöityy.
     *
     * @prop {string} 'week'|'month'|'day'
     * @default 'week'
     */
    defaultView: 'week',
    /**
     * Ajankohta, jota kalenteri käyttää alustavan aikakursorin luomisessa.
     *
     * @prop {Date}
     * @default new Date()
     */
    defaultDate: new Date(2017, 6, 30),
    /**
     * Ladattavat sisältökerrokset.
     *
     * @prop {string|Object[]}
     * @default []
     */
    contentLayers: [
        'event',
        // tai
        {name: 'event'}
    ],
    /**
     * Toolbariin renderöitävät sarakkeet, ja niiden sisältö. Mahdolliset arvot:
     * fill, prev, next, today, title, month, week ja day. "|" -merkki luo uuden
     * sarakkeen.
     *
     * @prop {string}
     * @default 'prev,next,today|title|month,week,day'
     */
    toolbarParts: 'fill|title|week,month',
    /**
     * Funktiot, joilla voi kustomoida kalenterin otsakkeiden formaattia.
     *
     * @prop {Object}
     * @default null
     */
    titleFormatters: {
        day: dateCursorRange => dateCursorRange.start.getDate()
        // week: {Function}
        // month: {Function}
    },
    /**
     * Leveys pikseleinä, jonka ikkuna täytyy olla vähintään, että kalenterin
     * sisältö renderöidään täysiversiona. Vastaavasti ikkunan leveyden ollessa
     * määriteltyä arvoa vähemmän, näytetään sisältö compact-muodossa. Day-näky-
     * mällä ei ole erillistä compact-muotoa.
     *
     * @prop {number}
     * @default 800
     */
    layoutChangeBreakPoint: 600,
    /**
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
     *
     * @prop {string|string[]}
     * @default undefined aka. selainmoottori päättää
     */
    locale: 'fi'
};
```

## Extending

```javascript
// -- 1. Implementoi ----
// -----------------------------------------------------------------------------
class MyContentLayer {
    /**
     * @param {string} myArgument
     * @param {Object} contentController Vastaa mm. sisällön päivityksestä @see https://github.com/ut4/ncalendar#contentcontroller-api
     * @param {Object} calendarController Vastaa yhden kalenterin ohjailusta. Sama kuin nullcalendar.newCalendar() paluuarvo. @see https://github.com/ut4/ncalendar#calendarcontroller-api
     */
    constructor(myArgument, contentController, calendarController) {
        console.log(typeof contentController.refresh);     // function
        console.log(typeof calendarController.changeView); // function
        this.contentController = contentController;
        this.text = myArgument;
    }
    /**
     * Triggeröityy aina kun sivu ladataan, kalenterin näkymä vaihtuu, tai
     * kalenterin cursorRange päivittyy. Hyvä paikka ladata jotain esim.
     * backendistä..
     *
     * Jos metodi palauttaa false|promisejokaresolvaafalse, layerin dekorointi ja
     * renderöinti ohitetaan, muussa tapauksessa paluuarvoa ei huomioida mitenkään.
     *
     * @param {string} loadType 'initial'|'navigation'|'view-change'
     * @returns {any}
     */
    load(loadType) {
        console.log('Loadtype:' + loadType);
        if (loadType !== this.contentController.LoadType.INITIAL) {
            return false;
        }
        return Promise.resolve().then(() => {
            console.log('Valmis!');
        });
    }
    /**
     * Kutsutaan aina, kun kalenterisisältö renderöi sisältösolut aka. gridin
     * kalenterin latautuessa, tai navigaatiotapahtuman yhteydessä. Hyvä paikka
     * modifioida cellin children, clickHandlers, tai content -arvoja..
     *
     * @param {Object} cell Kalenterin yksi sisältösolu, Cell|PlaceholderCell
     * @returns {void}
     */
    decorateCell(cell) {
        if (cell instanceof this.contentController.PlaceholderCell) {
            return;
        }
        if (cell.date.getDay() === 5) {
            cell.content = `Friday, ${this.text}!`;
            // contentController.refresh = dekoroi & renderöi layerit uudelleen
            // contentController.reRender = pelkästään renderöi layerit uudelleen
            cell.clickHandlers.push((cell, e) => {
                if (Math.random() > 0.5) {
                    console.log('Refreshing...');
                    this.text = this.text === 'yayy' ? 'nyayy' : 'yayy';
                    this.contentController.refresh();
                } else {
                    console.log('ReRendering...');
                    cell.content += '!';
                    this.contentController.reRender();
                }
            });
        }
    }
}

// -- 2. Rekisteröi ----
// -----------------------------------------------------------------------------
// (a) - preconfiguroitu
nullcalendar.registerContentLayer('foo1', (contentCtrl, calendarCtrl) =>
    new MyContentLayer('yayy', contentCtrl, calendarCtrl)
);
// (b) - configuroimaton
nullcalendar.registerContentLayer('foo2', MyContentLayer);


// -- 3. Ota käyttöön ----
// -----------------------------------------------------------------------------
// (a) - preconfiguroitu
nullcalendar.newCalendar(myEl, {contentLayers: ['foo1']});
// (b) - configuroimaton
nullcalendar.newCalendar(myEl, {contentLayers: [
    {name:'foo2', args: (contentCtrl, calendarCtrl) => ['yayy', contentCtrl, calendarCtrl]}
]});
```

## Global-API

### Methods

- nullcalendar.newCalendar(el[, settings])
- nullcalendar.registerContentLayer(name, layer)

### Properties

- nullcalendar.Calendar

## CalendarController-API

### Methods

- calendarController.changeView(to)
- calendarController.openModal(componentConstruct)
- calendarController.closeModal()

### Getters

- calendarController.currentView
- calendarController.dateCursor
- calendarController.settings
- calendarController.isCompactViewEnabled

## ContentController-API

### Methods

- contentController.refresh()
- contentController.reRender()

### Properties

- contentController.LoadType
- contentController.Cell
- contentController.PlaceholderCell

## Events-extension

### Usage

```javascript
<script src="inferno-preact-or-react.js"></script>
<script src="dist/nullcalendar+events.min.js"></script>
nullcalendar.newCalendar(document.getElementById('cal'), {contentLayers: [
    {name: 'event', args: (contentCtrl, calCtrl) =>
        [{repository: 'memory'}, contentCtrl, calCtrl]
    }
]});
```

# License

BSD-3-Clause
