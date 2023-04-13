var User = (function(){
    var User = function(socket){
      if(!(this instanceof User)){
        return (new User(socket));
      }
      /**
       * constructor here
       */
  
  
      this.socket = socket;
      this._rooms = [];
      this._id = socket.id;
      this.generateName();
  
      this._events();
    };
    var r = User.prototype;
    /**
     * methods && properties here
     * r.property = null;
     * r.getProperty = function() {...}
     */
  
    r._id = null;
    r._name = null;
    r._rooms = null;
    r._inQueue = false;
    r._deck = null; // Keep the existing _deck property
    r._customDeck = null; // Add the _customDeck property
    r.socket = null;
    r.disconnected = false;
  
    r.getID = function(){
      return this._id;
    }
  
    r.send = function(event, data, room){
      room = room || null;
      data = data || null;
      if(!room){
        this.socket.emit(event, data);
      }
      else {
        this.socket.to(room).emit(event, data);
      }
    }
  
    r.generateName = function(){
      var name = "Guest" + (((Math.random() * 8999) + 1000) | 0);
      this._name = name;
      return name;
    }
  
    r.setName = function(name) {
      name = name.slice(0, 20);
      console.log("user name changed from %s to %s", this._name, name);
      this._name = name;
    }
  
    r.getName = function() {
      return this._name;
    }
  
    r.getRoom = function() {
      return this._rooms[0];
    }
  
    r.setDeck = function(deck) {
        if (this._customDeck && deck === "custom") {
          this._deck = this._customDeck;
        } else {
          this._deck = deck;
        }
    };
  
    r.getDeck = function() {
      return this._deck;
    }
  
    r.setCustomDeck = function(customDeck) {
        this._customDeck = customDeck;
      };
      
    r.getCustomDeck = function() {
        return this._customDeck;
    };


    r.addRoom = function(room) {
      this._rooms.push(room);
    }
  
    r.cleanUp = function() {
      for(var i=0; i<this._rooms.length; i++) {
        var room = this._rooms[i];
        if(room[i] === null) {
          this._rooms.splice(i, 1);
  
          return this.cleanUp();
        }
      }
    }
  
    r.disconnect = function() {
      var self = this;
      this.disconnected = true;
  
      matchmaking.removeFromQueue(this);
  
      this._rooms.forEach(function(room) {
        room.leave(self);
        if(!room.hasUser()) {
          //console.log("Remove room: ", room.getID());
          room = null;
        }
      })
  
      this.cleanUp();
    }
  
    r._events = function() {
      var socket = this.socket;
      var self = this;
  
      socket.on("request:name", function(data){
        if(data && data.name){
          self.setName(data.name);
        }
        socket.emit("response:name", {name: self.getName()});
      })
  
      socket.on("request:matchmaking", function() {
        if(self._inQueue) return;
        matchmaking.findOpponent(self);
      });
  
      socket.on("request:gameLoaded", function(data){
        //console.log(data);
        connections.roomCollection[data._roomID].setReady(self);
      })
  
      socket.on("set:deck", function(data) {
        //console.log(data);
        if(data && data.deck){
          self.setDeck(data.deck);
        }
      })
  
    }
  
    return User;
  })();
  
  module.exports = User;