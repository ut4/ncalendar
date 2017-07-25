import './app-header.js';
import nullcalendar from './nullcalendar.js';
import EventLayer from './src/event/EventLayer.js';
import RepositoryFactory from './src/event/RepositoryFactory.js';

nullcalendar.registerContentLayer('event', EventLayer);
nullcalendar.events = {EventLayer, RepositoryFactory};

export default nullcalendar;
