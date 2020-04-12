/*global jQuery, Handlebars, Router */
'use strict';

Handlebars.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

var ENTER_KEY = 13;
var ESCAPE_KEY = 27;

var util = {
  uuid: function () {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
  },
  pluralize: function (count, word) {
    return count === 1 ? word : word + 's';
  },
  store: function (namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  }
};

var App = {
  testFunc: function(e){
    var x = e.target; 
    console.log('hello');
  },
  init: function () {
    this.todos = util.store('todos-jquery');
    this.todoTemplate = Handlebars.compile(document.getElementById('todo-template').innerHTML)
    this.footerTemplate = Handlebars.compile(document.getElementById('footer-template').innerHTML)
    this.bindEvents();
    
    new Router({
      '/:filter': function(filter){
        this.filter = filter;
        this.render();
      }.bind(this)
    }).init('/all');
  },
  bindEvents: function () {
    document.getElementById('new-todo').addEventListener("keyup", this.create.bind(this))
    document.getElementById('toggle-all').addEventListener("change", this.toggleAll.bind(this))
    //document.getElementById('clear-completed').addEventListener("click", this.destroyCompleted(this))
    document.getElementById('todo-list').addEventListener("dblclick", function(e){if (e.target.localName === 'label'){App.edit(e)}})
    document.getElementById('todo-list').addEventListener("keyup", function(e){if (e.target.className === 'edit'){App.editKeyup(e)}})
    document.getElementById('todo-list').addEventListener("click", function(e){if (e.target.className === 'destroy'){App.destroy(e)}})
    document.getElementById('todo-list').addEventListener("focusout", function(e){if (e.target.className === 'edit'){App.update(e)}})
    document.getElementById('todo-list').addEventListener("change", function(e){if (e.target.className === 'toggle'){App.toggle(e)}})
    document.getElementById('footer').addEventListener("click", function(e){if (e.target.id === 'clear-completed'){App.destroyCompleted()}})//if (e.target.id === 'clear-completed'){App.destroyCompleted}})
  },
  render: function () {
    var todos = this.getFilteredTodos();
    //document.getElementById('todo-list').innerHTML = this.todoTemplate(todos);
    var test = this.todoTemplate(todos);
    console.log(test);
    document.getElementById('todo-list').innerHTML = test;
    this.getActiveTodos().length === 0 ? document.getElementById('toggle-all').setAttribute('checked', 'true') : document.getElementById('toggle-all').removeAttribute('checked');
    document.getElementById('main').style.display = todos.length > 0 ? 'inline': 'none';
    document.getElementById('new-todo').focus();
    this.renderFooter()
    util.store("todos-jquery", this.todos);
  },
  renderFooter: function () {
    var todoCount = this.getActiveTodos().length;
    var template = this.footerTemplate({
      activeTodoCount: todoCount,
      activeTodoWord: util.pluralize(todoCount, "item"),
      filter: this.filter,
      completedTodos: this.todos.length - todoCount
    })
    document.getElementById('footer').innerHTML = template;
    document.getElementById('footer').style.display = 'block';
    
  },
  toggleAll: function (e) {
    //var todos = this.todos;
    //var completedTodos = this.getCompletedTodos();
    //if (completedTodos.length == todos.length){
     // todos.forEach(function(todo){todo.completed = false})
    //} else { todos.forEach(function(todo){todo.completed = true})}
    //this.render();
    var isChecked = e.target.checked;

		this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});

		this.render();
  },
  getActiveTodos: function () {
    // an active to do is one that is not completed
    return this.todos.filter(function(todo){
      return !todo.completed;
    })
  },
  getCompletedTodos: function () {
    return this.todos.filter(function (todo) {
      return todo.completed;
    });
  },
  getFilteredTodos: function () {
    var filter = this.filter;
    
    if (filter === 'active'){
      return this.getActiveTodos();
    } 
    if (filter === 'completed'){
      return this.getCompletedTodos();
    } 
    return this.todos;
    
  },
  destroyCompleted: function () {
    this.todos = this.getActiveTodos();
    this.filter = 'all';
    this.render()
  },
  // accepts an element from inside the `.item` div and
  // returns the corresponding index in the `todos` array
  indexFromEl: function (el) {
    var el = el;
    var id = el.closest('li').id;
    var todos = this.todos;
    for (var i = 0; i < todos.length; i++){
      if (todos[i].id === id){
        return i;
      };
    }
  },
  create: function (e) {
    if (e.keyCode === ENTER_KEY){
    var input = e.target.value
    var newTodo = {id: util.uuid(),
                   title: input,
                   completed: false
      }
    e.target.value = '';
    this.todos.push(newTodo);
    } else if (e.keyCode === ESCAPE_KEY){
      e.target.value = '';
      e.target.blur();
    }
    this.render();
  },
  toggle: function (e) {
    var position = this.indexFromEl(e.target);
    var todos = this.todos;
    todos[position].completed = !todos[position].completed
    this.render();
  },
  edit: function (e) {
    var userInput = e.target.innerHTML;
    var editing = e.target.closest('li');
    editing.className = 'editing';
    var position = this.indexFromEl(e.target);
    var test = document.getElementsByClassName('edit')[position]
    test.focus();
    test.setSelectionRange(userInput.length, userInput.length + 1)
  },
  editKeyup: function (e) {
    if (e.keyCode === ENTER_KEY){
      this.target.blur();
    }
    if (e.keyCode === ESCAPE_KEY){
      e.target.dataset.abort = true;
      this.target.blur();
    }
  },
  update: function (e) {
    var val = e.target.value.trim();
    
    if (!val){
      this.destroy(e);
      return;
    } else if (e.target.dataset.abort === 'true'){
      e.target.closest('li').classList.remove('editing');
      e.target.dataset.abort = false;
      //e.target.blur()
    } else {
      var pos = this.indexFromEl(e.target)
      this.todos[pos].title = val;
    }
    this.render();
    
  },
  destroy: function (e) {
    this.todos.splice(this.indexFromEl(e.target), 1);
    this.render();
  }
};

App.init();
//Done schneidersec