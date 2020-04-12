/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';// tells the app to run in strict mode, which means no undeclared variables.

	Handlebars.registerHelper('eq', function (a, b, options) {// This is creating a new Handlebars helper called eq.
		return a === b ? options.fn(this) : options.inverse(this);// Essentially all this doing is if a === b then run the next thing
	});// Options.inverse is setting up for the else statement if you have one.

	var ENTER_KEY = 13;//This is the number in javascript for enter key
	var ESCAPE_KEY = 27;// for escape key

	var util = {
		uuid: function () {//This function creates a unique uuid that will be set as the id for our list items.
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {//
				random = Math.random() * 16 | 0;// Generates a number multiplies it by 16, then or's it against 0. so all 0 | 0 would equate to 0.
				if (i === 8 || i === 12 || i === 16 || i === 20) {// Every 4 starting from 8?
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {//This checks to see if the count is 1, if so its not plural. Otherwise it's plural.
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {//This is used to not only store data in local storage, but also get data in local storage.
			if (arguments.length > 1) {// if you have more than 1 argument.
				return localStorage.setItem(namespace, JSON.stringify(data));// Then we store data to the namespace provided.
			} else {//Else we pull data from the namespace provided or create an empty array at that namespace.
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = { // Our main app object.
		init: function () { // Our initialization function.
			this.todos = util.store('todos-jquery');// This checks to see if there is already data in that namespace, otherwise create an array at that namespace.
			this.todoTemplate = Handlebars.compile($('#todo-template').html());// Here we are compiling our todo-template id and returning the html.
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.bindEvents(); // Sets up all the event listeners

			new Router({ // This is essentially binding this piece of code to the url specifided.
				'/:filter': function (filter) { // The semicolon means that essentially you are passing in a variable.
					this.filter = filter; // Set the filter on this object.
					this.render(); 
				}.bind(this)
			}).init('/all'); // When you first initialize make sure the ending is /all
		},
		bindEvents: function () {//Essentially adds an event handler to multiple different elements based on id. 
			$('#new-todo').on('keyup', this.create.bind(this));// .on(event, function). Runs the create on keyup of the new-todo element.
			$('#toggle-all').on('change', this.toggleAll.bind(this)); // When any change is made run toggleAll
			$('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this)); // When the child #clear-completed is clicked, run destroyCompleted
			$('#todo-list')// We setup method chaining here/
				.on('change', '.toggle', this.toggle.bind(this))// When something is changed in the toggle class run toggle.
				.on('dblclick', 'label', this.edit.bind(this)) // When something is double clicked in label, enter edit mode.
				.on('keyup', '.edit', this.editKeyup.bind(this))// Whenever a key up happens on the edit class run editKeyup
				.on('focusout', '.edit', this.update.bind(this))// When you lose focus on .edit run the update command.
				.on('click', '.destroy', this.destroy.bind(this));// When you click on the .destroy class run destroy.
		},
		render: function () {// This is what we run to show our todos.
			var todos = this.getFilteredTodos(); // Returns an array of todos based on the filter.
			$('#todo-list').html(this.todoTemplate(todos)); // Grabs the todo-list id and edits the html to be this.todoTemplate which is our compiled handlebars which populates with our todos.
			$('#main').toggle(todos.length > 0);// Grabs the id of main, toggle just changes being shown and this occurs if todos.length is greater than 0.
			$('#toggle-all').prop('checked', this.getActiveTodos().length === 0);// Sets the checked property to true or false depending on if the getActiveTodos length is 0.
			this.renderFooter();// Runs the renderFooter() method which is pretty self-explanatory.
			$('#new-todo').focus();// Essentially forces you to focus on the new-todo id'd element whenever this method is run
			util.store('todos-jquery', this.todos);// Stores this.todos to the todos-jquery namespace.
		},
		renderFooter: function () {
			var todoCount = this.todos.length; // Get the length of our todos array.
			var activeTodoCount = this.getActiveTodos().length; // Gets a number of our todos that are active
			var template = this.footerTemplate({ // Passes this into our compiled handlebars template of the footer template.
				activeTodoCount: activeTodoCount, // Populats the html with the number from earlier.
				activeTodoWord: util.pluralize(activeTodoCount, 'item'), // Checks if it is plural based on number of activeTodoCount. item vs items
				completedTodos: todoCount - activeTodoCount, // If it isn't active it is completed.
				filter: this.filter // Whatever we set the filter to earlier, either 'all' 'active' or 'completed'
			});

			$('#footer').toggle(todoCount > 0).html(template);// Grab the footer id and depending on todoCount we show or hide. Update the html with the handlebars template.
		},
		toggleAll: function (e) { // Pass in the event.
			var isChecked = $(e.target).prop('checked');// Check if the event target has the checked property.

			this.todos.forEach(function (todo) { // Run this for loop for each todo
				todo.completed = isChecked; // Sets if it is completed or not based on if it is checked.
			});

			this.render();
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) { // run a filter on todos and only return the ones that are not completed aka they are active.
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) { // Get a list of todos that are completed by checking the value of todo.completed and return trues.
				return todo.completed;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') { // This changes based on the filter, which is set in the url. If it is active
				return this.getActiveTodos(); // then return all active todos
			}

			if (this.filter === 'completed') { // If the filter is completed, return all completed todos
				return this.getCompletedTodos();
			}

			return this.todos; // Else if filter is anything else, return all todos.
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos(); // Get all 'active' todos. Which just means ones that aren't completed and we update todos to this value
			this.filter = 'all'; // Set the filter to all.
			this.render(); // Run render.
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		indexFromEl: function (el) { // 
			var id = $(el).closest('li').data('id'); // create jQuery object on the passed in el, get the closes 'li' element, and grab the 'id' value from that element
			var todos = this.todos; // set todos to be this.todos 
			var i = todos.length; // i is the length of our todos

			while (i--) { // While i is greater that 0: first thing that will happen is i - 1.
				if (todos[i].id === id) { //Checks to see if id at the todos[i] is equal to the earlier declared id.
					return i; // If so return the number that passed the check
				}
			}
		},
		create: function (e) {//When the new todo box has an event happen, it is sent here where it is checking for the enter button to be pressed
			var $input = $(e.target);// When it is pressed, we push a new object into the todo object and then render that objects value.
			var val = $input.val().trim(); // Grab the value of $input and we trim any whitespaces.

			if (e.which !== ENTER_KEY || !val) { // if the key that was pressed does not equal enter key or val doesn't have any value
				return; // Just return
			}

			this.todos.push({ // Else we push this new object to todos.
				id: util.uuid(), // Populates with a unique id.
				title: val, // Set title to be the user input.
				completed: false // Defaults to not completed.
			});

			$input.val(''); // Set the input on the element to be empty

			this.render();
		},
		toggle: function (e) { // Pass in the event
			var i = this.indexFromEl(e.target); // Get the position in todos for this event.target
			this.todos[i].completed = !this.todos[i].completed; // If it is completed set it to the inverse and vice versa.
			this.render();
		},
		edit: function (e) { // Passes in an event.
			var $input = $(e.target).closest('li').addClass('editing').find('.edit'); // Grab the closest list item to the event target and set the class = to 'editing' which will update because of css
			// .find() is a jquery method which gets the descendants of each element in the current set of matched elements filtered by a selector, jQuery object, or element.
			$input.val($input.val()).focus();// Focus on $input's value field.
		},
		editKeyup: function (e) { // passes in an event.
			if (e.which === ENTER_KEY) { // if the enter_key was pressed lose focues.
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) { // If the escape key was pressed
				$(e.target).data('abort', true).blur(); // Set some data about the element selected called abort to true. This essentially says hey dont save
			} // Then lose focus.
		},
		update: function (e) { // Passes in an event
			var el = e.target; // the element is the events target
			var $el = $(el); // $el is the jQuery object of that element.
			var val = $el.val().trim(); // grab the value of that element and trim whitespace.

			if (!val) { // If there is no value in val. As in you didn't input anything
				this.destroy(e); // run destroy on that event.
				return;
			}

			if ($el.data('abort')) { // If that element has abort saved to it
				$el.data('abort', false); // Set abort to false.
			} else {
				this.todos[this.indexFromEl(el)].title = val; // Else set the title property to the val input.
			}

			this.render();
		},
		destroy: function (e) { // Takes in an event
			this.todos.splice(this.indexFromEl(e.target), 1); // Deletes one object from todos based on e.target
			this.render();
		}
	};

	App.init(); // we initialize the app.
});
