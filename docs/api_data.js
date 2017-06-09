define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./docs/main.js",
    "group": "D__Research_connectedacademy_gossipmill_docs_main_js",
    "groupTitle": "D__Research_connectedacademy_gossipmill_docs_main_js",
    "name": ""
  },
  {
    "type": "post",
    "url": "/messages/create",
    "title": "Create",
    "description": "<p>Creates a message on a given service</p>",
    "name": "create",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "auth",
        "title": "Authenticated using Pre-Shared-Key",
        "description": ""
      }
    ],
    "filename": "./api/controllers/MessageController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "http://localhost:4000/messages/create"
      }
    ]
  },
  {
    "type": "post",
    "url": "/messages/list",
    "title": "List",
    "description": "<p>List message threads matching criteria</p>",
    "name": "list",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "auth",
        "title": "Authenticated using Pre-Shared-Key",
        "description": ""
      }
    ],
    "filename": "./api/controllers/MessageController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "http://localhost:4000/messages/list"
      }
    ]
  },
  {
    "type": "post",
    "url": "/messages/subscribe",
    "title": "Subscribe",
    "description": "<p>Subscribe to message updates matching a criteria</p>",
    "name": "subscribe",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "auth",
        "title": "Authenticated using Pre-Shared-Key",
        "description": ""
      },
      {
        "name": "websocket",
        "title": "Socket.io websocket only",
        "description": ""
      }
    ],
    "filename": "./api/controllers/MessageController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "http://localhost:4000/messages/subscribe"
      }
    ]
  },
  {
    "type": "post",
    "url": "/messages/summary",
    "title": "Summary",
    "description": "<p>Single message representing this criteria, with stats</p>",
    "name": "summary",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "auth",
        "title": "Authenticated using Pre-Shared-Key",
        "description": ""
      }
    ],
    "filename": "./api/controllers/MessageController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "http://localhost:4000/messages/summary"
      }
    ]
  },
  {
    "type": "post",
    "url": "/messages/totals",
    "title": "Totals",
    "description": "<p>Return number of messages for criteria, grouped by supplied field.</p>",
    "name": "totals",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "auth",
        "title": "Authenticated using Pre-Shared-Key",
        "description": ""
      }
    ],
    "filename": "./api/controllers/MessageController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "http://localhost:4000/messages/totals"
      }
    ]
  },
  {
    "type": "post",
    "url": "/messages/unsubscribe",
    "title": "Unsubscribe",
    "description": "<p>Unsubscribe to message updates</p>",
    "name": "unsubscribe",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "auth",
        "title": "Authenticated using Pre-Shared-Key",
        "description": ""
      },
      {
        "name": "websocket",
        "title": "Socket.io websocket only",
        "description": ""
      }
    ],
    "filename": "./api/controllers/MessageController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "http://localhost:4000/messages/unsubscribe"
      }
    ]
  },
  {
    "type": "post",
    "url": "/messages/visualisation",
    "title": "Visualisation",
    "description": "<p>List of totals for the given criteria grouped by supplied field. To be used for visualising contributions across a linear criteria range.</p>",
    "name": "visualisaion",
    "group": "Messages",
    "version": "1.0.0",
    "permission": [
      {
        "name": "auth",
        "title": "Authenticated using Pre-Shared-Key",
        "description": ""
      }
    ],
    "filename": "./api/controllers/MessageController.js",
    "groupTitle": "Messages",
    "sampleRequest": [
      {
        "url": "http://localhost:4000/messages/visualisation"
      }
    ]
  },
  {
    "type": "get",
    "url": "/services",
    "title": "List Services",
    "description": "<p>List all messaging services that have been used to source messages e.g. Twitter</p>",
    "name": "services",
    "group": "Utility",
    "version": "1.0.0",
    "permission": [
      {
        "name": "auth",
        "title": "Authenticated using Pre-Shared-Key",
        "description": ""
      }
    ],
    "filename": "./api/controllers/MessageController.js",
    "groupTitle": "Utility",
    "sampleRequest": [
      {
        "url": "http://localhost:4000/services"
      }
    ]
  }
] });
