/*--------------------------------------------------------------
 model
 ----------------------------------------------------------------*/
function EventDispather() {
    this._events = [];
}

EventDispather.prototype.on = function(event,callback) {
    if(!this._events[event]){
        this._events[event] = [];
    }
    var keys = Object.keys(this._events[event]).length;
    var key = (keys === undefined)? 0: keys;
    this._events[event][key] = callback;
//    console.log("「" + event + "」イベントを登録しました。");
};

EventDispather.prototype.trigger = function(event,param){
    if(this._events[event]){
        for(var i = 0; i < this._events[event].length; i++){
            this._events[event][i].apply(null,param);
        }
    }else{
//        console.log("「" + event + "」イベントがありません");
    }
}

EventDispather.prototype.remove = function(event){
    for(var i = 0; i < this._events[event].length; i++){
        if(event){
            delete this._events[event][i];
        }
    }
}

/*--------------------------------------------------------------
 Todosクラス
 ----------------------------------------------------------------*/

function Todos(){
    EventDispather.apply(this,[]);
    this.todoList = [];
    this.APP_NAME = "TODO-APP";
    this._getData(this.APP_NAME);
    this.sortFlg = true;
}

Todos.prototype = Object.create(EventDispather.prototype);

Todos.prototype.init = function() {
    this._getData(this.APP_NAME);
    this.trigger("init",this.todoList);
    this.sortDate();
    this.trigger("render");
};

Todos.prototype.add = function(todo){
    var self = this;
    todo.on("hide",function(){
        self.hide();
    });
    todo.trigger("hide");
    this._addEvent(todo);
    this.todoList.push(todo);
    this.storage(this.todoList);
    this.sortDate();
    this.trigger("render");
}

Todos.prototype._getData = function(target){
    if(localStorage.getItem(target)){
        var jsonData = JSON.parse(localStorage.getItem(target));
        for(var key in jsonData){
            var todo = new Todo(jsonData[key].param);
            this._addEvent(todo);
            this.todoList[key] = todo;
        }
    }
}

Todos.prototype._addEvent = function(todo){
    var self = this;
    todo.on("set",function(){
        self.hide();
        self.sortDate();
        self.trigger("render");
    });
}

Todos.prototype.storage = function(){
    localStorage.setItem(this.APP_NAME,JSON.stringify(this.todoList));
}

Todos.prototype.get = function (index) {
    return this.todoList[index];
}

Todos.prototype.alldelete = function(){
    for(var key in this.todoList){
        var value = this.todoList[key].param;
        if(value.complete === true ){
            value.delete = true;
        }
    }
    this.sortDate();
    this.storage();
    this.trigger("render");
}

Todos.prototype.sortToggle = function(){
    if(this.sortFlg){
        this.sortFlg = false;
    }else{
        this.sortFlg = true;
    }
    this.sortDate();
    this.trigger("render");
}

Todos.prototype.sortDate = function(){
    var self = this;
    if(this.sortFlg){
        this.todoList.sort(this._sortDateASC);
    }else{
        this.todoList.sort(this._sortDateDESC);
    }
    this.on("sort",function(){
        if(self.sortFlg){
            sortBtn.innerHTML = "▼";
        }else{
            sortBtn.innerHTML = "▲";
        }
    });
    this.trigger("sort");
}

Todos.prototype._sortDateDESC = function(a,b){
    var A = a["param"].updateDate;
    var B = b["param"].updateDate;
    return Date.parse(A) - Date.parse(B);
}

Todos.prototype._sortDateASC = function(a,b){
    var A = a["param"].updateDate;
    var B = b["param"].updateDate;
    return Date.parse(B) - Date.parse(A);
}

Todos.prototype.show = function(){
    var self = this;
    this.on("show",function(){
        var memo = document.getElementById("memo");
        memo.style.top = "0%";
        if(self.index) {
            if(self.todoList[self.index]["param"].complete){
                completeBtn.style.webkitTransform = "translate(100px,-300px)";
                cancelBtn.style.webkitTransform = "translate(-100px,-300px)";
            }else{
                completeBtn.style.webkitTransform = "translate(100px,-300px)";
                editBtn.style.webkitTransform = "translate(-100px,-300px)";
            }
        }else{
            registBtn.style.webkitTransform = "translateY(-300px)";
        }
    });
    this.hide();
    this.trigger("show");
}

Todos.prototype.hide = function(){
    this.on("hide",function(){
        var memo = document.getElementById("memo");
        memo.style.top = "-200%";
        var elems = document.querySelectorAll("#btn-area .btn");
        for(var i = 0;i<elems.length;i++){
            elems[i].style.webkitTransform = "translate(0,0)";
        }
    });
    this.trigger("hide");
}

/*--------------------------------------------------------------
 Todoクラス
 ----------------------------------------------------------------*/

function Todo(param){
    EventDispather.apply(this,[]);
    this.param = param;
}

Todo.prototype = Object.create(EventDispather.prototype);

Todo.prototype.setComplete = function(){
    console.log("completeをtrueにする。");
    this.param.complete = true;
    this.trigger("set");
}

Todo.prototype.removeComplete = function(){
    console.log("completeをfalseにする。");
    this.param.complete = false;
    this.param.updateDate = getdate();
    this.trigger("set");
}

Todo.prototype.todoEdit = function(data){
    console.log("編集されたデータを保存する。");
    this.param.title = data.title;
    this.param.text = data.memo;
    this.param.complete = false;
    this.param.updateDate = getdate();
    this.trigger("set");
}

