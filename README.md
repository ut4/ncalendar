# Nullcalendar

Kalenteri-komponentti seuraavaan applikaatioosi! ES6, ECMAScript Intl, flexbox, virtual-DOM.

## Usage

```
<script src="vendor/app-vendor.js"></script>
<script src="dist/nullcalendar.min.js"></script>
<script>nullcalendar.newCalendar(document.getElementById('foo')/*, config*/);</script>
```

## Example config

```
const myConfig = {
    defaultView: 'week',      // {string} week|month|day, default week
    contentLayers: ['event'], // {Array}, default []
    titleFormatters: {        // {Object} default null
        day: dateCursorRange => dateCursorRange.start.getDate()
        // week: {Function}
        // month: {Function}
    }
};
```

# License

BSD-3-Clause
