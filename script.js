function Coordinate(X, Y) {
    this.x = X;
    this.y = Y;
}

function rand(max) {
    return (Math.floor(Math.random() * max));
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function Maze(Width, Height) {
    var mazeMap;
    var width = Width;
    var height = Height;
    var startCoord, endCoord;
    var dirs = ["n", "s", "e", "w"];
    var modDir = {
        n: {
            y: -1,
            x: 0,
            o: "s"
        },
        s: {
            y: 1,
            x: 0,
            o: "n"
        },
        e: {
            y: 0,
            x: 1,
            o: "w"
        },
        w: {
            y: 0,
            x: -1,
            o: "e"
        }
    };

    this.map = function () {
        return mazeMap;
    };
    this.startCoord = function () {
        return startCoord;
    };
    this.endCoord = function () {
        return endCoord;
    };

    function genMap() {
        mazeMap = new Array(height);
        for (y = 0; y < height; y++) {
            mazeMap[y] = new Array(width);
            for (x = 0; x < width; ++x) {
                mazeMap[y][x] = {
                    n: false,
                    s: false,
                    e: false,
                    w: false,
                    visited: false,
                    priorPos: null
                };
            }
        }
    }

    function defineMaze() {
        var isComp = false;
        var move = false;
        var cellsVisited = 1;
        var numLoops = 0;
        var maxLoops = 0;
        var pos = new Coordinate(0, 0); 
        var numCells = width * height;
        while (!isComp) {
            move = false;
            mazeMap[pos.x][pos.y].visited = true;

            if (numLoops >= maxLoops) {
                shuffle(dirs);
                maxLoops = Math.round(rand(height / 8));
                numLoops = 0;
            }
            numLoops++;
            for (index = 0; index < dirs.length; index++) {
                var direction = dirs[index];
                var nx = pos.x + modDir[direction].x;
                var ny = pos.y + modDir[direction].y;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    
                    if (!mazeMap[nx][ny].visited) {
                      
                        mazeMap[pos.x][pos.y][direction] = true;
                        mazeMap[nx][ny][modDir[direction].o] = true;

                    
                        mazeMap[nx][ny].priorPos = pos;
                       
                        pos = new Coordinate(nx, ny);

                        cellsVisited++;
                        
                        move = true;
                        break;
                    }
                }
            }

            if (!move) {
               
                pos = mazeMap[pos.x][pos.y].priorPos;
            }
            if (numCells == cellsVisited) {
                isComp = true;
            }
        }
    }

    function defineStartEnd() {
        switch (rand(4)) {
            case 0:
                startCoord = new Coordinate(0, 0);
                endCoord = new Coordinate(height - 1, width - 1);
                break;
            case 1:
                startCoord = new Coordinate(0, width - 1);
                endCoord = new Coordinate(height - 1, 0);
                break;
            case 2:
                startCoord = new Coordinate(height - 1, 0);
                endCoord = new Coordinate(0, width - 1);
                break;
            case 3:
                startCoord = new Coordinate(height - 1, width - 1);
                endCoord = new Coordinate(0, 0);
                break;
        }
    }

    genMap();
    defineStartEnd();
    defineMaze();
}
function DrawMaze(Maze, ctx, cellsize) {
    var map = Maze.map();
    var cellSize = cellsize;
    
    this.redrawMaze = function (cellsize) {
        cellSize = cellsize;
        drawMap();
        drawEnd(Maze.endCoord());
    };


    function drawCell(xCord, yCord, cell) {
        var x = xCord * cellSize;
        var y = yCord * cellSize;
        ctx.lineWidth = cellSize/ 50;

        if (cell.n === false) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            ctx.lineTo(x + cellSize, y);
            ctx.stroke();
        }
        if (cell.s === false) {
            ctx.beginPath();
            ctx.moveTo(x, y + cellSize);
            ctx.lineTo(x + cellSize, y + cellSize);
            ctx.stroke();
        }
        if (cell.e === false) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize, y + cellSize);
            ctx.stroke();
        }
        if (cell.w === false) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + cellSize);
            ctx.stroke();
        }
    }

    function drawMap() {
        for (x = 0; x < map.length; x++) {
            for (y = 0; y < map[x].length; y++) {
                drawCell(x, y, map[x][y]);
            }
        }
    }

    function drawEnd(coord) {
        var gridSize = 5;
        var offset = 7;

        var fraction = cellSize / gridSize - 2;
        var colorSwap = true;
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                ctx.beginPath();
                ctx.rect(
                    coord.x * cellSize + x * fraction + 4.5,
                    coord.y * cellSize + y * fraction + 4.5,
                    fraction,
                    fraction
                );
                if (colorSwap) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                } else {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                }
                ctx.fill();
                colorSwap = !colorSwap;
            }
        }
    }

    function clear() {
        var canvasSize = cellSize * map.length;
        ctx.clearRect(0, 0, canvasSize, canvasSize);
    }

    clear();
    drawMap();
    drawEnd(Maze.endCoord());
}
function Player(maze, c, _cellsize, onComplete, sprite = null) {
    var ctx = c.getContext("2d");
    var drawSprite;
    var moves = 0;
    drawSprite = drawSpriteCircle;
    if (sprite != null) {
        drawSprite = drawSpriteImg;
    }
    var player = this;
    var map = maze.map();
    var preCoord = new Coordinate(maze.startCoord().x, maze.startCoord().y);
    var cellSize = _cellsize;
    var halfCellSize = cellSize / 2;


    this.redrawPlayer = function (_cellsize) {
        cellSize = _cellsize;        
        drawSpriteImg(preCoord);
    }

    function drawSpriteCircle(coord) {
        ctx.beginPath();
        ctx.fillStyle = "yellow";
        ctx.arc(
            (coord.x + 1) * cellSize - halfCellSize,
            (coord.y + 1) * cellSize - halfCellSize,
            halfCellSize - 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
        if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
            onComplete(moves);
            player.unbindKeyDown();
        }
    }

    function drawSpriteImg(coord) {
        ctx.drawImage(
            sprite,
            72,
            29,
            320,
            435,
            coord.x * cellSize + 4,
            coord.y * cellSize + 4,
            cellSize - 8,
            cellSize - 8
        );
        if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
            onComplete(moves);
            player.unbindKeyDown();
        }
    }

    function removeSprite(coord) {
        ctx.clearRect(
            coord.x * cellSize + 1,
            coord.y * cellSize + 1,
            cellSize - 2,
            cellSize - 2
        );
    }

    function check(e) {
        var cell = map[preCoord.x][preCoord.y];
        var code = e.keyCode;
        moves++;
        switch (code) {
            case 65:
            case 37: 
                if (cell.w == true) {
                    removeSprite(preCoord);
                    preCoord = new Coordinate(preCoord.x - 1, preCoord.y);
                    drawSprite(preCoord);
                }

                break;
            case 87:
            case 38: 
                if (cell.n == true) {
                    removeSprite(preCoord);
                    preCoord = new Coordinate(preCoord.x, preCoord.y - 1);
                    drawSprite(preCoord);
                }
                break;
            case 68:
            case 39:
                if (cell.e == true) {
                    removeSprite(preCoord);
                    preCoord = new Coordinate(preCoord.x + 1, preCoord.y);
                    drawSprite(preCoord);
                }
                break;
            case 83:
            case 40:
                if (cell.s == true) {
                    removeSprite(preCoord);
                    preCoord = new Coordinate(preCoord.x, preCoord.y + 1);
                    drawSprite(preCoord);
                }
                break;
        }
    }

 this.bindKeyDown = function () {
        window.addEventListener("keydown", check, false);

        $("#mazeCanvas").swipe({
            swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                console.log(direction)
                switch (direction) {
                    case "up":
                        check({
                            keyCode: 38
                        });
                        break;
                    case "down":
                        check({
                            keyCode: 40
                        })
                        break;
                    case "left":
                        check({
                            keyCode: 37
                        });
                        break;
                    case "right":
                        check({
                            keyCode: 39
                        });
                        break;
                }
                
            },
            threshold: 0
        });
    };

    this.unbindKeyDown = function () {
        window.removeEventListener("keydown", check, false);
        $("#mazeCanvas").swipe("destroy");
    };

    drawSprite(maze.startCoord());

    this.bindKeyDown();
}
var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
var sprite;
var maze, draw, player;
var cellSize;
var difficulty;


