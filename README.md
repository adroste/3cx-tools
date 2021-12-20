# 3cx-tools

Collection of several tools for 3CX.

## Related projects

* 3cx REST API: https://github.com/adroste/3cx-api


# Tools / Features

## 3cx-tools-server

Features:
* automatic phonebook generation - generates IP phone compatible phonebook that includes all saved phone numbers
  * supported manufacturers (yet): yealink, fanvil, snom
* automatic install of realtime call overview panel

---

## Webclient Realtime Call Overview Panel

This is a plugin for the official webclient. 

Features:
* self-updating call history
* show the call chain
* show all active calls
* 3cx phonebook integration (caller name resolving, add new contact, edit existing contact)
* call integration (make call via button from history)

Supports internationalization. Included languages:
* English 🇺🇸🇬🇧
* German / Deutsch 🇩🇪

Tested on: v18.0.2.307

![](./webclient-realtime-call-overview-panel/screenshot-webclient.png)

