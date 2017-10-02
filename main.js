import './app-header.js';
import nullcalendar from './nullcalendar.js';
import EventExtension from './src/event/EventExtension.js';
import RepositoryFactory from './src/event/RepositoryFactory.js';

nullcalendar.registerExtension('event', EventExtension);
nullcalendar.events = {EventExtension, RepositoryFactory};

export default nullcalendar;
