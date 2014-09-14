/**
 * Created by morten on 13-09-14.
 */

//Mini Jquery DOM selector
function $(selector, container) {
    return (container || document).querySelector(selector);
}

window.onload = function() {
    (function() {
        var _ = self.Life = function(seed) {
            this.width = seed[0].length;
            this.height = seed.length;

            this.prevBoard = [];
            this.board = cloneArray(seed);
        }

        _.prototype = {
            next: function() {
                this.prevBoard = cloneArray(this.board);

                for(var y = 0; y < this.height; y++) {
                    for(var x = 0; x < this.width; x++) {
                        var neighbors = numberOfNeighbors(y,x, this.prevBoard);

                        var alive = this.board[y][x] ? 1 : 0;

                        if(alive) {
                            if(neighbors < 2 || neighbors > 3) {
                                this.board[y][x] = 0;
                            }
                        } else  {
                            if (neighbors == 3) {
                                this.board[y][x] = 1;
                            }
                        }
                    }
                }

            },
            toString: function() {
                return this.board.map(function(row) {
                    return row.join(" ");
                }).join("\n");
            }
        }

        function numberOfNeighbors(y, x, board) {

            var prevRow = board[y-1] || [];
            var nextRow = board[y+1] || [];

            return [
                prevRow[x-1], prevRow[x], prevRow[x+1],
                board[y][x-1], board[y][x+1],
                nextRow[x-1], nextRow[x], nextRow[x+1]
            ].reduce(function(prev, cur) {
                    return prev + +!!cur;
                }, 0);
        }

        function cloneArray(array) {
            return array.slice().map(function(row) {
                return row.slice();
            });
        }


    })();

    (function() {
        var _ = self.LifeView = function(table, size) {
            this.grid = table;
            this.size = size;
            this.started = false;
            this.autoplay = false;

            this.createGrid();
        }

        _.prototype = {
            createGrid: function() {
                var me = this;

                var fragment = document.createDocumentFragment();
                this.grid.innerHTML = "";
                this.checkboxes = [];

                for(var y = 0; y < this.size; y++) {
                    var row = document.createElement("tr");

                    this.checkboxes[y] = [];

                    for(var x = 0; x < this.size; x++) {
                        var cell = document.createElement("td");
                        var checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        this.checkboxes[y][x] = checkbox;
                        checkbox.coords = {y: y, x: x};

                        cell.appendChild(checkbox);
                        row.appendChild(cell);
                    }
                    fragment.appendChild(row);
                }

                this.grid.addEventListener("change", function(evt) {
                    if(evt.target.nodeName.toLowerCase() == "input") {
                        me.started = false;
                    }
                });

                this.grid.addEventListener("keyup", function(evt) {
                    var checkbox = evt.target;

                    if(checkbox.nodeName.toLowerCase() == "input") {
                        var coords = checkbox.coords;
                        var y = coords.y;
                        var x = coords.x;

                        switch (evt.keyCode) {
                            //Enter key
                            case 13:
                                me.next();
                                break;
                            //Esc
                            case 27:
                                me.reset();
                                break;
                            //Left arrow
                            case 37:
                                if(x > 0) {
                                    me.checkboxes[y][x-1].focus();
                                }
                                break;
                            //Up arrow
                            case 38:
                                if(y > 0) {
                                    me.checkboxes[y-1][x].focus();
                                }
                                break;
                            //Right arrow
                            case 39:
                                if(x < me.size - 1) {
                                    me.checkboxes[y][x+1].focus();
                                }
                                break;
                            //Down arrow
                            case 40:
                                if(y < me.size - 1) {
                                    me.checkboxes[y+1][x].focus();
                                }
                                break;
                        }
                    }
                })

                this.grid.appendChild(fragment);
            },
            get boardArray() {
              return this.checkboxes.map(function(row) {
                  return row.map(function(checkbox) {
                      return checkbox.checked? 1 : 0;
                  });
              });
            },
            play: function() {
                this.game = new Life(this.boardArray);
                this.started = true;
            },
            next: function() {
                var me = this;

                if(!this.started || this.game) {
                    this.play();
                }
                this.game.next();

                var board = this.game.board;
                for(var y = 0; y < this.size; y++) {
                    for(var x = 0; x < this.size; x++) {
                        this.checkboxes[y][x].checked = !!board[y][x];
                    }
                }

                if(this.autoplay) {
                    this.timer = setTimeout(function(){
                        me.next();
                    }, 500);
                }
            },
            reset: function() {
                var me = this;

                me.board = [];
                me.checkboxes.forEach(function(row) {
                    row.forEach(function(checkbox) {
                        checkbox.checked = false;
                    });
                });
                me.autoplay = false;

                $("#nextButton").disabled = false;
                $(".autoplaylabel").textContent = "AutoPlay";
                $(".autoplaylabel").className = "autoplaylabel";
                $("#autoplay").checked = false;

                me.started = false;

            }
        }
    })();


    var lifeView = new LifeView(document.getElementById("grid"), 20);
    (function() {

        var buttons = {
            next: $("#nextButton"),
            autoplay: $("#autoplay"),
            label: $(".autoplaylabel"),
            clear: $("#clearButton")
        }

        buttons.autoplay.addEventListener("change", function() {

            buttons.next.disabled = this.checked;
            lifeView.autoplay = this.checked;
            if(this.checked) {
                buttons.label.textContent = "Stop";
                buttons.label.className += " autoplaystoplabel";
            } else {
                buttons.label.textContent = "AutoPlay";;
                buttons.label.className = "autoplaylabel";
            }

            this.checked? lifeView.next() : clearTimeout(lifeView.timer);
        });

        buttons.next.addEventListener("click", function() {
            lifeView.next();
        });

        buttons.clear.addEventListener("click", function() {
            lifeView.reset();
        })

    })();

};