window.onload = function () {
    if (window.innerHeight < window.innerWidth) {
        ctx.canvas.width = window.innerHeight - (75 + (window.innerHeight / 100));
        ctx.canvas.height = window.innerHeight - (75 + (window.innerHeight / 100));
    }
    else{
        ctx.canvas.width = window.innerWidth - (75 + (window.innerWidth / 100));
        ctx.canvas.height = window.innerWidth - (75 + (window.innerWidth / 100));
    }
    cellSize = mazeCanvas.width / difficulty;
    defineSprite();
};

window.onresize = function (event) {
    if (window.innerHeight < window.innerWidth) {
        ctx.canvas.width = window.innerHeight - (75 + (window.innerHeight / 100));
        ctx.canvas.height = window.innerHeight - (75 + (window.innerHeight / 100));
    }
    else{
        ctx.canvas.width = window.innerWidth - (75 + (window.innerWidth / 100));
        ctx.canvas.height = window.innerWidth - (75 + (window.innerWidth / 100));
    }

    cellSize = mazeCanvas.width / difficulty;
    if (player != null) {
        draw.redrawMaze(cellSize);
        player.redrawPlayer(cellSize);
    }

};

function defineSprite() {
    var spr = new Image();
    var url = "https://78.media.tumblr.com/99dbdc2634a3695d60120eebe865a785/tumblr_onsimhGBbN1rgyab2o1_1280.png";
    spr.src = url + "?" + new Date().getTime();
    spr.setAttribute("crossOrigin", " ");
    spr.onload = function changeBritness() {

        var virtCanvas = document.createElement('canvas');
        virtCanvas.width = 500;
        virtCanvas.height = 500;
        var context = virtCanvas.getContext('2d');

        context.drawImage(spr, 0, 0, 500, 500);
        var imgData = context.getImageData(0, 0, 500, 500);

        var factor = 1.20;
        for (let i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = imgData.data[i] * factor;
            imgData.data[i + 1] = imgData.data[i + 1] * factor;
            imgData.data[i + 2] = imgData.data[i + 2] * factor;
        }
        context.putImageData(imgData, 0, 0);

        sprite = new Image();
        sprite.src = virtCanvas.toDataURL();
    };
}



function makeMaze() {
    document.getElementById("mazeCanvas").classList.add("border");
    if (player != undefined) {
        player.unbindKeyDown();
    }
    difficulty = getDifficulty();
    cellSize = mazeCanvas.width / difficulty;
    maze = new Maze(difficulty, difficulty);
    draw = new DrawMaze(maze, ctx, cellSize);
    player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess);
    if (document.getElementById("mazeContainer").style.opacity < "100") {
        document.getElementById("mazeContainer").style.opacity = "100";
    }
}

function displayVictoryMess(moves) {
    document.getElementById("moves").innerHTML = "You Moved " + moves + " Steps.";
    toggleVisablity("Message-Container");
    document.getElementById("okBtn").focus();
}

function getDifficulty() {
    var e = document.getElementById("diffSelect");
    return e.options[e.selectedIndex].value;
}

function toggleVisablity(id) {
    if (document.getElementById(id).style.visibility == "visible") {
        document.getElementById(id).style.visibility = "hidden";
    } else {
        document.getElementById(id).style.visibility = "visible";
    }
}