var todos = new Todos();
var memoTitle;
var memoArea;
var registBtn;
var createTodoBtn;
var cancelBtn;
var todoListsArea;
var finishTodoListsArea;
var editBtn;
var allDeleteBtn;
var sortBtn;
var closeBtn;


todos.on("init",function(){
    todoListsArea = document.getElementById("todo-lists-area");
    finishTodoListsArea = document.getElementById("complete-todo-lists-area");
    cancelBtn = document.getElementById("cancel-btn");
    createTodoBtn = document.getElementById("create-todo-btn");
    registBtn = document.getElementById("regist-btn");
    completeBtn = document.getElementById("complete-btn");
    editBtn = document.getElementById("edit-btn");
    allDeleteBtn = document.getElementById("all-delete-btn");
    memoTitle = document.getElementById("memo-title");
    memoArea = document.getElementById("memo-area");
    sortBtn = document.getElementById("sort-btn");
    closeBtn = document.getElementById("close-btn");

    //createNewTodoHandler
    createTodoBtn.addEventListener("click",function(){
        memoTitle.value = "";
        memoArea.value = "";
        todos.index = null;
        todos.show();
    },false);

    //registHandler
    registBtn.addEventListener("click",function(){
        if(memoTitle.value){
            var param = {
                title: memoTitle.value,
                text: memoArea.value,
                updateDate: getdate(),
                createdDate: getdate(),
                complete: false,
                delete: false
            }
            var td = new Todo(param);
            todos.add(td);
        }else{
            alert("タイトルを入力して下さい")
        }
    },false);

    //completeHandler
    completeBtn.addEventListener("click",function(){
        var todo = todos.get(todos.index);
        todo.setComplete();
    },false);

    //cancelHandler
    cancelBtn.addEventListener("click",function(){
        var todo = todos.get(todos.index);
        todo.removeComplete();
    },false);

    //editHandler
    editBtn.addEventListener("click",function(){
        var todo = todos.get(todos.index);
        var data = [];
        data["title"] = memoTitle.value;
        data["memo"] = memoArea.value;
        todo.todoEdit(data);
    },false);

    //allDeleteHandler
    allDeleteBtn.addEventListener("click",function(){
        todos.alldelete();
    },false);

    //sortHandler
    sortBtn.addEventListener("click",function(){
        todos.sortToggle();
    },false);

    closeBtn.addEventListener("click",function(){
        todos.hide();
    },false);
});

todos.on("render",function(){
    todoListsArea.innerHTML = "";
    finishTodoListsArea.innerHTML = "";
    memoTitle.value = "";
    memoArea.value = "";
    allDeleteBtn.style.display = "none";
    for(var key in todos.todoList){
        var todo = todos.todoList[key];
        li = document.createElement("li");
        li.className = "list";
        li.setAttribute("data-index",key);
        li.addEventListener("click",function(){
            todos.index = this.getAttribute("data-index");
            memoTitle.value = todos.todoList[todos.index]["param"].title;
            memoArea.value = todos.todoList[todos.index]["param"].text;
            todos.show();
        },false);
        if(todo["param"].complete === true){
            if(todo["param"].delete === false){
                finishTodoListsArea.appendChild(li);
                li.innerHTML = "<p class='list_txt'><span>" + todo["param"].title + "</span></p>";
                allDeleteBtn.style.display = "block";
            }
        }else{
            li.innerHTML = "<p class='list_txt'>" + "<time>" + dispdate(todo["param"].updateDate) + "</time><span>" + todo["param"].title + "</span></p>";
            todoListsArea.appendChild(li);
        }
    }
});

/**
* yyyy/mm/dd hh:mm:ss で時間を返す
*/
function getdate(){
    var dateObj = new Date();
    var Year = dateObj.getYear()+1900;
    var Month = dateObj.getMonth() + 1;
    var Day = dateObj.getDate();
    var Hours = dateObj.getHours();
    var Minutes = dateObj.getMinutes();
    var Seconds = dateObj.getSeconds();
    if(Month < 10){Month = "0"+Month;}
    if(Day < 10){Day = "0"+Day;}
    if(Hours < 10){Hours = "0"+Hours;}
    if(Minutes < 10){Minutes = "0"+Minutes;}
    if(Seconds < 10){Seconds = "0"+Seconds;}
    return Year + "/" + Month + "/" + Day + " " + Hours + ":" + Minutes + ":" + Seconds;
}
/**
 * 日付を表示用に変換
 */
function dispdate(date){
    var month = date.slice(5,7);
    var day = date.slice(8,10);
    var hour = date.slice(11,13);
    var minute = date.slice(14,16);
    var result;
    if(diffMonth(getdate(),date) == 0 || diffYear(getdate(),date) == 0){
        if(diffDay(getdate(),date) == 0) {
            result = "今日 " + hour + ":" + minute;
        }else if(diffDay(getdate(),date) == 1){
            result = "昨日 " + hour + ":" + minute;
        }else if(1 < diffDay(getdate(),date) && diffDay(getdate(),date) < 7){
            result = diffDay(getdate(),date) +"日前 " + hour + ":" + minute;
        }else{
            result = month + "/" + day + " " + hour + ":" + minute;
        }
    }else{
        result = date;
    }
    return result;
}

function diffYear(today,date){
    return today.slice(0,4) - date.slice(0,4);
}

function diffMonth(today,date){
    return today.slice(5,7) - date.slice(5,7);
}

function diffDay(today,date){
    return today.slice(8,10) - date.slice(8,10);
}

window.addEventListener("load",function(){
    todos.init();
},false);