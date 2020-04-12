var todosObject = {
    todoList : [],

    addTodo: function(addValue){
        this.todoList.push({
            todoText: addValue,
            completedValue: false
        });
    },

    changeTodo: function(position, todoText){
        try{
            this.todoList[position].todoText = todoText;
        }
        catch(err){
            var throwError = document.createElement('h2');
            throwError.innerHTML="That position does not exist or input invalid!";
            document.body.appendChild(throwError);
        }
        
    },

    deleteTodo: function(position){
        this.todoList.splice(position,1);
    },

    completeTodo: function(position){
        this.todoList[position].completedValue = !this.todoList[position].completedValue;
    },
    toggleAll: function(){
        var todosLength = this.todoList.length;//4
        var truthCounter = 0;
        this.todoList.forEach(function(todo){
            //Counter: If the todo is already true we add that to our counter.
            if (todo.completedValue === true){
                truthCounter ++
            }});
            //Case 1: If everything is true, make everything false.
        this.todoList.forEach(function(todo){
            if (truthCounter === todosLength){
                todo.completedValue = false;
            } else {
                todo.completedValue = true;
            }
        })
            
    }
}

var handlers = {
    toggleAll: function() {
        todosObject.toggleAll();
        view.displayTodos();
    },
    addTodo: function() {
        var userInput = document.getElementById('addTodoInput').value;
        todosObject.addTodo(userInput);
        document.getElementById('addTodoInput').value = '';
        view.displayTodos();
    },
    changeTodo: function() {
        var userTextInput = document.getElementById('changeTodoTextInput').value;
        var userPositionInput = document.getElementById('changeTodoPositionInput').valueAsNumber;
        todosObject.changeTodo(userPositionInput, userTextInput);
        view.displayTodos();
    },
    deleteTodo: function(position) {
        todosObject.deleteTodo(position);
        view.displayTodos();
    },
    toggleTodo: function() {
        var toggleTodoPosition = document.getElementById('toggleTodoPosition').valueAsNumber;
        todosObject.completeTodo(toggleTodoPosition);
        view.displayTodos();
    }
}

var view = {
    displayTodos: function(){
        var todosUl = document.querySelector('ul');
        todosUl.innerHTML = '';
        todosObject.todoList.forEach(function(todo){
            var todoLi = document.createElement('li');
            if (todo.completedValue === true){
                todoLi.innerHTML = `(x) ${todo.todoText}`;
            } else {
                todoLi.innerHTML = `( ) ${todo.todoText}`
            }
            todoLi.id = todo;
            todoLi.append(this.createDeleteButton());
            todosUl.appendChild(todoLi);
        }, this)
    },
    createDeleteButton: function(){
        var delButton = document.createElement('button');
        delButton.className= 'deleteButtons';
        delButton.innerHTML = "Delete";
        return(delButton);
    },
    setUpEventListeners: function(){
        var todosUl = document.querySelector('ul');
        todosUl.addEventListener('click', function(event) {
        var elementClicked = event.target;
        if (event.target.className === 'deleteButtons'){
            handlers.deleteTodo(Number(elementClicked.parentNode.id))
            }
        });
    }
};

view.setUpEventListeners();