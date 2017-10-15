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
     * Ladattavat laajennokset.
     *
     * @prop {string[]}
     * @default []
     */
    extensions: ['event'],
    /**
     * Toolbariin renderöitävät sarakkeet, ja niiden sisältö. Mahdolliset arvot:
     * fill, prev, next, today, title, month, week ja day, ja näiden lisäksi
     * laajennoksien rekisteröimät arvot. "|" -merkki luo uuden sarakkeen.
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
     * Vuorokauden tunnit, jotka renderöidään Week-, ja Day-näkymissä.
     *
     * @prop {Object}
     * @default {first: 6, last: 17}
     */
    hours: {first: 8, last: 16},
    /**
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
     *
     * @prop {string|string[]}
     * @default undefined aka. selainmoottori päättää
     */
    locale: 'fi'
    //
    // Esim. laajennos-spesifisiä asetuksia tänne
};
```

## Extending

```javascript
// -- 1. Implementoi ----
// -----------------------------------------------------------------------------
import { LoadType, PlaceholderCell } from './src/Content.js';

/*
 * Laajennos, joka lisää kalenterin jokaisen perjantain sisällöksi {this.fridayText}.
 *
 * Note: load, decorateCell, addToolbarPartFactories, ja static defineSettings on
 * laajennos-rajapinnan metodeja, joista kolme ensimmäistä on pakollisia.
 */
class MyExtension {
    /**
     * @param {Object} calendarController Vastaa yhden kalenterin ohjailusta. Sama kuin nullcalendar.newCalendar() paluuarvo. @see https://github.com/ut4/ncalendar#calendarcontroller-api
     */
    constructor(calendarController) {
        console.log(typeof calendarController.changeView); // function
        this.calendar = calendarController;
        this.setFridayText(calendarController.settings.myExtensionFridayText);
    }
    /**
     * Triggeröityy aina kun sivu ladataan, kalenterin näkymä vaihtuu, tai
     * kalenterin cursorRange päivittyy. Hyvä paikka ladata jotain esim.
     * backendistä..
     *
     * Jos metodi palauttaa false|promisejokaresolvaafalse, laajennoksen dekorointi ja
     * renderöinti ohitetaan, muussa tapauksessa paluuarvoa ei huomioida mitenkään.
     *
     * @param {string} loadType 'initial'|'navigation'|'view-change'
     * @returns {any}
     */
    load(loadType) {
        console.log('Loadtype:' + loadType);
        if (loadType !== LoadType.INITIAL) {
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
        if (cell instanceof PlaceholderCell) {
            return;
        }
        if (cell.date.getDay() === 5) {
            cell.content = `Friday, ${this.fridayText}!`;
            // contentController.refresh = dekoroi & renderöi laajennokset uudelleen
            // contentController.reRender = pelkästään renderöi laajennokset uudelleen
            cell.clickHandlers.push((cell, e) => {
                if (Math.random() > 0.5) {
                    console.log('Refreshing...');
                    this.fridayText = this.fridayText === 'yayy' ? 'nyayy' : 'yayy';
                    this.calendar.contentController.refresh();
                } else {
                    console.log('ReRendering...');
                    cell.content += '!';
                    this.calendar.contentController.reRender();
                }
            });
        }
    }
    /**
     * Mahdollista custom -toolbar-osien lisäyksen kalenteriin, joihin taas voidaan
     * viitata settings-objektin toolbarParts-asetuksessa.
     *
     * @param {Object} toolbarPartRegister @see https://github.com/ut4/ncalendar#toolbarpartregister
     */
    addToolbarPartFactories(toolbarPartRegister) {
        toolbarPartRegister.add(
            // Toolbar-osan nimi
            'abutton',
            // Toolbar-osa -factory
            () => $el(
                'span',
                {onClick: () =>
                    this.calendar.getExtension('foo').setAndRenderFridayText('fyyyy')
                },
                'Click dis '
            )
        );
        // toolbarPartRegister.add('someOtherProp', ...) ...
    }
    /**
     * Mahdollistaa custom-asetuksien lisäyksen kalenteriin. Esim. settingsRegister.add(
     * 'myExtensionFoo', ...) -kutsun jälkeen lisättyä asetusta 'myExtensionFoo'
     * voidaan käyttää uutta kalenteria luodessa: newCalendar(el, {
     *     myExtensionFoo: 'someValue',
     *     ...
     * }). Note: staattinen metodi, kutsutaan ennen laajennoksen luomista.
     *
     * @param {Object} settingsRegister @see https://github.com/ut4/ncalendar#settingsregister
     */
    static defineSettings(settingsRegister) {
        settingsRegister.add(
            // Asetuksen nimi
            'myExtensionFridayText',
            // Arvon validaattori. Palauttaa virheviestin (invalid), tai minkä tahansa muun arvon (valid).
            text => typeof text !== 'string' ? '%s tulisi olla merkkijono' : true,
            // Käytettävä oletusarvo sen puuttuessa kalenterin asetuksissa
            'yayy'
        );
        // settingsRegister.add('myExtensionSomeOtherProp', ...) ...
    }
    /**
     * Aseta jokaiselle perjantaille lisättävä teksti.
     *
     * @param {string} someText
     */
    setFridayText(someString) {
        this.fridayText = someString;
    }
    /**
     * Laajennoksen ulkopuolelta kutsuttava metodi.
     */
    setAndRenderFridayText(newText) {
        this.setFridayText(newText);
        this.calendar.contentController.refresh();
    }
}

// -- 2. Rekisteröi ----
// -----------------------------------------------------------------------------
nullcalendar.registerExtension('foo', MyExtension);
// tai
// nullcalendar.registerExtension('foo', calCtrl => new MyExtension(calCtrl));

// -- 3. Ota käyttöön ----
// -----------------------------------------------------------------------------
nullcalendar.newCalendar(document.getElementById('cal'), {
    extensions: ['foo'],
    toolbarParts: 'prev,next,today|title|abutton,month,week,day',
    myExtensionFridayText: 'yayy'
});
```

## Global-API

### Methods

- nullcalendar.newCalendar(el[, settings])
- nullcalendar.registerExtension(name, extension)

### Properties

- nullcalendar.Calendar

## CalendarController-API

### Methods

- calendarController.changeView(to)
- calendarController.openModal(componentConstruct)
- calendarController.closeModal()
- calendarController.getExtension(name)

### Getters

- calendarController.currentView
- calendarController.dateCursor
- calendarController.settings
- calendarController.isCompactViewEnabled
- calendarController.contentController
- calendarController.dateUtils

## ContentController-API

### Methods

- contentController.refresh()
- contentController.reRender()

## ToolbarPartRegister

### Methods

- toolbarPartRegister.add(name, factoryFn)

## SettingsRegister

### Methods

- settingsRegister.add(name, validator[, defaultValue])

# Events-extension

## Usage

```javascript
<script src="inferno-preact-or-react.js"></script>
<script src="dist/nullcalendar+events.min.js"></script>
nullcalendar.newCalendar(document.getElementById('cal'), {
    extensions: [
        {name: 'event', setup: ee => ee.initialize({repository: 'memory'})}
    ],
    // Event-laajennoksen rekisteröimät arvot: event-categories ja event-tags.
    toolbarParts: 'prev,next,today|title|event-categories,week,month'
});
```

# License

BSD-3-Clause
