jQuery( function($){
  var myTests = {
    todos : [true,false,false,false,true],
    checkComplete: function(){
      return this.todos.filter(function (todo) {
        return !todo;
      })
    },
    getCompleteNum: function(){
      this.todos = this.checkComplete();
      console.log(this.todos);
    }
  }
  myTests.getCompleteNum();
})