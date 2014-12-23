var lock = require('pointer-lock')
  , fullscreen = require('fullscreen')
  , through = require('through')
  , min = Math.min
  , max = Math.max

module.exports = trap

function trap(element, mode) {
  var write;
  switch(mode) {
    case 'deltas':
      write = writeDeltas;
      break;
    case 'clamped':
      write = writeClamped;
      break;
    case 'unclamped':
      write = writeUnclamped;
      break;
    default:
      write = writeDeltas;
  }

  var pointer = lock(element)
    , output = through(write)
    , pos = output.pos = {}

  output.trapped = false

  element.style.cursor = 'none'
  var lastX, lastY, move = {dx:0, dy:0};
  element.addEventListener('mousemove', function(e) {
    if (output.trapped) return
    if(lastX === undefined) lastX = e.offsetX; 
    if(lastY === undefined) lastY = e.offsetY;
    move.dx = lastX - e.offsetX;
    move.dy = lastY - e.offsetY;
    lastX = e.offsetX;
    lastY = e.offsetY;
    output.write(move);
  })

  element.addEventListener('click', function(e) {
    if (output.trapped) return
    pos.x = e.offsetX
    pos.y = e.offsetY
    pointer.request()
  })

  pointer.on('attain', function(movements) {
    output.trapped = true
    movements.pipe(output, { end: false })
  })

  pointer.on('release', function() {
    output.trapped = false
  })

  pointer.on('error', function(e) {
    output.trapped = false
  })

  // workaround for browsers which only
  // allow pointer lock in fullscreen mode.
  pointer.on('fullscreen', function() {
    var fs = fullscreen(element)
    fs.once('attain', function() {
      pointer.request()
    }).request()
  })

  function writeClamped(move) {
    pos.x += move.dx
    pos.y += move.dy
    pos.x = min(max(pos.x, 0), element.clientWidth)
    pos.y = min(max(pos.y, 0), element.clientHeight)
    this.queue(pos)
  }

  function writeUnclamped(move) {
    pos.x += move.dx
    pos.y += move.dy
    this.queue(pos)
  }

  function writeDeltas(move) {
    pos.x = move.dx
    pos.y = move.dy
    this.queue(pos)
  }

  return output
}
