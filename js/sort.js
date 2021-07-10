const REQUEST_ANIMATION_FRAME = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const CANVAS   = document.getElementById('canvas');
const CONTEXT = CANVAS.getContext('2d');

CANVAS.width  = window.innerWidth;
CANVAS.height = window.innerHeight;

// Options
const ARRAY_SIZE_DEFAULT = 5;
const ELEMENT_WIDTH_DEFAULT = CANVAS.width / ARRAY_SIZE_DEFAULT;
const FPS = 60;
const INTERVAL = 1000 / FPS;
const ELEMENT_MIN_VALUE = 50;

const ELEMENT_MAX_VALUE = 500;
const DEFAULT_SPEED = 1;
const VIEWPORT = [];
const SORT = new sort();
const BUBBLE_SORT = "bubble";
const MERGE_SORT = "merge";
const INSERTION_SORT = "insertionSort";
const HEAP_SORT = "heapSort";
const SELECTION_SORT = "selectionSort";

let now, delta;
let then = Date.now();
let done = false;
let viewPortRenderingEnabled = false;
let initialized = false;
let isRunning = false;
var animation;
var arraySize = ARRAY_SIZE_DEFAULT;
var elementWidth = ELEMENT_WIDTH_DEFAULT;
var speed = DEFAULT_SPEED;
var data = new dataSet();
var turbo = false;


function draw() {

  if (!initialized) {

    drawArrayElements();
    initialized = true;
    return;
  }

  if (!done && viewPortRenderingEnabled && isRunning) {

    animation = REQUEST_ANIMATION_FRAME(draw);

    now   = Date.now();
    delta = now - then;

    if (delta > INTERVAL) {

        then = now - (delta % INTERVAL);

        renderViewPort();
    }
  }
}

function element(entity, renderFn, updateFn, callbackFn, isActive) {

    this.entity = entity;
    this.renderFn = renderFn;
    this.updateFn = updateFn;
    this.callbackFn = callbackFn;
    this.isActive = isActive;
    
    this._render = function () {
    
        if (this.updateFn != null) {
        
            this._update();
        }
        
        this.renderFn(this.entity);
        
        if (callbackFn != null) {
        
            this.callbackFn(this.entity);
        }
    }

    this._update = function() {

        this.isActive = !this.updateFn(this.entity);

    }
}

function updateTransit(transit) {

    var dataPoint = transit.dataPoint;
    var oldIndex = transit.oldIndex;
    var newIndex = transit.newIndex;
    var oldXPos = transit.oldXPos;
    var newXPos = transit.newXPos;
    let remove = false;

    CONTEXT.clearRect(oldXPos, dataPoint.yPos, elementWidth, dataPoint.value);

    dataPoint.g = 255;
    if (oldXPos < newXPos) {

        var dx = newXPos - oldXPos;
        if (dx > speed) {

            dataPoint.updateXPos(oldXPos + speed);
            transit.oldXPos = oldXPos + speed;
        } else {

            dataPoint.updateXPos(newXPos);
            dataPoint.g = '00';
            remove = true;
        }
    } else {

        var dx = oldXPos - newXPos;
        if (dx > speed) {

            dataPoint.updateXPos(oldXPos - speed);
            transit.oldXPos = oldXPos - speed;
        } else {

            dataPoint.updateXPos(newXPos);
            dataPoint.g = '00';
            remove = true;
        }
    }

    return remove;
}

function renderTransit() {

    drawArrayElements();
}

function renderViewPort() {

    if (!viewPortRenderingEnabled) {

        return;
    }

    if (VIEWPORT.length == 0 && viewPortRenderingEnabled) {

        done = true;
        viewPortRenderingEnabled = false;
        return;
    }

    var churn;
    if (turbo) {

        churn = VIEWPORT.length/16;
    } else {

        churn = 1;
    }
    
    for (let i = 0;i < churn;i ++) {
    
        var element = VIEWPORT[i];
        element._render();
        if (!element.isActive) {
            
            VIEWPORT.splice(i, 1)[0];
            i--;
            churn--;
        }
    }

//    drawArrayElements();
}

