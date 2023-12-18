## Postman URL

[http://localhost:9000/api/appointments](http://localhost:9000/api/appointments)

## VRAGEN

**Hoe werkt Koa?**
Koa werkt met async middlewares die in een onion model werken. De volgorde is belangrijk.

**Verschil tussen `return next()` & `await next()`?**
Na de `return` kun je niets uitvoeren daarna, maar na `await` kun je nog andere taken uitvoeren, bijvoorbeeld een `console.log()`.

Volgende stap: alle routers van de index.js verwijderen en op een new index.js in rest folder insteken
samen met: health.js en appointment.js

cannot update a patient
delete and update a doctor is not available
a patient and doctor sees all the appointments