function drawArrayElements() {

    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    arraySize = document.getElementById('arraySize').value;
    for (let i = 0;i < arraySize;i ++) {

        CONTEXT.fillStyle = 'rgb(' + data.dataPoints[i].r + ',' + data.dataPoints[i].g + ',' + data.dataPoints[i].b + ')';
        CONTEXT.fillRect(data.dataPoints[i].xPos, data.dataPoints[i].yPos, elementWidth, data.dataPoints[i].value);
    }
}

function sort() {

    this.bubbleSort = function() {

        for(let i = 0; i < arraySize; i++) {
            // Last i elements are already in place
            for(var j = 1; j < ( arraySize - i ); j++) {
                // Checking if the item at present iteration
                // is greater than the next iteration
                if(data.dataPoints[j - 1].value > data.dataPoints[j].value) {
                    // If the condition is true then swap them
                    VIEWPORT.push(new element(new transit(data.dataPoints[j - 1], j - 1, j), renderTransit, updateTransit, null, true));
                    VIEWPORT.push(new element( new transit(data.dataPoints[j], j, j - 1), renderTransit, updateTransit, null, true));
                    var tempObj = data.dataPoints[j - 1];
                    data.dataPoints[j - 1] = data.dataPoints[j];
                    data.dataPoints[j] = tempObj;
                }
            }
        }
    }

    this.mergeSort = function() {

        var _mergeSort = function(array, left, right) {

            if (left >= right) {

                return;
            }
            var mid = parseInt((left + right) / 2);
            _mergeSort(array, left, mid);
            _mergeSort(array, (mid + 1), right);
            _merge(array, left, mid, right);
        }

        var _merge = function(array, left, mid, right) {

            var n1 = mid - left + 1;
            var n2 = right - mid;

            var leftArray = new Array(n1);
            var rightArray = new Array(n2);

            for (var i = 0;i < n1;i ++) {

                leftArray[i] = array[left + i];
            }

            for (var j = 0;j < n2;j ++) {

                rightArray[j] = array[mid + 1 + j];
            }

            var i = 0;
            var j = 0;
            var k = left;

            while(i < n1 && j < n2) {

                if (leftArray[i].value <= rightArray[j].value) {

                    array[k] = leftArray[i];
                    VIEWPORT.push(new element(new transit(leftArray[i], leftArray[i].index, k), renderTransit, updateTransit, null, true));
                    i++;
                } else {

                    array[k] = rightArray[j];
                    VIEWPORT.push(new element(new transit(rightArray[j], rightArray[j].index, k), renderTransit, updateTransit, null, true));
                    j++;
                }
                k++;
            }

            while (i < n1) {

                array[k] = leftArray[i];
                VIEWPORT.push(new element(new transit(leftArray[i], leftArray[i].index, k), renderTransit, updateTransit, null, true));
                i++;
                k++;
            }

            while (j < n2) {

                array[k] = rightArray[j];
                VIEWPORT.push(new element(new transit(rightArray[j], rightArray[j].index, k), renderTransit, updateTransit, null, true));
                j++;
                k++;
            }
        }

        _mergeSort(data.dataPoints, 0, (data.dataPoints.length - 1));
    }

    this.insertionSort = function() {

        for (var i = 0;i < arraySize;i ++) {

            var val = data.dataPoints[i];
            var j = i - 1;

            while (j >= 0 && data.dataPoints[j].value > val.value) {

                data.dataPoints[j + 1] = data.dataPoints[j];
                VIEWPORT.push(new element(new transit(data.dataPoints[j], j, j + 1), renderTransit, updateTransit, null, true));
                j = j - 1;
            }
            data.dataPoints[j + 1] = val;
            VIEWPORT.push(new element(new transit(val, val.index, j + 1), renderTransit, updateTransit, null, true));
        }
    }

    this.heapSort = function() {

        var _sort = function(arr) {

            var n = arr.length;
            // Build heap (rearrange array)
            for (var i = parseInt(n / 2 - 1); i >= 0; i--) {

                _heapify(arr, n, i);
            }
            // One by one extract an element from heap
            for (var i = n - 1; i > 0; i--) {

                // Move current root to end
                VIEWPORT.push(new element(new transit(arr[i], i, 0), renderTransit, updateTransit, null, true));
                VIEWPORT.push(new element(new transit(arr[0], 0, i), renderTransit, updateTransit, null, true));
                var temp = arr[0];
                arr[0] = arr[i];
                arr[i] = temp;
                // call max heapify on the reduced heap
                _heapify(arr, i, 0);
            }
        }

        var _heapify = function (arr, n, i) {

            var largest = i; // Initialize largest as root
            var l = 2 * i + 1; // left = 2*i + 1
            var r = 2 * i + 2; // right = 2*i + 2

            // If left child is larger than root
            if (l < n && arr[l].value > arr[largest].value) {

                largest = l;
            }

            // If right child is larger than largest so far
            if (r < n && arr[r].value > arr[largest].value) {

                largest = r;
            }

            // If largest is not root
            if (largest != i) {

                VIEWPORT.push(new element(new transit(arr[largest], largest, i), renderTransit, updateTransit, null, true));
                VIEWPORT.push(new element(new transit(arr[i], i, largest), renderTransit, updateTransit, null, true));
                var swap = arr[i];
                arr[i] = arr[largest];
                arr[largest] = swap;
                // Recursively heapify the affected sub-tree
                _heapify(arr, n, largest);
            }
        }

        _sort(data.dataPoints);
    }

    this.selectionSort = function() {
    }
}

function dataSet() {

    this.dataPoints = [];
    for (let i = 0;i < arraySize;i ++) {

        this.dataPoints.push(

            new dataPoint(i, randInt(ELEMENT_MIN_VALUE, ELEMENT_MAX_VALUE, true))
        );
    }
}

function dataPoint(index, value) {

    this.index = index;
    this.value = value;
    this.width = elementWidth;
    this.height = value;
    this.r = randInt(113, 222);
    this.g = '00';
    this.b = randInt(105, 255);
    this.xPos = index * elementWidth;
    this.yPos = CANVAS.height - value;

    this.updateIndex =  function (newIndex) {

        this.index = newIndex;
        this.xPos = newIndex * elementWidth;
    }

    this.updateXPos = function (newXPos) {

        this.xPos = newXPos;
    }
}

function transit(dataPoint, oldIndex, newIndex) {

    this.dataPoint = dataPoint;
    this.oldIndex = oldIndex;
    this.newIndex = newIndex;
    this.oldXPos = oldIndex * elementWidth;
    this.newXPos = newIndex * elementWidth;
}

function randInt(min, max, positive) {

  let num;
  if (positive === false) {

    num = Math.floor(Math.random() * max) - min;
    num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
  } else {

    num = Math.floor(Math.random() * max) + min;
  }
  return num;
}

$('#startBtn').on('click', function (e) {

  start(e);
});

$('#resetBtn').on('click', function (e) {

  reset(e);
});

$('#arraySize').on('change', function (e) {

  reset(e);
});

$('#speed').on('change', function (e) {

    speed = parseInt(document.getElementById('speed').value);
    if (speed == 100) {

        turbo = true;
    }
});

function start(e) {

    if (!isRunning) {

        isRunning = true;
        var sortType = document.getElementById('sortingAlgo').value;
        if (sortType == BUBBLE_SORT) {

            SORT.bubbleSort();
        } else if (sortType == MERGE_SORT) {

            SORT.mergeSort();
        } else if (sortType == INSERTION_SORT) {

            SORT.insertionSort();
        } else if (sortType == HEAP_SORT) {

            SORT.heapSort();
        } else if (sortType == SELECTION_SORT) {

            SORT.selectionSort();
        }
        viewPortRenderingEnabled = true;
        draw();
    }
}

function reset(e) {

    window.cancelAnimationFrame(animation);
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    VIEWPORT.splice(0, VIEWPORT.length);
    isRunning = false;
    viewPortRenderingEnabled = false;
    initialized = false;
    done = false;
    document.getElementById('speed').selectedIndex = 0;
    speed = parseInt(document.getElementById('speed').value);
    arraySize = parseInt(document.getElementById('arraySize').value);
    elementWidth = CANVAS.width / arraySize;
    turbo = false;
    data = new dataSet();
    draw();
}

draw();